//! Win32 原生窗口 — GDI 双缓冲渲染缩略图网格 + 大图浏览模式
#![allow(unused_imports)]

use std::collections::HashMap;
use std::mem;
use std::sync::mpsc::{self, Receiver, Sender};
use std::sync::{Arc, Mutex};

use windows::core::*;
use windows::Win32::Foundation::*;
use windows::Win32::Graphics::Gdi::*;
use windows::Win32::System::Com::*;
use windows::Win32::System::LibraryLoader::GetModuleHandleW;
use windows::Win32::UI::Input::KeyboardAndMouse::*;
use windows::Win32::UI::Shell::*;
use windows::Win32::UI::WindowsAndMessaging::*;

use crate::core::{decode_full_image, generate_thumbnail, ImageItem, ImageState};

// ── 布局常量 ──
const PADDING: i32 = 8;
const SPACING: i32 = 6;
const TOOLBAR_H: i32 = 38;
const STATUSBAR_H: i32 = 22;
const SCROLLBAR_W: i32 = 14;

// ── 工具栏按钮 ──
#[derive(Clone, Copy, PartialEq)]
enum ToolButton {
    OpenFolder,
    Save,
    Sort,
    ToggleView,
    Clear,
}

struct ToolBtnLayout {
    x: i32,
    w: i32,
    label: String,
    action: ToolButton,
}

fn toolbar_layout(view_mode: ViewMode) -> Vec<ToolBtnLayout> {
    let view_label = match view_mode {
        ViewMode::Grid => "Space 大图",
        ViewMode::FullImage => "Space 网格",
    };
    let defs: Vec<(&str, ToolButton)> = vec![
        ("F 选文件夹", ToolButton::OpenFolder),
        ("S 保存", ToolButton::Save),
        ("R 排序", ToolButton::Sort),
        (view_label, ToolButton::ToggleView),
        ("点击清空", ToolButton::Clear),
    ];
    let mut x = PADDING;
    let mut out = Vec::new();
    for (label, action) in &defs {
        let w = label.len() as i32 * 10 + 12;
        out.push(ToolBtnLayout {
            x,
            w,
            label: label.to_string(),
            action: *action,
        });
        x += w + SPACING;
    }
    out
}
const CELL_MIN: u32 = 90;
const CELL_MAX: u32 = 280;
const THUMB_SIZE: u32 = 200;
const WORKER_COUNT: usize = 8;
const MAX_IMAGES: usize = 10_000;
const TIMER_ID: usize = 1;
const FONT_SIZE: i32 = 14;
const FULL_PRELOAD_AHEAD: usize = 2; // 大图模式预加载前后各 N 张

// ── 视图模式 ──
#[derive(Clone, Copy, PartialEq)]
enum ViewMode {
    Grid,
    FullImage,
}

// ── 大图缓存项 ──
struct FullImageEntry {
    bmp: HBITMAP,
    orig_w: i32,
    orig_h: i32,
}

// ── 窗口状态 ──
struct WindowState {
    images: ImageState,
    thumb_cache: HashMap<u64, HBITMAP>,
    full_cache: HashMap<u64, FullImageEntry>, // 大图预加载缓存
    thumb_req_tx: Sender<(u64, String, u32)>,
    thumb_res_rx: Receiver<(u64, Vec<u8>, u32, u32)>,
    full_req_tx: Sender<(u64, String)>,
    full_res_rx: Receiver<(u64, std::result::Result<(Vec<u8>, u32, u32), String>)>,
    scan_rx: Option<Receiver<Vec<String>>>,
    scroll_y: i32,
    cols: usize,
    cell: u32,
    total_rows: usize,
    max_scroll: i32,
    status: String,
    loading: bool,
    view_mode: ViewMode,
    dirty: bool,
    hfont: HFONT,
    brush_bar: HBRUSH,
    brush_bg: HBRUSH,
    brush_sel: HBRUSH,
    brush_grey: HBRUSH,
}

// ── 类型别名 ──
type HGDIO = HGDIOBJ;

// ============ 窗口过程 ============
unsafe extern "system" fn wnd_proc(
    hwnd: HWND,
    msg: u32,
    wparam: WPARAM,
    lparam: LPARAM,
) -> LRESULT {
    match msg {
        WM_CREATE => on_create(hwnd),
        WM_SIZE => {
            on_size(hwnd);
            LRESULT(0)
        }
        WM_ERASEBKGND => LRESULT(1), // 阻止系统擦除背景，消除闪烁
        WM_PAINT => {
            on_paint(hwnd);
            LRESULT(0)
        }
        WM_TIMER => {
            on_timer(hwnd);
            LRESULT(0)
        }
        WM_KEYDOWN => {
            on_key(hwnd, wparam);
            LRESULT(0)
        }
        WM_LBUTTONDOWN => {
            on_click(hwnd, lparam);
            LRESULT(0)
        }
        WM_MOUSEWHEEL => {
            on_wheel(hwnd, wparam);
            LRESULT(0)
        }
        WM_DESTROY => {
            on_destroy(hwnd);
            LRESULT(0)
        }
        _ => DefWindowProcW(hwnd, msg, wparam, lparam),
    }
}

unsafe fn state_mut(hwnd: HWND) -> &'static mut WindowState {
    let ptr = GetWindowLongPtrW(hwnd, GWLP_USERDATA) as *mut WindowState;
    &mut *ptr
}

