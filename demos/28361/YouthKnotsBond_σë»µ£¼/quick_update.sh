#!/bin/bash

# 解铃契 - 快速更新部署脚本
# 使用方法: bash quick_update.sh

echo "🚀 开始部署解铃契更新..."
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 服务器信息
SERVER="root@120.55.39.185"
PASSWORD="my_key"

echo "${YELLOW}📦 第一步：上传后端修改文件${NC}"
echo "上传 agentService.js..."
scp /Users/macbook/Desktop/YouthKnotsBond/backend/src/utils/agentService.js \
    ${SERVER}:/root/youthknotsbond-backend/src/utils/

if [ $? -eq 0 ]; then
    echo "${GREEN}✅ 文件上传成功${NC}"
else
    echo "${RED}❌ 文件上传失败${NC}"
    exit 1
fi

echo ""
echo "${YELLOW}🔄 第二步：重启后端服务${NC}"
ssh ${SERVER} << 'EOF'
cd /root/youthknotsbond-backend
pm2 restart youthknotsbond-backend
echo "等待服务启动..."
sleep 3
pm2 logs youthknotsbond-backend --lines 10
EOF

if [ $? -eq 0 ]; then
    echo "${GREEN}✅ 后端服务重启成功${NC}"
else
    echo "${RED}❌ 后端服务重启失败${NC}"
    exit 1
fi

echo ""
echo "${YELLOW}🧪 第三步：测试API${NC}"
echo "测试健康检查接口..."
curl -s https://youthknotsbond.qingguoguang.com/health | jq .

echo ""
echo "${GREEN}✅ 部署完成！${NC}"
echo ""
echo "📝 接下来的步骤："
echo "1. 在Xcode中打开项目"
echo "2. Command + Shift + K (清理构建)"
echo "3. Command + B (重新构建)"
echo "4. Command + R (运行测试)"
echo ""
echo "🎉 所有更新已完成！"
