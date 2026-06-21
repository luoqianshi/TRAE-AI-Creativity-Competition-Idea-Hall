# 简易静态文件服务器
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add('http://127.0.0.1:8000/')
$listener.Start()
Write-Host "服务器已启动: http://127.0.0.1:8000/"
Write-Host "按 Ctrl+C 停止"

$rootPath = (Get-Location).Path

$contentTypes = @{
    '.html' = 'text/html; charset=utf-8'
    '.css'  = 'text/css; charset=utf-8'
    '.js'   = 'application/javascript; charset=utf-8'
    '.json' = 'application/json; charset=utf-8'
    '.png'  = 'image/png'
    '.jpg'  = 'image/jpeg'
    '.svg'  = 'image/svg+xml'
    '.ico'  = 'image/x-icon'
}

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $urlPath = $request.Url.AbsolutePath
        if ($urlPath -eq '/' -or $urlPath -eq '') { $urlPath = '/index.html' }

        $filePath = Join-Path $rootPath ($urlPath.TrimStart('/'))

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = if ($contentTypes.ContainsKey($ext)) { $contentTypes[$ext] } else { 'application/octet-stream' }

            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentType = $contentType
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            Write-Host "[200] $urlPath"
        } else {
            $response.StatusCode = 404
            $msg = [System.Text.Encoding]::UTF8.GetBytes('404 Not Found')
            $response.OutputStream.Write($msg, 0, $msg.Length)
            Write-Host "[404] $urlPath"
        }
    } catch {
        Write-Host "Error: $_"
    } finally {
        if ($response) { $response.Close() }
    }
}
