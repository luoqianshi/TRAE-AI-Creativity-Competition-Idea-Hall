"""
Module 5: Gradio Web 界面
把前 4 个模块串成一个可操作的网页界面。
"""
import os
import sys
import tempfile
from datetime import datetime

import gradio as gr

# 确保能 import 同目录下的模块
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import sector_crop
import width_detect
import connectivity_detect
import export_pdf


def process(image_path, fold_count, danger_thresh, thin_thresh, axis):
    """一键处理：依次调用各模块。"""
    if image_path is None:
        return None, None, None, None, None, None, None, None, None, None, "请先上传图片", None

    work_dir = tempfile.mkdtemp(prefix="paper_cut_")
    out_dir = os.path.join(work_dir, "output")
    os.makedirs(out_dir, exist_ok=True)

    log_lines = []

    try:
        # 1. 对称剖分
        log_lines.append("[步骤1] 对称剖分...")
        sector_result = sector_crop.crop_sector(
            image_path, int(fold_count), out_dir, axis=axis)
        log_lines.append(f"  单扇: {sector_result['sector']}")
        log_lines.append(f"  平均差异: {sector_result['mean_diff']:.4f}")

        # 2. 宽度检测（用原图）
        log_lines.append("[步骤2] 线条宽度检测...")
        width_result = width_detect.detect_width(
            image_path, int(danger_thresh), int(thin_thresh), out_dir)
        log_lines.append(f"  危险点: {width_result['danger_count']}, "
                         f"偏薄点: {width_result['thin_count']}, "
                         f"安全点: {width_result['safe_count']}")

        # 3. 连通性检测
        log_lines.append("[步骤3] 连通性检测...")
        conn_result = connectivity_detect.detect_connectivity(image_path, out_dir)
        log_lines.append(f"  主体面积: {conn_result['main_area']}, "
                         f"孤岛数量: {conn_result['island_count']}")

        # 4. PDF 导出（传入危险点坐标和孤岛信息，生成纯净版+指导版）
        log_lines.append("[步骤4] PDF 导出（纯净版 + 施工指导版）...")
        meta = {
            "fold_count": int(fold_count),
            "danger_points": width_result["danger_count"],
            "islands": conn_result["island_count"],
            "date": datetime.now().strftime("%Y-%m-%d"),
        }
        pdf_path = os.path.join(out_dir, "blueprint.pdf")
        pdf_result = export_pdf.export_pdf(
            image_path,
            width_result["layer"],
            conn_result["layer"],
            meta,
            pdf_path,
            danger_points=width_result.get("danger_points", []),
            island_details=conn_result.get("island_details", []))
        log_lines.append(f"  纯净版: {pdf_result['clean']}")
        log_lines.append(f"  指导版: {pdf_result['guide']}")
        log_lines.append("[完成] 全流程处理完成。")

        width_stat = (f"危险点(红): {width_result['danger_count']}  |  "
                      f"偏薄点(黄): {width_result['thin_count']}  |  "
                      f"安全点(蓝): {width_result['safe_count']}")
        conn_stat = (f"主体面积: {conn_result['main_area']}  |  "
                     f"孤岛数量: {conn_result['island_count']}")
        diff_text = f"平均像素差异值: {sector_result['mean_diff']:.4f}"

        return (sector_result["sector"], sector_result["reconstruct"],
                sector_result["diff"], diff_text,
                width_result["annotated"], width_stat,
                conn_result["annotated"], conn_stat,
                pdf_result["clean"], "\n".join(log_lines), pdf_result["guide"])
    except Exception as e:
        import traceback
        log_lines.append(f"[错误] {e}")
        log_lines.append(traceback.format_exc())
        return (None, None, None, None, None, None, None, None, None,
                "\n".join(log_lines), None)


def build_ui():
    with gr.Blocks(title="对称剪纸底稿生成器") as demo:
        gr.Markdown("# 对称剪纸底稿生成器")
        gr.Markdown("> 上传对称图片，生成结构安全的剪纸底稿")

        with gr.Row():
            # 左侧输入区
            with gr.Column(scale=1):
                image_input = gr.Image(label="上传图片（PNG/JPG）", type="filepath")
                fold_count = gr.Dropdown(
                    choices=["2", "4", "6", "8"],
                    value="4", label="折数")
                axis = gr.Radio(
                    choices=["vertical", "horizontal"],
                    value="vertical",
                    label="对称轴方向（仅2折生效）",
                    info="vertical=左右镜像 | horizontal=上下镜像")
                danger_thresh = gr.Slider(
                    1, 10, value=3, step=1,
                    label="危险阈值（像素）")
                thin_thresh = gr.Slider(
                    3, 20, value=8, step=1,
                    label="偏薄阈值（像素）")
                run_btn = gr.Button("开始处理", variant="primary")

            # 右侧输出区
            with gr.Column(scale=2):
                with gr.Tabs():
                    with gr.TabItem("单扇裁剪"):
                        sector_out = gr.Image(label="单扇裁剪图", type="filepath")
                        reconstruct_out = gr.Image(label="拼接还原图", type="filepath")
                        diff_out = gr.Image(label="差异对比图", type="filepath")
                        diff_text = gr.Textbox(label="差异统计", interactive=False)
                    with gr.TabItem("宽度检测"):
                        width_out = gr.Image(label="宽度标注图", type="filepath")
                        width_stat = gr.Textbox(label="统计信息", interactive=False)
                    with gr.TabItem("连通性检测"):
                        conn_out = gr.Image(label="连通性标注图", type="filepath")
                        conn_stat = gr.Textbox(label="统计信息", interactive=False)
                    with gr.TabItem("下载PDF"):
                        gr.Markdown("**纯净版**：无标注，直接打印下刀用  |  **指导版**：含▲标记和图例，剪之前参考用")
                        pdf_file = gr.File(label="纯净版 PDF（下刀用）")
                        pdf_preview = gr.File(label="施工指导版 PDF（参考用）")

                log_box = gr.Textbox(label="处理日志", lines=12, interactive=False)

        run_btn.click(
            process,
            inputs=[image_input, fold_count, danger_thresh, thin_thresh, axis],
            outputs=[sector_out, reconstruct_out, diff_out, diff_text,
                     width_out, width_stat, conn_out, conn_stat,
                     pdf_file, log_box, pdf_preview]
        )
    return demo


if __name__ == "__main__":
    app = build_ui()
    app.launch(server_name="0.0.0.0", server_port=7860, share=False)