// ============ WM_CREATE ============
unsafe fn on_create(hwnd: HWND) -> LRESULT {
    let hfont = CreateFontW(
        FONT_SIZE,
        0,
        0,
        0,
        FW_NORMAL.0 as i32,
        0,
        0,
        0,
        DEFAULT_CHARSET,
        OUT_DEFAULT_PRECIS,
        CLIP_DEFAULT_PRECIS,
        DEFAULT_QUALITY,
        (DEFAULT_PITCH.0 | FF_DONTCARE.0) as u32,
        w!("Microsoft YaHei"),
    );
    let brush_bar = CreateSolidBrush(COLORREF(0xF0_F0_F0));
    let brush_bg = CreateSolidBrush(COLORREF(0xFF_FF_FF));
    let brush_sel = CreateSolidBrush(COLORREF(0x33_99_FF));
    let brush_grey = CreateSolidBrush(COLORREF(0xCC_CC_CC));

    // 后台缩略图 worker
    let (req_tx, req_rx) = mpsc::channel::<(u64, String, u32)>();
    let (res_tx, res_rx) = mpsc::channel::<(u64, Vec<u8>, u32, u32)>();
    let rx = Arc::new(Mutex::new(req_rx));
    for i in 0..WORKER_COUNT {
        let rx = Arc::clone(&rx);
        let tx = res_tx.clone();
        std::thread::Builder::new()
            .name(format!("thumb-{i}"))
            .spawn(move || loop {
                let (id, path, max_sz) = match rx.lock().unwrap().recv() {
                    Ok(v) => v,
                    Err(_) => break,
                };
                if let Ok((pixels, w, h)) = generate_thumbnail(&path, max_sz) {
                    let _ = tx.send((id, pixels, w as u32, h as u32));
                }
            })
            .ok();
    }

    // 后台大图解码 worker（独立队列）
    let (full_req_tx, full_req_rx) = mpsc::channel::<(u64, String)>();
    let (full_res_tx, full_res_rx) =
        mpsc::channel::<(u64, std::result::Result<(Vec<u8>, u32, u32), String>)>();
    let full_rx = Arc::new(Mutex::new(full_req_rx));
    for i in 0..4 {
        let rx = Arc::clone(&full_rx);
        let tx = full_res_tx.clone();
        std::thread::Builder::new()
            .name(format!("full-{i}"))
            .spawn(move || loop {
                let (id, path) = match rx.lock().unwrap().recv() {
                    Ok(v) => v,
                    Err(_) => break,
                };
                // 大图：始终解码原图，不使用 EXIF 缩略图（最大尺寸 4096）
                let result =
                    decode_full_image(&path, 4096).map(|(p, w, h)| (p, w as u32, h as u32));
                let _ = tx.send((id, result));
            })
            .ok();
    }

    let state = Box::new(WindowState {
        images: ImageState::default(),
        thumb_cache: HashMap::with_capacity(256),
        full_cache: HashMap::with_capacity(16),
        thumb_req_tx: req_tx,
        thumb_res_rx: res_rx,
        full_req_tx,
        full_res_rx,
        scan_rx: None,
        scroll_y: 0,
        cols: 4,
        cell: CELL_MIN,
        total_rows: 0,
        max_scroll: 0,
        status: String::from("就绪 — 按 F 选择文件夹, Space 切换大图模式"),
        loading: false,
        view_mode: ViewMode::Grid,
        dirty: true,
        hfont,
        brush_bar,
        brush_bg,
        brush_sel,
        brush_grey,
    });

    SetWindowLongPtrW(hwnd, GWLP_USERDATA, Box::into_raw(state) as isize);
    SetTimer(Some(hwnd), TIMER_ID, 33, None);
    LRESULT(0)
}

// ============ WM_SIZE ============
unsafe fn on_size(hwnd: HWND) {
    let st = state_mut(hwnd);
    let mut r = RECT::default();
    GetClientRect(hwnd, &mut r);
    let cw = r.right - r.left;
    st.cols = ((cw as u32).saturating_sub(SCROLLBAR_W as u32 + 2 * PADDING as u32)
        / (CELL_MIN + SPACING as u32)) as usize;
    if st.cols < 2 {
        st.cols = 2;
    }
    if st.cols > 8 {
        st.cols = 8;
    }
    let avail = (cw - SCROLLBAR_W - 2 * PADDING) as u32;
    st.cell = avail.saturating_sub((st.cols as u32 - 1) * SPACING as u32) / st.cols as u32;
    if st.cell > CELL_MAX {
        st.cell = CELL_MAX;
    }
    let row_h = st.cell as i32 + 22;
    let visible = st.images.images.iter().filter(|im| !im.removed).count();
    st.total_rows = if st.cols > 0 && visible > 0 {
        (visible + st.cols - 1) / st.cols
    } else {
        0
    };
    let mut cr = RECT::default();
    GetClientRect(hwnd, &mut cr);
    let content_h = cr.bottom - cr.top - TOOLBAR_H - STATUSBAR_H;
    st.max_scroll = (st.total_rows as i32 * row_h).saturating_sub(content_h);
    if st.max_scroll < 0 {
        st.max_scroll = 0;
    }
    if st.scroll_y > st.max_scroll {
        st.scroll_y = st.max_scroll;
    }
    st.dirty = true;
    InvalidateRect(Some(hwnd), None, false);
}

// ── UTF-16 辅助 ──
fn to_wide(s: &str) -> Vec<u16> {
    s.encode_utf16().chain(std::iter::once(0)).collect()
}

// ============ WM_PAINT（双缓冲渲染）============
unsafe fn on_paint(hwnd: HWND) {
    let mut ps = PAINTSTRUCT::default();
    let screen_dc = BeginPaint(hwnd, &mut ps);

    let mut cr = RECT::default();
    GetClientRect(hwnd, &mut cr);
    let cw = cr.right - cr.left;
    let ch = cr.bottom - cr.top;

    // —— 创建双缓冲：内存 DC + 兼容位图 ——
    let mem_dc = CreateCompatibleDC(Some(screen_dc));
    let bmp = CreateCompatibleBitmap(screen_dc, cw, ch);
    if bmp.is_invalid() || mem_dc.is_invalid() {
        EndPaint(hwnd, &ps);
        return;
    }
    let old_bmp = SelectObject(mem_dc, HGDIO::from(bmp));

    // 所有绘制操作在 mem_dc 上完成
    let st = state_mut(hwnd);
    let old_font = SelectObject(mem_dc, HGDIO::from(st.hfont));

    // 背景
    FillRect(mem_dc, &cr, st.brush_bar);

    match st.view_mode {
        ViewMode::Grid => paint_grid(mem_dc, st, cw, ch),
        ViewMode::FullImage => paint_full_image(mem_dc, st, cw, ch),
    }

    // ─ 工具栏（两种模式共用） ─
    paint_toolbar(mem_dc, st, cw);

    // ─ 状态栏（两种模式共用） ─
    paint_statusbar(mem_dc, st, cw, ch);

    // —— 一次性 Blit 到屏幕 ——
    BitBlt(screen_dc, 0, 0, cw, ch, Some(mem_dc), 0, 0, SRCCOPY);

    // 清理
    SelectObject(mem_dc, old_font);
    SelectObject(mem_dc, old_bmp);
    DeleteObject(HGDIO::from(bmp));
    DeleteDC(mem_dc);
    EndPaint(hwnd, &ps);
}

