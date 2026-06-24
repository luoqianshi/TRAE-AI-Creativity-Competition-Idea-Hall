$ErrorActionPreference = "Stop"
$outPath = "$PSScriptRoot\three.min.js"
$url = "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"
try {
    Invoke-WebRequest -Uri $url -OutFile $outPath -UseBasicParsing
    $size = (Get-Item $outPath).Length
    Write-Host "Downloaded three.min.js, size: $size bytes"
} catch {
    Write-Host "FAIL: " $_.Exception.Message
    exit 1
}
