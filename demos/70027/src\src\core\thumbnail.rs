use std::collections::HashMap;
use std::sync::Mutex;
use std::collections::hash_map::DefaultHasher;
use std::hash::{Hash, Hasher};
use std::sync::OnceLock;
use std::io::{Read, Seek, SeekFrom};
use image::imageops::FilterType;
use image::ImageReader;

struct ThumbCache {
    map: HashMap<u64, (Vec<u8>, usize, usize)>,
}

impl ThumbCache {
    fn new() -> Self {
        Self { map: HashMap::with_capacity(512) }
    }
}

fn cache() -> &'static Mutex<ThumbCache> {
    static C: OnceLock<Mutex<ThumbCache>> = OnceLock::new();
    C.get_or_init(|| Mutex::new(ThumbCache::new()))
}

fn hash_key(path: &str, max_size: u32) -> u64 {
    let mut h = DefaultHasher::new();
    path.hash(&mut h);
    max_size.hash(&mut h);
    h.finish()
}

/// 生成缩略图：(RGBA, 宽, 高)
/// JPEG: 优先读取 EXIF 内嵌缩略图（毫秒级），没有则回退到全图解码
/// 其他格式: 正常解码 + 缩小
pub fn generate_thumbnail(path: &str, max_size: u32) -> Result<(Vec<u8>, usize, usize), String> {
    let key = hash_key(path, max_size);
    {
        let c = cache().lock().map_err(|e| e.to_string())?;
        if let Some(v) = c.map.get(&key) { return Ok(v.clone()); }
    }

    let result = if is_jpeg(path) {
        try_exif_thumbnail(path, max_size)
            .unwrap_or_else(|| decode_and_resize(path, max_size))
    } else {
        decode_and_resize(path, max_size)
    }?;

    // 存入缓存
    if let Ok(mut c) = cache().lock() {
        if c.map.len() > 1024 {
            let keys: Vec<u64> = c.map.keys().copied().collect();
            for k in keys.iter().take(512) { c.map.remove(k); }
        }
        c.map.insert(key, result.clone());
    }

    Ok(result)
}

/// 判断是否为 JPEG 文件
fn is_jpeg(path: &str) -> bool {
    let lower = path.to_lowercase();
    lower.ends_with(".jpg") || lower.ends_with(".jpeg")
}

/// 尝试从 EXIF 中提取内嵌 JPEG 缩略图
fn try_exif_thumbnail(path: &str, max_size: u32) -> Option<Result<(Vec<u8>, usize, usize), String>> {
    use exif::{Reader, Tag, In};

    let file = std::fs::File::open(path).ok()?;
    let file_len = file.metadata().ok()?.len();

    // step 1: 读入 JPEG 文件头部，定位 APP1 标记
    let mut buf = vec![0u8; 65536.min(file_len as usize)]; // 只读前 64KB
    let mut file = file;
    file.read_exact(&mut buf).ok()?;

    // step 2: 用 kamadak-exif 解析
    let mut cursor = std::io::Cursor::new(&buf[..]);
    let exif = Reader::new().read_from_container(&mut cursor).ok()?;

    // step 3: 获取 IFD1 中的缩略图偏移量和长度
    let offset_field = exif.get_field(Tag::JPEGInterchangeFormat, In::THUMBNAIL)?;
    let length_field = exif.get_field(Tag::JPEGInterchangeFormatLength, In::THUMBNAIL)?;

    let offset = offset_field.value.get_uint(0)? as u64;
    let length = length_field.value.get_uint(0)? as usize;

    if length == 0 || length > 1_000_000 { return None; }

    // step 4: 从文件中读取缩略图 JPEG 字节
    // TIFF header 通常在 APP1 marker 之后 10 字节处（"Exif\0\0" + TIFF header）
    // 但 offset 是相对于 TIFF header 的
    // 查找 APP1 marker 位置来确定 TIFF header 位置
    let tiff_offset = find_tiff_header(&buf)? as u64;

    let thumb_start = tiff_offset + offset;
    if thumb_start + length as u64 > file_len { return None; }

    let mut file = std::fs::File::open(path).ok()?;
    file.seek(SeekFrom::Start(thumb_start)).ok()?;
    let mut jpeg_data = vec![0u8; length];
    file.read_exact(&mut jpeg_data).ok()?;

    // step 5: 解码缩略图 JPEG
    let img = image::load_from_memory(&jpeg_data).ok()?;
    let (w, h) = (img.width(), img.height());

    // 如果缩略图已经够小，直接使用；否则缩小
    let rgba = if w <= max_size && h <= max_size {
        img.to_rgba8()
    } else {
        let thumb = img.resize(max_size, max_size, FilterType::Nearest);
        thumb.to_rgba8()
    };

    let (w, h) = (rgba.width(), rgba.height());
    let pixels = rgba.into_raw();
    Some(Ok((pixels, w as usize, h as usize)))
}

