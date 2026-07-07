#!/bin/bash
# OmniLog Intelligence 私有化部署脚本
# 适用于政企场景，数据不出域

set -e

echo "========================================="
echo "OmniLog Intelligence 私有化部署"
echo "========================================="

# 1. 检查环境
echo "[1/5] 检查部署环境..."
if ! command -v docker &> /dev/null; then
    echo "错误: 未安装 Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "错误: 未安装 docker-compose"
    exit 1
fi

echo "Docker 版本: $(docker --version)"
echo "Docker Compose 版本: $(docker-compose --version)"

# 2. 配置环境
echo ""
echo "[2/5] 配置环境变量..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "已从模板创建 .env 文件"
    echo "请编辑 .env 配置必要参数后重新运行"
    exit 0
fi

# 加载 .env 中的变量供后续检查使用
set -a
. ./.env
set +a

# 3. 检查必要配置
echo ""
echo "[3/5] 检查必要配置..."
if [ -z "$DEEPSEEK_API_KEY" ] && [ "$LLM_PROVIDER" = "deepseek" ]; then
    echo "警告: DEEPSEEK_API_KEY 未配置，LLM 功能将不可用"
    echo "如需私有化部署，请设置 LLM_PROVIDER=local 并配置 LOCAL_LLM_ENDPOINT"
fi

# 4. 构建镜像
echo ""
echo "[4/5] 构建镜像..."
docker-compose build

# 5. 启动服务
echo ""
echo "[5/5] 启动服务..."
docker-compose up -d

echo ""
echo "========================================="
echo "部署完成"
echo "========================================="
echo ""
echo "服务状态:"
docker-compose ps
echo ""
echo "API 地址: http://localhost:${API_PORT:-8000}"
echo "Dashboard: http://localhost:${DASHBOARD_PORT:-8501}"
echo ""
echo "日志查看: docker-compose logs -f"
echo "停止服务: docker-compose down"