// ─── 工具栏绘制 ───
unsafe fn paint_toolbar(dc: HDC, st: &WindowState, cw: i32) {
    let bar = RECT {
        left: 0,
        top: 0,
        right: cw,
        bottom: TOOLBAR_H,
    };
    FillRect(dc, &bar, st.brush_bar);
    SetBkMode(dc, TRANSPARENT);

    let btns = toolbar_layout(st.view_mode);
    for b in &btns {
        let mut r = RECT {
            left: b.x,
            top: 4,
            right: b.x + b.w,
            bottom: TOOLBAR_H - 4,
        };
        let mut wide = to_wide(&b.label);
        let _ = DrawTextW(
            dc,
            wide.as_mut_slice(),
            &mut r as *mut RECT,
            DT_SINGLELINE | DT_VCENTER | DT_CENTER,
        );
        FrameRect(dc, &r, st.brush_sel);
    }

    let last_right = btns.last().map_or(PADDING, |b| b.x + b.w);
    let vis = st.images.images.iter().filter(|im| !im.removed).count();
    let total = st.images.images.len();
    let stat = format!("共 {total} 张 | 留存 {vis} 张");
    let mut wide_stat = to_wide(&stat);
    let mut sr = RECT {
        left: last_right + 20,
        top: 4,
        right: cw - PADDING,
        bottom: TOOLBAR_H - 4,
    };
    let _ = DrawTextW(
        dc,
        wide_stat.as_mut_slice(),
        &mut sr as *mut RECT,
        DT_SINGLELINE | DT_VCENTER,
    );
}

// ─── 网格视图绘制 ───
unsafe fn paint_grid(dc: HDC, st: &WindowState, cw: i32, ch: i32) {
    let grid_y = TOOLBAR_H;
    let grid_bottom = ch - STATUSBAR_H;
    let row_h = st.cell as i32 + 22;

    let start_row = (st.scroll_y.max(0) / row_h.max(1)) as usize;
    if start_row < st.total_rows {
        let visible_rows = ((grid_bottom - grid_y).max(1) as usize / row_h.max(1) as usize) + 2;
        let end_row = st.total_rows.min(start_row + visible_rows);

        for row in start_row..end_row {
            let y = grid_y + row as i32 * row_h - st.scroll_y;
            if y + row_h < grid_y || y > grid_bottom {
                continue;
            }

            for col in 0..st.cols {
                let idx = row * st.cols + col;
                let vi = find_visible_index(&st.images.images, idx);
                if vi >= st.images.images.len() {
                    break;
                }

                let img = &st.images.images[vi];
                let cx = PADDING + col as i32 * (st.cell as i32 + SPACING);

                // 选中边框
                if vi == st.images.current_idx {
                    let csel = RECT {
                        left: cx,
                        top: y,
                        right: cx + st.cell as i32,
                        bottom: y + st.cell as i32 + 22,
                    };
                    FrameRect(dc, &csel, st.brush_sel);
                    let inner = RECT {
                        left: cx + 2,
                        top: y + 2,
                        right: cx + st.cell as i32 - 2,
                        bottom: y + st.cell as i32 + 20,
                    };
                    FrameRect(dc, &inner, st.brush_sel);
                }

                // 缩略图
                let tr = RECT {
                    left: cx + 2,
                    top: y + 2,
                    right: cx + st.cell as i32 - 2,
                    bottom: y + st.cell as i32 - 2,
                };
                if let Some(&bmp) = st.thumb_cache.get(&img.id) {
                    let tdc = CreateCompatibleDC(Some(dc));
                    let old = SelectObject(tdc, HGDIO::from(bmp));
                    StretchBlt(
                        dc,
                        tr.left,
                        tr.top,
                        tr.right - tr.left,
                        tr.bottom - tr.top,
                        Some(tdc),
                        0,
                        0,
                        THUMB_SIZE as i32,
                        THUMB_SIZE as i32,
                        SRCCOPY,
                    );
                    SelectObject(tdc, old);
                    DeleteDC(tdc);
                } else {
                    FillRect(dc, &tr, st.brush_grey);
                }

                // 已移除遮罩
                if img.removed {
                    FillRect(dc, &tr, st.brush_grey);
                }

                // 文件名
                let mut nr = RECT {
                    left: cx + 1,
                    top: y + st.cell as i32,
                    right: cx + st.cell as i32 - 1,
                    bottom: y + st.cell as i32 + 20,
                };
                let mut wn = to_wide(&img.name);
                let _ = DrawTextW(
                    dc,
                    wn.as_mut_slice(),
                    &mut nr as *mut RECT,
                    DT_SINGLELINE | DT_END_ELLIPSIS | DT_CENTER | DT_VCENTER,
                );

                // 星级
                let stars = "★".repeat(img.rating as usize) + &"☆".repeat(5 - img.rating as usize);
                let mut star_r = RECT {
                    left: cx + 1,
                    top: y + st.cell as i32 + 1,
                    right: cx + st.cell as i32 - 1,
                    bottom: y + st.cell as i32 + 21,
                };
                let mut ws = to_wide(&stars);
                let _ = DrawTextW(
                    dc,
                    ws.as_mut_slice(),
                    &mut star_r as *mut RECT,
                    DT_SINGLELINE | DT_CENTER | DT_BOTTOM,
                );
            }
        }
    }

    // ─ 滚动条 ─
    if st.max_scroll > 0 {
        let grid_y = TOOLBAR_H;
        let grid_bottom = ch - STATUSBAR_H;
        let sb_left = cw - SCROLLBAR_W;
        let track_h = grid_bottom - grid_y;
        let thumb_h = ((track_h as f32 / (track_h + st.max_scroll) as f32) * track_h as f32) as i32;
        let thumb_h = thumb_h.max(20).min(track_h);
        let thumb_y = if st.max_scroll > 0 {
            grid_y
                + ((st.scroll_y as f32 / st.max_scroll as f32) * (track_h - thumb_h) as f32) as i32
        } else {
            grid_y
        };
        let sbbg = RECT {
            left: sb_left,
            top: grid_y,
            right: cw,
            bottom: grid_bottom,
        };
        FillRect(dc, &sbbg, st.brush_bar);
        let sbth = RECT {
            left: sb_left,
            top: thumb_y,
            right: cw,
            bottom: thumb_y + thumb_h,
        };
        FillRect(dc, &sbth, st.brush_grey);
    }
}

