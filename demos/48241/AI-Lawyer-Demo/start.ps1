$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$app = Join-Path $root 'app'
$port = 4173
$url = 'http://127.0.0.1:4173/'

if (-not (Test-Path (Join-Path $app 'index.html'))) {
  Write-Host 'Missing app\index.html. Please check the package files.' -ForegroundColor Red
  Read-Host 'Press Enter to exit'
  exit 1
}

Add-Type -AssemblyName System.Web

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($url)

try {
  $listener.Start()
} catch {
  Write-Host 'Start failed. Port 4173 may already be in use.' -ForegroundColor Red
  Write-Host 'Please close other demo windows and try again.'
  Read-Host 'Press Enter to exit'
  exit 1
}

Write-Host 'AI Lawyer Demo is running.' -ForegroundColor Green
Write-Host 'Open: http://127.0.0.1:4173/'
Write-Host 'Close this window to stop the server.'
Start-Process $url

function Get-MimeType($file) {
  $ext = [System.IO.Path]::GetExtension($file).ToLowerInvariant()
  switch ($ext) {
    '.html' { 'text/html; charset=utf-8' }
    '.js' { 'text/javascript; charset=utf-8' }
    '.css' { 'text/css; charset=utf-8' }
    '.json' { 'application/json; charset=utf-8' }
    '.svg' { 'image/svg+xml' }
    '.png' { 'image/png' }
    '.jpg' { 'image/jpeg' }
    '.jpeg' { 'image/jpeg' }
    '.webp' { 'image/webp' }
    '.ico' { 'image/x-icon' }
    '.woff' { 'font/woff' }
    '.woff2' { 'font/woff2' }
    default { 'application/octet-stream' }
  }
}

while ($listener.IsListening) {
  try {
    $context = $listener.GetContext()
    $requestPath = [System.Web.HttpUtility]::UrlDecode($context.Request.Url.AbsolutePath.TrimStart('/'))
    if ([string]::IsNullOrWhiteSpace($requestPath)) { $requestPath = 'index.html' }

    $candidate = Join-Path $app $requestPath
    $full = [System.IO.Path]::GetFullPath($candidate)
    $appFull = [System.IO.Path]::GetFullPath($app)

    if (-not $full.StartsWith($appFull) -or -not (Test-Path $full) -or (Get-Item $full).PSIsContainer) {
      $full = Join-Path $app 'index.html'
    }

    $bytes = [System.IO.File]::ReadAllBytes($full)
    $context.Response.ContentType = Get-MimeType $full
    $context.Response.ContentLength64 = $bytes.Length
    $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    $context.Response.OutputStream.Close()
  } catch {
    try {
      if ($context -and $context.Response) {
        $context.Response.StatusCode = 500
        $context.Response.Close()
      }
    } catch {}
  }
}
