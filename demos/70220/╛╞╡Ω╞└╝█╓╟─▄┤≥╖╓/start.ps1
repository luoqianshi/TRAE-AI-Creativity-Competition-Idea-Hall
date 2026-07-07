# 酒店评价智能分析评分系统 - PowerShell 启动脚本
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  酒店评价智能分析评分系统 - 启动中..." -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/3] 检查 Node.js 环境..."
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host ""
    Write-Host "[错误] 未检测到 Node.js，请先安装 Node.js" -ForegroundColor Red
    Write-Host "下载地址：https://nodejs.org" -ForegroundColor Red
    Write-Host ""
    Read-Host "按回车键退出"
    exit 1
}
Write-Host "已安装 Node.js 版本：$(node --version)"
Write-Host ""

Write-Host "[2/3] 启动代理服务..."
$proxyDir = Join-Path $PSScriptRoot "proxy"
$proxyJob = Start-Job -ScriptBlock {
    Set-Location $using:proxyDir
    node proxy.js
}
Start-Sleep -Seconds 4
Write-Host "代理服务已启动，监听 http://localhost:3000" -ForegroundColor Green
Write-Host ""

Write-Host "[3/3] 打开浏览器..."
Start-Process "http://localhost:3000/"

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  系统已启动！" -ForegroundColor Green
Write-Host "  - 关闭此窗口将停止代理服务" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Green
Write-Host ""

# 保持运行，按 Ctrl+C 停止
Write-Host "按 Ctrl+C 停止代理服务..." -ForegroundColor Gray
while ($proxyJob.State -eq 'Running') {
    Start-Sleep -Seconds 1
    $output = Receive-Job -Job $proxyJob
    if ($output) { $output | ForEach-Object { Write-Host $_ } }
}
