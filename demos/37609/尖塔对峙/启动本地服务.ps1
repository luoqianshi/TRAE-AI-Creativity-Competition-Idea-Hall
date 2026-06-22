$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$port = 4183
$url = "http://127.0.0.1:$port/"

Add-Type -AssemblyName System.Web

$mimeTypes = @{
  '.html' = 'text/html; charset=utf-8'
  '.js' = 'application/javascript; charset=utf-8'
  '.css' = 'text/css; charset=utf-8'
  '.svg' = 'image/svg+xml'
  '.png' = 'image/png'
  '.jpg' = 'image/jpeg'
  '.jpeg' = 'image/jpeg'
  '.gif' = 'image/gif'
  '.webp' = 'image/webp'
  '.mp3' = 'audio/mpeg'
  '.wav' = 'audio/wav'
  '.json' = 'application/json; charset=utf-8'
  '.map' = 'application/json; charset=utf-8'
  '.ico' = 'image/x-icon'
}

$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add($url)

try {
  $listener.Start()
} catch {
  Write-Host "Failed to start local server on port $port."
  Write-Host $_.Exception.Message
  Read-Host 'Press Enter to exit'
  exit 1
}

Start-Process $url | Out-Null
Write-Host ''
Write-Host 'Game server started.'
Write-Host "Browser URL: $url"
Write-Host 'Keep this window open while playing.'
Write-Host ''

try {
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $requestPath = [System.Web.HttpUtility]::UrlDecode($context.Request.Url.AbsolutePath.TrimStart('/'))

    if ([string]::IsNullOrWhiteSpace($requestPath)) {
      $requestPath = 'index.html'
    }

    $safePath = $requestPath.Replace('/', '\')
    $fullPath = [System.IO.Path]::GetFullPath((Join-Path $root $safePath))

    if (-not $fullPath.StartsWith($root, [System.StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path $fullPath -PathType Leaf)) {
      $context.Response.StatusCode = 404
      $bytes = [System.Text.Encoding]::UTF8.GetBytes('Not Found')
      $context.Response.ContentType = 'text/plain; charset=utf-8'
      $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
      $context.Response.OutputStream.Close()
      continue
    }

    $extension = [System.IO.Path]::GetExtension($fullPath).ToLowerInvariant()
    $context.Response.ContentType = $mimeTypes[$extension]
    if (-not $context.Response.ContentType) {
      $context.Response.ContentType = 'application/octet-stream'
    }

    $bytes = [System.IO.File]::ReadAllBytes($fullPath)
    $context.Response.ContentLength64 = $bytes.Length
    $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    $context.Response.OutputStream.Close()
  }
} finally {
  if ($listener.IsListening) {
    $listener.Stop()
  }
  $listener.Close()
}