// ─── 大图视图绘制 ───
unsafe fn paint_full_image(dc: HDC, st: &WindowState, cw: i32, ch: i32) {
    let grid_y = TOOLBAR_H;
    let grid_bottom = ch - STATUSBAR_H;
    let view_w = cw;
    let view_h = grid_bottom - grid_y;

    // 背景填白
    let bg = RECT {
        left: 0,
        top: grid_y,
        right: cw,
        bottom: grid_bottom,
    };
    FillRect(dc, &bg, st.brush_bg);

    // 获取当前图片
    let img = match st.images.images.get(st.images.current_idx) {
        Some(img) if !img.removed => img,
        _ => {
            // 无图片时显示提示
            let msg = "无图片可显示";
            let mut wide = to_wide(msg);
            let mut r = RECT {
                left: 0,
                top: grid_y,
                right: cw,
                bottom: grid_bottom,
            };
            SetBkMode(dc, TRANSPARENT);
            let _ = DrawTextW(
                dc,
                wide.as_mut_slice(),
                &mut r as *mut RECT,
                DT_SINGLELINE | DT_CENTER | DT_VCENTER,
            );
            return;
        }
    };

    // 绘制大图
    if let Some(entry) = st.full_cache.get(&img.id) {
        // 等比缩放适配视图区域（留 20px 边距）
        let margin: i32 = 20;
        let avail_w = view_w - 2 * margin;
        let avail_h = view_h - 2 * margin;
        let scale_w = avail_w as f64 / entry.orig_w.max(1) as f64;
        let scale_h = avail_h as f64 / entry.orig_h.max(1) as f64;
        let scale = scale_w.min(scale_h); // 大图模式允许放大，填满视图区域
        let draw_w = (entry.orig_w as f64 * scale) as i32;
        let draw_h = (entry.orig_h as f64 * scale) as i32;
        let draw_x = (view_w - draw_w) / 2;
        let draw_y = grid_y + (view_h - draw_h) / 2;

        let tdc = CreateCompatibleDC(Some(dc));
        let old = SelectObject(tdc, HGDIO::from(entry.bmp));
        SetStretchBltMode(dc, HALFTONE);
        StretchBlt(
            dc,
            draw_x,
            draw_y,
            draw_w,
            draw_h,
            Some(tdc),
            0,
            0,
            entry.orig_w,
            entry.orig_h,
            SRCCOPY,
        );
        SelectObject(tdc, old);
        DeleteDC(tdc);

        // 图片信息叠加（底部半透明文字）— 包含诊断：解码尺寸 + 显示尺寸
        let info = format!(
            "{} | 解码:{}x{} 显示:{}x{} | {}",
            img.name,
            entry.orig_w,
            entry.orig_h,
            draw_w,
            draw_h,
            "★".repeat(img.rating as usize) + &"☆".repeat(5 - img.rating as usize)
        );
        let mut wide = to_wide(&info);
        let mut ir = RECT {
            left: 0,
            top: grid_bottom - 28,
            right: cw,
            bottom: grid_bottom,
        };
        SetBkMode(dc, TRANSPARENT);
        let _ = DrawTextW(
            dc,
            wide.as_mut_slice(),
            &mut ir as *mut RECT,
            DT_SINGLELINE | DT_CENTER | DT_VCENTER,
        );

        // 已移除标记
        if img.removed {
            let mut wide_rm = to_wide("[已移除]");
            let mut rr = RECT {
                left: 0,
                top: grid_y,
                right: cw,
                bottom: grid_bottom,
            };
            let _ = DrawTextW(
                dc,
                wide_rm.as_mut_slice(),
                &mut rr as *mut RECT,
                DT_SINGLELINE | DT_CENTER | DT_VCENTER,
            );
        }
    } else {
        // 加载中提示
        let msg = "加载中...";
        let mut wide = to_wide(msg);
        let mut r = RECT {
            left: 0,
            top: grid_y,
            right: cw,
            bottom: grid_bottom,
        };
        SetBkMode(dc, TRANSPARENT);
        let _ = DrawTextW(
            dc,
            wide.as_mut_slice(),
            &mut r as *mut RECT,
            DT_SINGLELINE | DT_CENTER | DT_VCENTER,
        );
    }

    // 翻页提示
    let hint = "← → 切换图片 | ↓ 移除 | ↑ 恢复 | 0-5 评分 | Space 网格";
    let mut wide_hint = to_wide(hint);
    let mut hr = RECT {
        left: PADDING,
        top: grid_y + 2,
        right: cw - PADDING,
        bottom: grid_y + 22,
    };
    let _ = DrawTextW(
        dc,
        wide_hint.as_mut_slice(),
        &mut hr as *mut RECT,
        DT_SINGLELINE | DT_LEFT | DT_VCENTER,
    );
}

// ─── 状态栏绘制 ───
unsafe fn paint_statusbar(dc: HDC, st: &WindowState, cw: i32, ch: i32) {
    let stbg = RECT {
        left: 0,
        top: ch - STATUSBAR_H,
        right: cw,
        bottom: ch,
    };
    FillRect(dc, &stbg, st.brush_bar);
    SetBkMode(dc, TRANSPARENT);
    let mut wide_status = to_wide(&st.status);
    let mut status_rect = RECT {
        left: PADDING,
        top: ch - STATUSBAR_H,
        right: cw - PADDING,
        bottom: ch,
    };
    let _ = DrawTextW(
        dc,
        wide_status.as_mut_slice(),
        &mut status_rect as *mut RECT,
        DT_SINGLELINE | DT_VCENTER,
    );
}