/// 在 JPEG 文件头部查找 TIFF header 的字节偏移
fn find_tiff_header(buf: &[u8]) -> Option<usize> {
    // JPEG APP1 marker: FF E1, followed by length (2 bytes), then "Exif\0\0"
    let mut i = 2; // 跳过 SOI (FF D8)
    while i + 4 < buf.len() {
        if buf[i] == 0xFF {
            let marker = buf[i + 1];
            if marker == 0xE1 {
                // APP1 found, the TIFF header starts at i + 10
                // (2 bytes FF E1 + 2 bytes length + 6 bytes "Exif\0\0")
                if i + 10 < buf.len() {
                    return Some(i + 10);
                }
            } else if marker == 0xD8 || marker == 0xD9 {
                // SOI or EOI, skip
            } else if (0xD0..=0xD7).contains(&marker) {
                // RST markers, skip
            } else {
                // Other markers: skip the segment
                if i + 4 <= buf.len() {
                    let seg_len = ((buf[i + 2] as usize) << 8) | (buf[i + 3] as usize);
                    i += 2 + seg_len;
                    continue;
                }
            }
        }
        i += 1;
    }
    None
}

/// 标准解码 + 缩小（PNG/WebP/无 EXIF 缩略图的 JPEG）
fn decode_and_resize(path: &str, max_size: u32) -> Result<(Vec<u8>, usize, usize), String> {
    let img = ImageReader::open(path)
        .map_err(|e| format!("打开失败: {e}"))?
        .with_guessed_format()
        .map_err(|e| format!("格式错误: {e}"))?
        .decode()
        .map_err(|e| format!("解码失败: {e}"))?;

    let thumb = if img.width() <= max_size && img.height() <= max_size {
        img.to_rgba8()
    } else {
        let t = img.resize(max_size, max_size, FilterType::Nearest);
        t.to_rgba8()
    };

    let (w, h) = (thumb.width(), thumb.height());
    Ok((thumb.into_raw(), w as usize, h as usize))
}

/// 大图解码：始终解码原始全图，不使用 EXIF 内嵌缩略图
/// 解码后等比缩放至 max_size 以内（保持宽高比），使用高质量 Lanczos3 滤波器
pub fn decode_full_image(path: &str, max_size: u32) -> Result<(Vec<u8>, usize, usize), String> {
    let img = ImageReader::open(path)
        .map_err(|e| format!("打开失败: {e}"))?
        .with_guessed_format()
        .map_err(|e| format!("格式错误: {e}"))?
        .decode()
        .map_err(|e| format!("解码失败: {e}"))?;

    let (w, h) = (img.width(), img.height());

    let result = if w <= max_size && h <= max_size {
        img.to_rgba8()
    } else {
        // 等比缩放：以长边为基准，保持宽高比
        let scale = max_size as f64 / w.max(h) as f64;
        let nw = (w as f64 * scale) as u32;
        let nh = (h as f64 * scale) as u32;
        img.resize(nw, nh, FilterType::Lanczos3).to_rgba8()
    };

    let (rw, rh) = (result.width() as usize, result.height() as usize);
    Ok((result.into_raw(), rw, rh))
}

pub fn clear_cache() {
    if let Ok(mut c) = cache().lock() { c.map.clear(); }
}
