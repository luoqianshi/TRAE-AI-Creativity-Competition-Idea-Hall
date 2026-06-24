$ErrorActionPreference = "Stop"
try {
  Invoke-WebRequest -Uri "https://cdn.jsdelivr.net/npm/d3@7.8.5/dist/d3.min.js" -OutFile "$PSScriptRoot\d3.min.js" -UseBasicParsing
  Write-Host "Downloaded d3.min.js, size:" (Get-Item "$PSScriptRoot\d3.min.js").Length
} catch {
  Write-Host "FAIL:" $_.Exception.Message
  exit 1
}