// ============ WM_TIMER（按需刷新）============
unsafe fn on_timer(hwnd: HWND) {
    let st = state_mut(hwnd);

    // 收集缩略图结果
    while let Ok((id, pixels, w, h)) = st.thumb_res_rx.try_recv() {
        if let Some(bmp) = create_bitmap(&pixels, w as i32, h as i32) {
            if let Some(old) = st.thumb_cache.remove(&id) {
                DeleteObject(HGDIO::from(old));
            }
            if st.thumb_cache.len() > 256 {
                let keys: Vec<u64> = st.thumb_cache.keys().copied().collect();
                for k in keys.iter().take(128) {
                    if let Some(b) = st.thumb_cache.remove(k) {
                        DeleteObject(HGDIO::from(b));
                    }
                }
            }
            st.thumb_cache.insert(id, bmp);
        }
        st.dirty = true;
    }

    // 收集大图解码结果
    while let Ok((id, result)) = st.full_res_rx.try_recv() {
        match result {
            Ok((pixels, w, h)) => {
                if let Some(bmp) = create_bitmap(&pixels, w as i32, h as i32) {
                    if let Some(old) = st.full_cache.remove(&id) {
                        DeleteObject(HGDIO::from(old.bmp));
                    }
                    if st.full_cache.len() > 16 {
                        let keys: Vec<u64> = st.full_cache.keys().copied().collect();
                        for k in keys.iter().take(8) {
                            if let Some(e) = st.full_cache.remove(k) {
                                DeleteObject(HGDIO::from(e.bmp));
                            }
                        }
                    }
                    st.full_cache.insert(
                        id,
                        FullImageEntry {
                            bmp,
                            orig_w: w as i32,
                            orig_h: h as i32,
                        },
                    );
                }
            }
            Err(e) => {
                st.status = format!("大图解码失败: {}", e);
            }
        }
        st.dirty = true;
    }

    // 收集扫描结果
    if let Some(ref rx) = st.scan_rx {
        if let Ok(paths) = rx.try_recv() {
            for p in &paths {
                let id = st.images.id_counter;
                st.images.images.push(ImageItem::new(id, p.clone()));
                st.images.id_counter = id + 1;
                let _ = st.thumb_req_tx.send((id, p.clone(), THUMB_SIZE));
            }
            st.scan_rx = None;
            st.loading = false;
            st.status = format!("已加载 {} 张图片", st.images.images.len());
            on_size(hwnd);
            st.dirty = true;
        }
    }

    // 按需刷新：只在有脏标记时触发重绘
    if st.dirty {
        st.dirty = false;
        InvalidateRect(Some(hwnd), None, false);
    }
}

// ============ WM_KEYDOWN ============
unsafe fn on_key(hwnd: HWND, wparam: WPARAM) {
    let st = state_mut(hwnd);
    let k = wparam.0 as u32;
    let len = st.images.images.len();

    // 全局快捷键（优先级高于模式分发）
    if k == 0x1B {
        // ESC: 大图模式下退出到网格，网格模式下无操作
        if st.view_mode == ViewMode::FullImage {
            st.view_mode = ViewMode::Grid;
            st.status = String::from("网格浏览模式 — ← → 切换选中 | ↓ 移除 | Space 大图");
            st.dirty = true;
        }
        return;
    } else if k == 0x53 {
        // S: 保存
        save_retained(hwnd, st);
        st.dirty = true;
        return;
    } else if k == 0x46 {
        // F: 打开文件夹
        open_folder_dialog(hwnd, st);
        st.dirty = true;
        return;
    } else if k == 0x20 {
        // Space: 切换视图模式
        toggle_view_mode(st);
        st.dirty = true;
        return;
    }

    // 模式相关快捷键
    match st.view_mode {
        ViewMode::Grid => handle_key_grid(st, k, len),
        ViewMode::FullImage => handle_key_full(st, k, len),
    }
    st.dirty = true;
}

/// 解析按键码为评分 0-5（支持主键盘 0x30-0x35 和数字键盘 0x60-0x65）
fn key_to_rating(k: u32) -> Option<u8> {
    if (0x30..=0x35).contains(&k) {
        Some((k - 0x30) as u8)
    } else if (0x60..=0x65).contains(&k) {
        Some((k - 0x60) as u8)
    } else {
        None
    }
}

fn handle_key_grid(st: &mut WindowState, k: u32, len: usize) {
    if k == 0x25 {
        // LEFT
        if len > 0 {
            for i in 1..=len {
                let idx = (st.images.current_idx + len - i) % len;
                if !st.images.images[idx].removed {
                    st.images.current_idx = idx;
                    break;
                }
            }
        }
    } else if k == 0x27 {
        // RIGHT
        if len > 0 {
            for i in 1..=len {
                let idx = (st.images.current_idx + i) % len;
                if !st.images.images[idx].removed {
                    st.images.current_idx = idx;
                    break;
                }
            }
        }
    } else if k == 0x28 {
        // DOWN: 标记移除
        mark_removed(st);
    } else if k == 0x26 {
        // UP: 恢复
        restore_last(st);
    } else if let Some(rating) = key_to_rating(k) {
        // 0-5 评分
        if st.images.current_idx < len {
            st.images.images[st.images.current_idx].rating = rating;
        }
    } else if k == 0x52 {
        // R: 排序
        st.images.images.sort_by(|a, b| b.rating.cmp(&a.rating));
        st.images.current_idx = 0;
    }
}

fn handle_key_full(st: &mut WindowState, k: u32, len: usize) {
    if k == 0x25 {
        // LEFT: 上一张
        if len > 0 {
            for i in 1..=len {
                let idx = (st.images.current_idx + len - i) % len;
                if !st.images.images[idx].removed {
                    st.images.current_idx = idx;
                    break;
                }
            }
        }
        preload_full_images(st);
    } else if k == 0x27 {
        // RIGHT: 下一张
        if len > 0 {
            for i in 1..=len {
                let idx = (st.images.current_idx + i) % len;
                if !st.images.images[idx].removed {
                    st.images.current_idx = idx;
                    break;
                }
            }
        }
        preload_full_images(st);
    } else if k == 0x28 {
        // DOWN: 标记移除
        mark_removed(st);
        preload_full_images(st);
    } else if k == 0x26 {
        // UP: 恢复
        restore_last(st);
        preload_full_images(st);
    } else if let Some(rating) = key_to_rating(k) {
        // 0-5 评分
        if st.images.current_idx < len {
            st.images.images[st.images.current_idx].rating = rating;
        }
    } else if k == 0x52 {
        // R: 排序
        st.images.images.sort_by(|a, b| b.rating.cmp(&a.rating));
        st.images.current_idx = 0;
        preload_full_images(st);
    }
}

