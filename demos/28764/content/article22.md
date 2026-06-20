# YOLO11 垃圾分类：从数据集准备到模型部署的完整指南

## 项目简介

本项目使用 Ultralytics YOLO11n 模型，基于自建的垃圾分类数据集（约 1600+ 张图片），实现了对四类垃圾（可回收垃圾、有害垃圾、厨余垃圾、其他垃圾）的自动识别与检测。项目涵盖了数据集准备、数据划分、模型训练、推理检测的完整流程，是一份面向初学者的 YOLO11 目标检测实战教程。

## 功能特性

- **四类垃圾识别**：可回收垃圾、有害垃圾、厨余垃圾、其他垃圾
- **完整训练流程**：数据集准备 → 划分 → 训练 → 验证 → 推理
- **预训练模型微调**：基于 YOLO11n 预训练权重迁移学习
- **实时检测**：支持图片、视频、摄像头实时检测
- **自动数据划分**：内置数据集自动划分脚本

## 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                   YOLO11 垃圾分类系统                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐  │
│  │  原始数据集   │────►│  数据划分    │────►│  训练集/验证集 │  │
│  │  (1600+张)   │     │  (自动划分)  │     │  (80%/20%)   │  │
│  └─────────────┘     └─────────────┘     └──────┬──────┘  │
│                                                 │          │
│                                                 ▼          │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐  │
│  │  检测结果    │◄────│  YOLO11n    │◄────│  模型训练    │  │
│  │  (标注框+   │     │  推理引擎    │     │  (迁移学习)  │  │
│  │   类别+置信度)│     └─────────────┘     └─────────────┘  │
│  └─────────────┘                                           │
│                                                             │
│  检测类别：                                                  │
│  ├── 0: recyclable waste  (可回收垃圾)                       │
│  ├── 1: hazardous waste   (有害垃圾)                        │
│  ├── 2: kitchen waste     (厨余垃圾)                        │
│  └── 3: other waste       (其他垃圾)                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 所需环境

### 硬件要求

| 组件 | 最低要求 | 推荐配置 |
|------|---------|---------|
| GPU | NVIDIA GTX 1060 (6GB) | NVIDIA RTX 3060 (12GB) |
| 内存 | 8GB | 16GB+ |
| 硬盘 | 10GB 可用空间 | SSD 20GB+ |
| CPU | 4 核 | 8 核+ |

> **注意**：没有 GPU 也可以使用 CPU 训练，但速度会非常慢。建议使用 Google Colab（免费 GPU）进行训练。

### 软件环境

- **操作系统**：Windows 10/11、Ubuntu 20.04+、macOS
- **Python**：3.8 - 3.11
- **CUDA**：11.8+（GPU 训练需要）
- **cuDNN**：8.0+（GPU 训练需要）

### 安装依赖

```bash
# 创建虚拟环境（推荐）
python -m venv yolo-env
source yolo-env/bin/activate  # Linux/Mac
yolo-env\Scripts\activate     # Windows

# 安装依赖
pip install ultralytics>=8.3.0
pip install opencv-python>=4.8.0
pip install torch>=2.0.0
pip install numpy>=1.24.0

# 验证安装
yolo version
python -c "import torch; print(f'PyTorch: {torch.__version__}, CUDA: {torch.cuda.is_available()}')"
```

### requirements.txt

```
ultralytics>=8.3.0
opencv-python>=4.8.0
torch>=2.0.0
numpy>=1.24.0
```

---

## 数据集准备

### 数据集结构

本项目使用的是自建的垃圾分类数据集，包含约 **1600+** 张图片，分为四类：

| 类别 | 英文名 | 标签值 | 示例物品 |
|------|--------|--------|---------|
| 可回收垃圾 | recyclable waste | 0 | 塑料瓶、纸箱、金属罐、玻璃瓶 |
| 有害垃圾 | hazardous waste | 1 | 电池、灯泡、药品、油漆桶 |
| 厨余垃圾 | kitchen waste | 2 | 果皮、剩饭、菜叶、蛋壳 |
| 其他垃圾 | other waste | 3 | 纸巾、烟蒂、陶瓷碎片、尘土 |

### 目录结构

