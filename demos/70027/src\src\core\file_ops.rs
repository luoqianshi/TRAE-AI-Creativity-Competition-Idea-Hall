use std::path::Path;
use std::fs;
use crate::core::image_data::is_supported;

/// 递归扫描目录
pub fn scan_directory(dir: &str) -> Vec<String> {
    let mut result = Vec::new();
    scan_recursive(Path::new(dir), &mut result);
    result.sort();
    result
}

fn scan_recursive(path: &Path, out: &mut Vec<String>) {
    if !path.is_dir() { return; }
    let Ok(entries) = fs::read_dir(path) else { return; };
    for entry in entries.flatten() {
        let p = entry.path();
        if p.is_dir() {
            if let Some(name) = p.file_name().and_then(|n| n.to_str()) {
                if name.starts_with('.') || name.starts_with('$') { continue; }
            }
            scan_recursive(&p, out);
        } else if p.to_str().map(is_supported).unwrap_or(false) {
            out.push(p.to_string_lossy().to_string());
        }
    }
}

/// 复制文件到目标目录
pub fn copy_files_to_dir(files: &[String], dest_dir: &str) -> Result<(), String> {
    let dest = Path::new(dest_dir);
    if !dest.exists() {
        fs::create_dir_all(dest).map_err(|e| format!("创建目录失败: {e}"))?;
    }
    for file in files {
        let src = Path::new(file);
        let Some(name) = src.file_name() else { continue };
        let target = dest.join(name);
        fs::copy(src, &target).map_err(|e| format!("复制失败 {file}: {e}"))?;
    }
    Ok(())
}
/// 检测所有可用磁盘分区
pub fn list_drives() -> Vec<(String, String)> {
    let mut drives = Vec::new();
    for letter in b'A'..=b'Z' {
        let path = format!("{}:\\", letter as char);
        if Path::new(&path).exists() {
            drives.push((format!("{}盘", letter as char), path));
        }
    }
    drives
}

/// 列出单个目录的内容
pub fn list_dir(path: &str) -> Vec<(String, String, bool)> {
    let Ok(entries) = fs::read_dir(path) else { return Vec::new(); };
    let mut result = Vec::new();
    for entry in entries.flatten() {
        let p = entry.path();
        let Some(name) = p.file_name().and_then(|n| n.to_str()) else { continue };
        if name.starts_with('.') || name.starts_with('$') { continue; }
        result.push((name.to_string(), p.to_string_lossy().to_string(), p.is_dir()));
    }
    result.sort_by(|a, b| match (a.2, b.2) {
        (true, false) => std::cmp::Ordering::Less,
        (false, true) => std::cmp::Ordering::Greater,
        _ => a.0.cmp(&b.0),
    });
    result
}
