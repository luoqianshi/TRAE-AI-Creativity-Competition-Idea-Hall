try {
  $r = Invoke-WebRequest -Uri "http://127.0.0.1:8765/assets/china-provinces.json" -UseBasicParsing
  Write-Host ("STATUS=" + $r.StatusCode + " LEN=" + $r.RawContentLength)
} catch {
  Write-Host ("FAIL: " + $_.Exception.Message)
}