```
YOLO11垃圾分类/
├── data.yaml                  # 数据集配置（原始）
├── data_split.yaml            # 数据集配置（划分后）
├── train.py                   # 训练脚本
├── detect.py                  # 检测脚本
├── requirements.txt           # Python 依赖
├── yolo11n.pt                 # YOLO11n 预训练权重
├── best.pt                    # 训练好的最佳模型权重
├── LICENSE                    # MIT 开源协议
└── yolo垃圾分类数据集/
    └── images/
        ├── fimg_1.jpg
        ├── fimg_10.jpg
        ├── fimg_100.jpg
        └── ... (1600+ 张图片)
```

### 数据集配置文件

**原始配置（data.yaml）**：

```yaml
# YOLO11 垃圾分类数据集配置
path: ./yolo垃圾分类数据集   # 数据集根目录
train: images              # 训练图片目录
val: images                # 验证图片目录（共用images）

# 类别名称
names:
  0: recyclable waste    # 可回收垃圾
  1: hazardous waste     # 有害垃圾
  2: kitchen waste       # 厨余垃圾
  3: other waste         # 其他垃圾

nc: 4  # 类别数量
```

**划分后配置（data_split.yaml）**：

```yaml
# 垃圾分类数据集（自动划分）
path: yolo垃圾分类数据集
train: train/images
val: val/images

nc: 4
names:
  0: recyclable waste
  1: hazardous waste
  2: kitchen waste
  3: other waste
```

### 数据集质量要求

- **图片格式**：JPG、PNG
- **标注格式**：YOLO TXT 格式（每张图片对应一个同名 `.txt` 文件）
- **标注内容**：`类别ID 中心X 中心Y 宽度 高度`（归一化到 0-1）
- **建议比例**：每类至少 200+ 张，各类别数量尽量均衡

---

## 模型训练

### YOLO11n 模型简介

YOLO11n 是 Ultralytics 最新一代 YOLO 模型中的 nano 版本，特点：

| 特性 | 说明 |
|------|------|
| 参数量 | ~2.6M（最小） |
| 速度 | 最快，适合边缘部署 |
| 精度 | 在速度和精度间取得平衡 |
| 适用场景 | 移动端、嵌入式设备、实时检测 |

### 训练脚本（train.py）

```python
from ultralytics import YOLO

def main():
    # 加载预训练模型
    model = YOLO('yolo11n.pt')
    
    # 开始训练
    results = model.train(
        data='data_split.yaml',     # 数据集配置文件
        epochs=100,                 # 训练轮数
        imgsz=640,                  # 输入图片尺寸
        batch=16,                   # 批次大小（根据显存调整）
        device=0,                   # GPU 设备（0为第一块GPU，'cpu'为CPU）
        workers=4,                  # 数据加载线程数
        project='runs/train',       # 保存目录
        name='garbage_cls',         # 实验名称
        exist_ok=True,              # 允许覆盖
        pretrained=True,            # 使用预训练权重
        optimizer='AdamW',          # 优化器
        lr0=0.001,                  # 初始学习率
        lrf=0.01,                   # 最终学习率衰减系数
        momentum=0.937,             # SGD动量/Adam beta1
        weight_decay=0.0005,        # 权重衰减
        warmup_epochs=3,            # 预热轮数
        warmup_momentum=0.8,        # 预热动量
        box=7.5,                    # box损失权重
        cls=0.5,                    # 分类损失权重
        dfl=1.5,                    # dfl损失权重
        patience=20,                # 早停耐心值
        save=True,                  # 保存检查点
        save_period=-1,            # 保存频率（-1为仅保存best和last）
        cache=False,                # 缓存数据集（True加速但占内存）
        amp=True,                   # 自动混合精度训练
        verbose=True,               # 详细输出
    )
    
    print("训练完成！")
    print(f"最佳模型保存在: {results.save_dir}/weights/best.pt")
    print(f"最终模型保存在: {results.save_dir}/weights/last.pt")

if __name__ == '__main__':
    main()
```

### 训练参数详解

| 参数 | 值 | 说明 |
|------|-----|------|
| `epochs` | 100 | 训练轮数，可根据收敛情况调整 |
| `imgsz` | 640 | 输入尺寸，640为标准尺寸 |
| `batch` | 16 | 批次大小，显存不足时减小（8/4） |
| `device` | 0 | GPU编号，`cpu`则使用CPU训练 |
| `patience` | 20 | 早停：20轮无改善则停止 |
| `amp` | True | 混合精度训练，节省显存加速训练 |
| `optimizer` | AdamW | 优化器，AdamW收敛更稳定 |

