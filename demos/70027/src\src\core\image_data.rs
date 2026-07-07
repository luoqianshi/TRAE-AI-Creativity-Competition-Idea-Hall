use std::path::Path;
use serde::{Deserialize, Serialize};

pub const SUPPORTED_EXTS: &[&str] = &[
    "jpg", "jpeg", "png", "webp", "gif", "bmp", "tiff", "tif",
    "cr2", "nef", "arw", "dng", "raf", "orf", "rw2", "pef", "srw", "x3f",
];

pub const RAW_EXTS: &[&str] = &[
    "cr2", "nef", "arw", "dng", "raf", "orf", "rw2", "pef", "srw", "x3f",
];

pub const NATIVE_EXTS: &[&str] = &["jpg", "jpeg", "png", "webp", "gif", "bmp", "tiff", "tif"];

#[inline]
pub fn is_supported(path: &str) -> bool {
    Path::new(path)
        .extension()
        .and_then(|e| e.to_str())
        .map(|e| SUPPORTED_EXTS.contains(&e.to_lowercase().as_str()))
        .unwrap_or(false)
}

#[inline]
pub fn is_raw(path: &str) -> bool {
    Path::new(path)
        .extension()
        .and_then(|e| e.to_str())
        .map(|e| RAW_EXTS.contains(&e.to_lowercase().as_str()))
        .unwrap_or(false)
}

/// 单张图片元数据
#[derive(Clone, Serialize, Deserialize)]
pub struct ImageItem {
    pub id:          u64,
    pub path:        String,
    pub name:        String,
    pub format:      String,
    pub removed:     bool,
    pub rating:      u8,
    pub group_id:    i32,
    pub feature_vec: Option<Vec<f64>>,
}

impl ImageItem {
    pub fn new(id: u64, path: String) -> Self {
        let name = Path::new(&path)
            .file_name()
            .map(|n| n.to_string_lossy().to_string())
            .unwrap_or_default();
        let format = Path::new(&path)
            .extension()
            .map(|e| e.to_string_lossy().to_lowercase())
            .unwrap_or_default();
        Self {
            id, path, name, format,
            removed: false, rating: 0, group_id: -1,
            feature_vec: None,
        }
    }
}

/// 分组信息
#[derive(Clone, Default)]
pub struct GroupInfo {
    pub id:    i32,
    pub name:  String,
    pub count: usize,
}

/// 核心状态（纯数据）
pub struct ImageState {
    pub images:        Vec<ImageItem>,
    pub current_idx:   usize,
    pub removed_stack: Vec<(u64, usize)>,
    pub groups:        Vec<GroupInfo>,
    pub has_groups:    bool,
    pub id_counter:    u64,
}

impl Default for ImageState {
    fn default() -> Self {
        Self {
            images: Vec::new(), current_idx: 0,
            removed_stack: Vec::new(), groups: Vec::new(),
            has_groups: false, id_counter: 0,
        }
    }
}

impl ImageState {
    pub fn next_id(&mut self) -> u64 {
        self.id_counter += 1;
        self.id_counter
    }

    pub fn reset(&mut self) {
        self.images.clear();
        self.current_idx = 0;
        self.removed_stack.clear();
        self.groups.clear();
        self.has_groups = false;
        self.id_counter = 0;
    }

    pub fn append_images(&mut self, paths: Vec<String>) {
        for p in paths {
            let id = self.next_id();
            self.images.push(ImageItem::new(id, p));
        }
    }

    pub fn remove_current(&mut self) {
        if self.current_idx >= self.images.len() { return; }
        let img = &mut self.images[self.current_idx];
        if img.removed { return; }
        img.removed = true;
        self.removed_stack.push((img.id, self.current_idx));
        self.jump_to_next_valid();
    }

    pub fn restore_last(&mut self) {
        if let Some((id, _)) = self.removed_stack.pop() {
            if let Some(img) = self.images.iter_mut().find(|i| i.id == id) {
                img.removed = false;
            }
        }
    }

    fn advance(&mut self, step: isize) {
        let len = self.images.len() as isize;
        if len == 0 { return; }
        let mut idx = self.current_idx as isize;
        for _ in 0..len {
            idx = (idx + step + len) % len;
            if !self.images[idx as usize].removed {
                self.current_idx = idx as usize;
                return;
            }
        }
    }

    pub fn jump_to_next_valid(&mut self) { self.advance(1); }
    pub fn jump_to_prev_valid(&mut self) { self.advance(-1); }

    pub fn set_rating(&mut self, rating: u8) {
        if let Some(img) = self.images.get_mut(self.current_idx) {
            if !img.removed { img.rating = rating; }
        }
    }

    pub fn sort_by_rating(&mut self) {
        let mut imgs = self.images.clone();
        imgs.sort_by(|a, b| {
            let ra = if a.removed { 0 } else { a.rating as u32 };
            let rb = if b.removed { 0 } else { b.rating as u32 };
            rb.cmp(&ra)
        });
        self.images = imgs;
        self.current_idx = 0;
    }

    pub fn visible_count(&self) -> usize {
        self.images.iter().filter(|i| !i.removed).count()
    }

    pub fn retained_paths(&self) -> Vec<String> {
        self.images.iter().filter(|i| !i.removed).map(|i| i.path.clone()).collect()
    }

    pub fn current_image(&self) -> Option<&ImageItem> {
        self.images.get(self.current_idx).filter(|i| !i.removed)
    }
}