fn mark_removed(st: &mut WindowState) {
    let len = st.images.images.len();
    if st.images.current_idx < len {
        let img = &mut st.images.images[st.images.current_idx];
        if !img.removed {
            img.removed = true;
            st.images
                .removed_stack
                .push((img.id, st.images.current_idx));
        }
    }
    // 跳到下一个有效图片
    if len > 0 {
        for i in 1..=len {
            let n = (st.images.current_idx + i) % len;
            if !st.images.images[n].removed {
                st.images.current_idx = n;
                return;
            }
        }
    }
}

// ============ WM_LBUTTONDOWN ============
unsafe fn on_click(hwnd: HWND, lparam: LPARAM) {
    let st = state_mut(hwnd);
    let x = (lparam.0 & 0xFFFF) as i32;
    let y = ((lparam.0 >> 16) & 0xFFFF) as i32;

    let mut cr = RECT::default();
    GetClientRect(hwnd, &mut cr);
    let cw = cr.right - cr.left;
    let ch = cr.bottom - cr.top;
    let grid_y = TOOLBAR_H;
    let grid_bottom = ch - STATUSBAR_H;

    if y < TOOLBAR_H {
        // 工具栏点击（使用与渲染相同的布局计算）
        let btns = toolbar_layout(st.view_mode);
        for b in &btns {
            if x >= b.x && x < b.x + b.w {
                match b.action {
                    ToolButton::OpenFolder => open_folder_dialog(hwnd, st),
                    ToolButton::Save => save_retained(hwnd, st),
                    ToolButton::Sort => {
                        st.images.images.sort_by(|a, b| b.rating.cmp(&a.rating));
                        st.images.current_idx = 0;
                        if st.view_mode == ViewMode::FullImage {
                            preload_full_images(st);
                        }
                    }
                    ToolButton::ToggleView => toggle_view_mode(st),
                    ToolButton::Clear => clear_all_with_confirm(hwnd, st),
                }
                break;
            }
        }
        st.dirty = true;
        return;
    }

    match st.view_mode {
        ViewMode::Grid => {
            // 滚动条点击
            if x > cw - SCROLLBAR_W && y >= grid_y && y < grid_bottom && st.max_scroll > 0 {
                let track_h = grid_bottom - grid_y;
                st.scroll_y = ((y - grid_y) as f32 / track_h as f32 * st.max_scroll as f32) as i32;
                if st.scroll_y < 0 {
                    st.scroll_y = 0;
                }
                if st.scroll_y > st.max_scroll {
                    st.scroll_y = st.max_scroll;
                }
                st.dirty = true;
                return;
            }
            // 网格单元格点击
            if y >= grid_y && y < grid_bottom && x < cw - SCROLLBAR_W {
                let row_h = st.cell as i32 + 22;
                if row_h > 0 {
                    let row = (st.scroll_y + y - grid_y) as usize / row_h as usize;
                    let denom = st.cell as i32 + SPACING;
                    if denom > 0 {
                        let col = ((x - PADDING) / denom) as usize;
                        if col < st.cols && row < st.total_rows {
                            let idx = row * st.cols + col;
                            let vi = find_visible_index(&st.images.images, idx);
                            if vi < st.images.images.len() {
                                st.images.current_idx = vi;
                            }
                        }
                    }
                }
                st.dirty = true;
            }
        }
        ViewMode::FullImage => {
            // 大图模式下点击左半区域 = 上一张，右半区域 = 下一张
            if y >= grid_y && y < grid_bottom {
                let len = st.images.images.len();
                if x < cw / 2 {
                    // 上一张
                    if len > 0 {
                        for i in 1..=len {
                            let idx = (st.images.current_idx + len - i) % len;
                            if !st.images.images[idx].removed {
                                st.images.current_idx = idx;
                                break;
                            }
                        }
                    }
                } else {
                    // 下一张
                    if len > 0 {
                        for i in 1..=len {
                            let idx = (st.images.current_idx + i) % len;
                            if !st.images.images[idx].removed {
                                st.images.current_idx = idx;
                                break;
                            }
                        }
                    }
                }
                preload_full_images(st);
                st.dirty = true;
            }
        }
    }
}

// ============ WM_MOUSEWHEEL ============
unsafe fn on_wheel(hwnd: HWND, wparam: WPARAM) {
    let st = state_mut(hwnd);
    let delta = (wparam.0 as i16 as i32) / WHEEL_DELTA as i32;

    match st.view_mode {
        ViewMode::Grid => {
            st.scroll_y -= delta * 40;
            if st.scroll_y < 0 {
                st.scroll_y = 0;
            }
            if st.scroll_y > st.max_scroll {
                st.scroll_y = st.max_scroll;
            }
        }
        ViewMode::FullImage => {
            // 大图模式下滚轮翻页
            let len = st.images.images.len();
            if len == 0 {
                return;
            }
            if delta > 0 {
                // 向上滚 → 上一张
                for _ in 0..delta.abs().min(5) {
                    for i in 1..=len {
                        let idx = (st.images.current_idx + len - i) % len;
                        if !st.images.images[idx].removed {
                            st.images.current_idx = idx;
                            break;
                        }
                    }
                }
            } else {
                // 向下滚 → 下一张
                for _ in 0..delta.abs().min(5) {
                    for i in 1..=len {
                        let idx = (st.images.current_idx + i) % len;
                        if !st.images.images[idx].removed {
                            st.images.current_idx = idx;
                            break;
                        }
                    }
                }
            }
            preload_full_images(st);
        }
    }
    st.dirty = true;
}

