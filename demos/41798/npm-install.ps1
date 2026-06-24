# npm-install.ps1 - Install dependencies using taobao mirror via environment variables

Write-Host "Setting up npm registry mirror and installing dependencies..." -ForegroundColor Green

# Set environment variables for taobao mirror
$env:NODE_ENV = "development"
$env:npm_config_registry = "https://registry.npmmirror.com"

Write-Host "Environment variables set:" -ForegroundColor Yellow
Write-Host "  NODE_ENV: $env:NODE_ENV" -ForegroundColor Yellow
Write-Host "  npm_config_registry: $env:npm_config_registry" -ForegroundColor Yellow

# Try to install dependencies with the configured registry
try {
    Write-Host "`nInstalling dependencies with taobao mirror..." -ForegroundColor Cyan
    npm install

    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Dependencies installed successfully!" -ForegroundColor Green
        Write-Host "You can now run the application with:" -ForegroundColor Yellow
        Write-Host "  npm run dev:electron" -ForegroundColor White
    } else {
        Write-Host "`n❌ Installation failed. Trying alternative approach..." -ForegroundColor Red

        # Alternative: try with just basic packages first
        Write-Host "Installing basic packages only..." -ForegroundColor Cyan
        npm install react react-dom qrcode.react --no-optional --ignore-scripts

        if ($LASTEXITCODE -eq 0) {
            Write-Host "Basic packages installed. Electron installation may require manual setup." -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "Error during installation: $_" -ForegroundColor Red
}

Write-Host "`nInstallation script completed." -ForegroundColor Green