### 训练过程监控

训练过程中，Ultralytics 会自动生成以下输出：

```
runs/train/garbage_cls/
├── weights/
│   ├── best.pt          # 最佳模型权重
│   └── last.pt          # 最后一轮权重
├── results.csv          # 训练指标记录
├── results.png          # 训练曲线图
├── confusion_matrix.png # 混淆矩阵
├── labels.jpg           # 标签分布
├── labels_correlogram.jpg # 标签相关性
├── PR_curve.png         # P-R 曲线
├── F1_curve.png         # F1 曲线
├── P_curve.png          # 精确率曲线
├── R_curve.png          # 召回率曲线
├── val_batch0_pred.jpg  # 验证集预测示例
├── val_batch0_labels.jpg # 验证集标签示例
└── args.yaml            # 训练参数记录
```

### 关键指标解读

- **mAP@0.5**：IoU 阈值 0.5 时的平均精度均值，越高越好
- **mAP@0.5:0.95**：IoU 0.5-0.95 的平均精度均值，更严格
- **Precision**：精确率，预测为正的样本中真正为正的比例
- **Recall**：召回率，真正为正的样本中被正确预测的比例
- **Loss**：损失值，应持续下降并趋于稳定

### 使用 Google Colab 免费训练

如果没有 GPU，可以使用 Google Colab：

```python
# 在 Colab 中执行
!pip install ultralytics

from ultralytics import YOLO
model = YOLO('yolo11n.pt')
model.train(data='data_split.yaml', epochs=100, imgsz=640, batch=16)

# 训练完成后下载模型
from google.colab import files
files.download('runs/train/garbage_cls/weights/best.pt')
```

---

## 模型推理与检测

### 检测脚本（detect.py）

```python
from ultralytics import YOLO

def main():
    # 加载训练好的最佳模型
    model = YOLO('best.pt')
    
    # ===== 图片检测 =====
    # 检测单张图片
    results = model.predict(
        source='test_image.jpg',  # 图片路径
        conf=0.25,                # 置信度阈值
        iou=0.45,                 # NMS IoU 阈值
        imgsz=640,                # 推理尺寸
        save=True,                # 保存结果图片
        save_txt=True,             # 保存检测结果TXT
        save_conf=True,            # 保存置信度
        project='runs/detect',    # 保存目录
        name='predict',           # 实验名称
        exist_ok=True,
    )
    
    # 批量检测
    results = model.predict(
        source='yolo垃圾分类数据集/images/',
        conf=0.25,
        save=True,
    )
    
    # ===== 视频检测 =====
    results = model.predict(
        source='test_video.mp4',
        conf=0.25,
        save=True,
    )
    
    # ===== 摄像头实时检测 =====
    results = model.predict(
        source=0,  # 0为默认摄像头
        conf=0.25,
        save=True,
    )
    
    # 打印检测结果
    for result in results:
        boxes = result.boxes
        for box in boxes:
            cls_id = int(box.cls[0])
            conf = float(box.conf[0])
            cls_name = model.names[cls_id]
            xyxy = box.xyxy[0].tolist()
            print(f"检测到: {cls_name} (置信度: {conf:.2f}) 位置: {xyxy}")

if __name__ == '__main__':
    main()
```

### 检测参数详解

| 参数 | 值 | 说明 |
|------|-----|------|
| `conf` | 0.25 | 置信度阈值，低于此值的结果被过滤 |
| `iou` | 0.45 | NMS IoU 阈值，去除重叠框 |
| `imgsz` | 640 | 推理图片尺寸 |
| `save` | True | 是否保存检测结果图片 |
| `save_txt` | True | 是否保存 TXT 格式检测结果 |
| `max_det` | 300 | 每张图片最大检测数量 |

### 命令行快速检测

```bash
# 图片检测
yolo predict model=best.pt source=test.jpg conf=0.25

# 视频检测
yolo predict model=best.pt source=test.mp4

# 摄像头实时检测
yolo predict model=best.pt source=0

# 指定保存目录
yolo predict model=best.pt source=images/ project=runs/detect name=result
```