// ============ WM_DESTROY ============
unsafe fn on_destroy(hwnd: HWND) {
    KillTimer(Some(hwnd), TIMER_ID).ok();
    let st = state_mut(hwnd);
    for &bmp in st.thumb_cache.values() {
        DeleteObject(HGDIO::from(bmp));
    }
    for entry in st.full_cache.values() {
        DeleteObject(HGDIO::from(entry.bmp));
    }
    DeleteObject(HGDIO::from(st.hfont));
    DeleteObject(HGDIO::from(st.brush_bar));
    DeleteObject(HGDIO::from(st.brush_bg));
    DeleteObject(HGDIO::from(st.brush_sel));
    DeleteObject(HGDIO::from(st.brush_grey));
    let _ = Box::from_raw(st as *mut WindowState);
    PostQuitMessage(0);
}

// ====== 辅助函数 ======

fn find_visible_index(images: &[ImageItem], target_visible: usize) -> usize {
    let mut count = 0;
    for (i, im) in images.iter().enumerate() {
        if !im.removed {
            count += 1;
        }
        if count == target_visible + 1 {
            return i;
        }
    }
    images.len()
}

unsafe fn create_bitmap(pixels: &[u8], w: i32, h: i32) -> Option<HBITMAP> {
    if w <= 0 || h <= 0 || pixels.len() < (w * h * 4) as usize {
        return None;
    }

    // RGBA → BGRA
    let mut bgra = vec![0u8; pixels.len()];
    for i in (0..pixels.len()).step_by(4) {
        if i + 3 < pixels.len() {
            bgra[i] = pixels[i + 2];
            bgra[i + 1] = pixels[i + 1];
            bgra[i + 2] = pixels[i];
            bgra[i + 3] = pixels[i + 3];
        }
    }

    let mut bmih = BITMAPINFOHEADER::default();
    bmih.biSize = mem::size_of::<BITMAPINFOHEADER>() as u32;
    bmih.biWidth = w;
    bmih.biHeight = -h;
    bmih.biPlanes = 1;
    bmih.biBitCount = 32;
    bmih.biCompression = 0; // BI_RGB

    let bmi = BITMAPINFO {
        bmiHeader: bmih,
        bmiColors: [RGBQUAD::default(); 1],
    };

    let screen_dc = GetDC(None);
    let bmp = CreateDIBitmap(
        screen_dc,
        Some(&bmih),
        CBM_INIT as u32,
        Some(bgra.as_ptr() as *const _),
        Some(&bmi),
        DIB_RGB_COLORS,
    );
    ReleaseDC(None, screen_dc);

    if bmp.is_invalid() {
        None
    } else {
        Some(bmp)
    }
}

unsafe fn clear_all(st: &mut WindowState) {
    st.images.reset();
    for &b in st.thumb_cache.values() {
        DeleteObject(HGDIO::from(b));
    }
    st.thumb_cache.clear();
    for entry in st.full_cache.values() {
        DeleteObject(HGDIO::from(entry.bmp));
    }
    st.full_cache.clear();
    st.scroll_y = 0;
    st.loading = false;
    st.view_mode = ViewMode::Grid;
    st.status = String::from("已清空 — 按 F 选择新文件夹, Space 切换大图模式");
    st.dirty = true;
}

unsafe fn clear_all_with_confirm(hwnd: HWND, st: &mut WindowState) {
    let visible = st.images.images.iter().filter(|im| !im.removed).count();
    if visible == 0 {
        st.status = String::from("没有可清空的图片");
        return;
    }

    // MessageBox 二次确认
    let msg = format!(
        "确定要清空全部 {} 张图片吗？\n此操作不会删除照片。",
        visible
    );
    let wide_msg = to_wide(&msg);
    let wide_title = to_wide("确认清空");
    let ret = MessageBoxW(
        Some(hwnd),
        PCWSTR(wide_msg.as_ptr()),
        PCWSTR(wide_title.as_ptr()),
        MB_YESNO | MB_ICONWARNING | MB_DEFBUTTON2,
    );
    if ret == IDYES {
        clear_all(st);
    } else {
        st.status = String::from("已取消清空");
    }
}

unsafe fn save_retained(hwnd: HWND, st: &mut WindowState) {
    let retained: Vec<String> = st
        .images
        .images
        .iter()
        .filter(|im| !im.removed)
        .map(|im| im.path.clone())
        .collect();

    if retained.is_empty() {
        st.status = String::from("没有留存图片，无需导出");
        return;
    }

    // 弹出文件夹选择对话框
    let dest_folder = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
        let _ = CoInitializeEx(None, COINIT_APARTMENTTHREADED);
        let dialog: IFileOpenDialog = CoCreateInstance(&FileOpenDialog, None, CLSCTX_ALL).ok()?;
        dialog.SetOptions(FOS_PICKFOLDERS).ok()?;
        dialog.SetTitle(w!("选择导出目标文件夹")).ok()?;
        dialog.Show(Some(hwnd)).ok()?;
        let item = dialog.GetResult().ok()?;
        let path = item.GetDisplayName(SIGDN_FILESYSPATH).ok()?;
        let s = path.to_string().ok()?;
        CoUninitialize();
        Some(s)
    }));

    let dest = match dest_folder {
        Ok(Some(p)) => std::path::PathBuf::from(p),
        _ => {
            st.status = String::from("未选择目标文件夹");
            return;
        }
    };

    let src = retained.clone();
    let dest_clone = dest.clone();
    let count = src.len();
    std::thread::spawn(move || {
        let _ = std::fs::create_dir_all(&dest_clone);
        for p in &src {
            if let Some(name) = std::path::Path::new(p).file_name() {
                let _ = std::fs::copy(p, dest_clone.join(name));
            }
        }
    });
    st.status = format!("已保存 {} 张到 {}", count, dest.display());
}

