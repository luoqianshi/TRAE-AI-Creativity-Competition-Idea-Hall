# 股票观点验证系统 - PowerShell 启动脚本
# 右键 → 用 PowerShell 运行，或双击即可

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  📈 股票观点验证系统" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# 切换到脚本所在目录
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $scriptPath

Write-Host "🚀 正在启动..." -ForegroundColor Yellow
Write-Host ""

# 打开浏览器
Start-Process "http://localhost:8501"

# 启动 Streamlit
streamlit run app.py --server.port 8501

Read-Host "按回车退出"