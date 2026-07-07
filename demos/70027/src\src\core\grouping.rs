/// 图片分组（基于颜色直方图 + 余弦相似度）

use crate::core::image_data::ImageItem;
use crate::core::thumbnail::generate_thumbnail;

pub type FeatureVec = [f64; 64];

fn extract_feature(path: &str) -> Option<FeatureVec> {
    let (pixels, _w, _h) = generate_thumbnail(path, 64).ok()?;
    let mut hist = [0.0f64; 64];
    let mut count = 0u64;
    for chunk in pixels.chunks(4) {
        if chunk.len() < 4 { continue; }
        let ri = (chunk[0] as usize * 4 / 256).min(3);
        let gi = (chunk[1] as usize * 4 / 256).min(3);
        let bi = (chunk[2] as usize * 4 / 256).min(3);
        hist[ri * 16 + gi * 4 + bi] += 1.0;
        count += 1;
    }
    if count == 0 { return None; }
    for v in hist.iter_mut() { *v /= count as f64; }
    Some(hist)
}

fn cosine_sim(a: &FeatureVec, b: &FeatureVec) -> f64 {
    let mut dot = 0.0;
    let mut na = 0.0;
    let mut nb = 0.0;
    for i in 0..64 {
        dot += a[i] * b[i];
        na += a[i] * a[i];
        nb += b[i] * b[i];
    }
    let denom = (na * nb).sqrt();
    if denom < 1e-10 { 0.0 } else { dot / denom }
}

/// 贪心相似度分组，返回每个图片的 group_id
pub fn group_by_similarity(items: &[ImageItem], threshold: f64) -> Vec<i32> {
    let n = items.len();
    let mut labels: Vec<i32> = vec![-1; n];
    let feats: Vec<Option<FeatureVec>> = items.iter().map(|i| extract_feature(&i.path)).collect();
    let mut group_id = 0i32;

    for i in 0..n {
        if labels[i] != -1 { continue; }
        let Some(ref fi) = feats[i] else { continue; };
        labels[i] = group_id;
        for j in (i + 1)..n {
            if labels[j] != -1 { continue; }
            if let Some(ref fj) = feats[j] {
                if cosine_sim(fi, fj) >= threshold { labels[j] = group_id; }
            }
        }
        group_id += 1;
    }
    labels
}
