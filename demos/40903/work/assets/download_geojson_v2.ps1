$ErrorActionPreference = "Stop"
$outPath = "$PSScriptRoot\china-provinces-v2.json"
$url = "https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json"
try {
    Invoke-WebRequest -Uri $url -OutFile $outPath -UseBasicParsing
    $size = (Get-Item $outPath).Length
    Write-Host "Downloaded china-provinces-v2.json, size: $size bytes"
} catch {
    Write-Host "FAIL: " $_.Exception.Message
    exit 1
}
