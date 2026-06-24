$ErrorActionPreference = "Stop"
$outPath = "$PSScriptRoot\OrbitControls.js"
$url = "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js"
try {
    Invoke-WebRequest -Uri $url -OutFile $outPath -UseBasicParsing
    $size = (Get-Item $outPath).Length
    Write-Host "Downloaded OrbitControls.js, size: $size bytes"
} catch {
    Write-Host "FAIL: " $_.Exception.Message
    exit 1
}
