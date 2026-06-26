# PowerShell HTTP Server for 智愿星高考志愿填报系统
# Usage: powershell -ExecutionPolicy Bypass -File server.ps1

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:3000/")
$listener.Start()
Write-Host "? 服务器已启动，访问地址: http://localhost:3000"
Write-Host "? 当前目录: $(Get-Location)"
Write-Host "按 Ctrl+C 停止服务器"

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $url = $request.Url.LocalPath
        if ($url -eq "/") {
            $url = "/index.html"
        }
        
        $filePath = Join-Path (Get-Location) $url.TrimStart("/")
        
        if (Test-Path $filePath -PathType Leaf) {
            $content = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $content.Length
            
            $ext = [System.IO.Path]::GetExtension($filePath)
            switch ($ext) {
                ".html" { $response.ContentType = "text/html; charset=UTF-8" }
                ".css"  { $response.ContentType = "text/css; charset=UTF-8" }
                ".js"   { $response.ContentType = "text/javascript; charset=UTF-8" }
                ".json" { $response.ContentType = "application/json; charset=UTF-8" }
                ".png"  { $response.ContentType = "image/png" }
                ".jpg"  { $response.ContentType = "image/jpeg" }
                ".svg"  { $response.ContentType = "image/svg+xml" }
                default { $response.ContentType = "application/octet-stream" }
            }
            
            $response.OutputStream.Write($content, 0, $content.Length)
        } else {
            $response.StatusCode = 404
            $notFound = [System.Text.Encoding]::UTF8.GetBytes("<h1>404 文件未找到</h1>")
            $response.ContentLength64 = $notFound.Length
            $response.ContentType = "text/html; charset=UTF-8"
            $response.OutputStream.Write($notFound, 0, $notFound.Length)
        }
        
        $response.Close()
    } catch {
        Write-Host "错误: $_"
    }
}

$listener.Stop()
$listener.Close()