---

## 训练技巧与优化

### 1. 数据增强

YOLO11 内置了丰富的数据增强策略，训练时自动应用：

- **Mosaic**：将 4 张图片拼接为 1 张
- **MixUp**：混合两张图片
- **HSV 变换**：调整色调、饱和度、亮度
- **随机翻转**：水平/垂直翻转
- **随机缩放**：0.5-1.5 倍缩放
- **随机旋转**：±10° 旋转

### 2. 超参数调优建议

| 场景 | epochs | batch | lr0 | imgsz |
|------|--------|-------|-----|-------|
| 快速实验 | 30 | 32 | 0.01 | 320 |
| 正常训练 | 100 | 16 | 0.001 | 640 |
| 精细调优 | 200 | 8 | 0.0005 | 640 |
| 高精度 | 300 | 8 | 0.0001 | 1280 |

### 3. 常见问题与解决

#### 训练损失不下降

**可能原因**：
- 学习率过大或过小
- 数据集标注错误
- 类别不均衡严重

**解决方案**：
- 调整学习率（尝试 0.0001 - 0.01）
- 检查标注文件格式是否正确
- 对少数类进行过采样或增加数据

#### mAP 过低

**可能原因**：
- 数据集太小
- 类别相似度高（如不同类型的纸张）
- 训练轮数不够

**解决方案**：
- 增加数据量（数据增强、网络爬取）
- 合并相似类别
- 延长训练轮数

#### 显存不足 (CUDA Out of Memory)

**解决方案**：
- 减小 `batch`（16 → 8 → 4）
- 减小 `imgsz`（640 → 480 → 320）
- 开启 `amp=True`（混合精度）
- 关闭 `cache=False`

#### 检测不到目标

**可能原因**：
- `conf` 阈值过高
- 模型未充分训练
- 检测场景与训练数据差异大

**解决方案**：
- 降低置信度阈值（0.25 → 0.1）
- 使用更多轮数训练
- 增加类似场景的训练数据

---

## 模型导出与部署

### 导出为不同格式

```python
from ultralytics import YOLO

model = YOLO('best.pt')

# 导出为 ONNX
model.export(format='onnx')

# 导出为 TensorRT（NVIDIA GPU 加速）
model.export(format='engine')

# 导出为 CoreML（iOS 部署）
model.export(format='coreml')

# 导出为 TFLite（Android 部署）
model.export(format='tflite')

# 导出为 OpenVINO（Intel 硬件加速）
model.export(format='openvino')
```

### 部署场景

| 格式 | 适用平台 | 速度提升 |
|------|---------|---------|
| ONNX | 跨平台通用 | 2-3x |
| TensorRT | NVIDIA GPU | 3-5x |
| CoreML | iOS/macOS | 原生优化 |
| TFLite | Android/嵌入式 | 原生优化 |
| OpenVINO | Intel CPU/GPU | 2-4x |

---

## 项目文件说明

| 文件 | 说明 |
|------|------|
| `train.py` | 模型训练脚本 |
| `detect.py` | 模型推理/检测脚本 |
| `data.yaml` | 数据集配置（原始，共用images目录） |
| `data_split.yaml` | 数据集配置（划分后，train/val分离） |
| `yolo11n.pt` | YOLO11n 预训练权重（2.6M参数） |
| `best.pt` | 训练完成后的最佳模型权重 |
| `requirements.txt` | Python 依赖列表 |
| `LICENSE` | MIT 开源协议 |

---

## 参考文档

- [Ultralytics YOLO11 官方文档](https://docs.ultralytics.com/)
- [YOLO11 GitHub 仓库](https://github.com/ultralytics/ultralytics)
- [YOLO11 模型对比](https://docs.ultralytics.com/models/yolo11/)
- [YOLO 训练参数详解](https://docs.ultralytics.com/modes/train/)
- [YOLO 推理预测](https://docs.ultralytics.com/modes/predict/)
- [PyTorch 官方文档](https://pytorch.org/docs/)

---

**项目协议**：MIT License — 自由使用、修改、分发

**注意**：训练模型需要一定的计算资源。如果本地没有合适的 GPU，推荐使用 Google Colab 免费训练。数据集质量直接决定模型效果，建议花时间整理高质量的标注数据。
