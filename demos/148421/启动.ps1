$ErrorActionPreference = "Stop"

$NODE_EXE = "node"
$PROJECT_DIR = $PSScriptRoot
$DEV_PORT = 5173

function Check-Env {
    try {
        $version = & $NODE_EXE --version 2>&1
        if ($LASTEXITCODE -ne 0) { throw "Node.js not found" }
        Write-Host "Node.js: $version" -ForegroundColor Green
    }
    catch {
        Write-Host "ERROR: Node.js 未安装!" -ForegroundColor Red
        Write-Host "请安装: https://nodejs.org/" -ForegroundColor Yellow
        Read-Host "按 Enter 退出"
        exit 1
    }
    Set-Location $PROJECT_DIR
    if (-not (Test-Path "node_modules")) {
        Write-Host "安装依赖中..." -ForegroundColor Yellow
        & npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Host "ERROR: 依赖安装失败" -ForegroundColor Red
            Read-Host "按 Enter 退出"
            exit 1
        }
    }
}

Clear-Host
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "          单词小博士 - 快速启动" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Check-Env

Write-Host ""
Write-Host "启动开发服务器..." -ForegroundColor Green
Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "   服务器已启动: http://localhost:$DEV_PORT" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""

& npm run dev -- --host 0.0.0.0 --port $DEV_PORT