unsafe fn open_folder_dialog(hwnd: HWND, st: &mut WindowState) {
    let result = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
        let _ = CoInitializeEx(None, COINIT_APARTMENTTHREADED);
        let dialog: IFileOpenDialog = CoCreateInstance(&FileOpenDialog, None, CLSCTX_ALL).ok()?;
        dialog.SetOptions(FOS_PICKFOLDERS).ok()?;
        dialog.Show(Some(hwnd)).ok()?;
        let item = dialog.GetResult().ok()?;
        let path = item.GetDisplayName(SIGDN_FILESYSPATH).ok()?;
        let s = path.to_string().ok()?;
        CoUninitialize();
        Some(s)
    }));

    let path = match result {
        Ok(Some(p)) => p,
        _ => {
            st.status = String::from("未选择文件夹");
            st.dirty = true;
            return;
        }
    };

    st.images.reset();
    for &b in st.thumb_cache.values() {
        DeleteObject(HGDIO::from(b));
    }
    st.thumb_cache.clear();
    for entry in st.full_cache.values() {
        DeleteObject(HGDIO::from(entry.bmp));
    }
    st.full_cache.clear();
    st.scroll_y = 0;
    st.loading = true;
    st.view_mode = ViewMode::Grid;
    st.status = format!("扫描中: {}...", path);

    let (tx, rx) = mpsc::channel();
    st.scan_rx = Some(rx);

    let p = path.clone();
    std::thread::spawn(move || {
        let mut paths = Vec::new();
        scan_dir(&p, &mut paths, 0);
        paths.sort();
        if paths.len() > MAX_IMAGES {
            paths.truncate(MAX_IMAGES);
        }
        let _ = tx.send(paths);
    });

    st.dirty = true;
}

fn scan_dir(dir: &str, out: &mut Vec<String>, depth: u32) {
    if depth > 5 || out.len() >= MAX_IMAGES {
        return;
    }
    let supported = ["jpg", "jpeg", "png", "webp", "bmp", "gif", "tiff", "tif"];
    if let Ok(entries) = std::fs::read_dir(dir) {
        let mut dirs = Vec::new();
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                dirs.push(path);
            } else if let Some(ext) = path.extension().and_then(|e| e.to_str()) {
                if supported.contains(&ext.to_lowercase().as_str()) {
                    out.push(path.to_string_lossy().to_string());
                }
            }
        }
        for d in dirs {
            scan_dir(&d.to_string_lossy(), out, depth + 1);
        }
    }
}

/// 切换视图模式
fn toggle_view_mode(st: &mut WindowState) {
    st.view_mode = match st.view_mode {
        ViewMode::Grid => {
            // 切换到全屏大图前，确保有选中图片
            if st.images.images.is_empty() {
                st.status = String::from("无图片，无法切换大图模式");
                ViewMode::Grid
            } else {
                // 找到第一个未移除的图片
                let len = st.images.images.len();
                if st.images.images[st.images.current_idx].removed {
                    for i in 0..len {
                        if !st.images.images[i].removed {
                            st.images.current_idx = i;
                            break;
                        }
                    }
                }
                preload_full_images(st);
                st.status = String::from("大图浏览模式 — ← → 翻页 | ↓ 移除 | Space 返回网格");
                ViewMode::FullImage
            }
        }
        ViewMode::FullImage => {
            // 返回网格时滚动到当前选中图片
            st.status = String::from("网格浏览模式 — ← → 切换选中 | ↓ 移除 | Space 大图");
            ViewMode::Grid
        }
    };
    st.dirty = true;
}

/// 大图模式预加载：加载当前图及前后 N 张
fn preload_full_images(st: &mut WindowState) {
    let len = st.images.images.len();
    if len == 0 {
        return;
    }

    // 收集当前图片前后各 FULL_PRELOAD_AHEAD 张的索引（跳过已移除的）
    let current = st.images.current_idx;
    let mut indices: Vec<usize> = Vec::with_capacity(FULL_PRELOAD_AHEAD * 2 + 1);

    // 添加当前
    indices.push(current);

    // 向后收集
    let mut count = 1;
    for i in 1..=len {
        let idx = (current + i) % len;
        if !st.images.images[idx].removed {
            indices.push(idx);
            count += 1;
            if count > FULL_PRELOAD_AHEAD {
                break;
            }
        }
    }

    // 向前收集
    count = 0;
    for i in 1..=len {
        let idx = (current + len - i) % len;
        if !st.images.images[idx].removed {
            if !indices.contains(&idx) {
                indices.push(idx);
                count += 1;
                if count >= FULL_PRELOAD_AHEAD {
                    break;
                }
            }
        }
    }

    // 请求解码
    for idx in &indices {
        let img = &st.images.images[*idx];
        if !st.full_cache.contains_key(&img.id) {
            let _ = st.full_req_tx.send((img.id, img.path.clone()));
        }
    }
}

fn restore_last(st: &mut WindowState) {
    let len = st.images.images.len();
    if let Some((_id, restored)) = st.images.removed_stack.pop() {
        if restored < len {
            st.images.images[restored].removed = false;
        }
    }
}

// ====== 入口 ======
pub fn run() {
    unsafe {
        let hinst = GetModuleHandleW(None).unwrap();

        // 不使用 CS_HREDRAW | CS_VREDRAW，避免窗口调整大小时强制擦除背景
        let wc = WNDCLASSW {
            style: CS_OWNDC,
            lpfnWndProc: Some(wnd_proc),
            hInstance: HINSTANCE(hinst.0),
            hCursor: LoadCursorW(None, IDC_ARROW).unwrap(),
            hbrBackground: HBRUSH::default(), // 不使用系统背景刷，手动绘制
            lpszClassName: w!("PhotoSelectWin"),
            ..Default::default()
        };

        RegisterClassW(&wc);

        let hwnd = CreateWindowExW(
            WINDOW_EX_STYLE::default(),
            w!("PhotoSelectWin"),
            w!("PhotoSelect - 图片筛选工具"),
            WS_OVERLAPPEDWINDOW | WS_VISIBLE,
            200,
            100,
            1200,
            800,
            None,
            None,
            Some(HINSTANCE(hinst.0)),
            None,
        )
        .unwrap();

        ShowWindow(hwnd, SW_SHOW);
        UpdateWindow(hwnd);

        let mut msg = MSG::default();
        while GetMessageW(&mut msg, None, 0, 0).as_bool() {
            TranslateMessage(&msg);
            DispatchMessageW(&msg);
        }
    }
}
