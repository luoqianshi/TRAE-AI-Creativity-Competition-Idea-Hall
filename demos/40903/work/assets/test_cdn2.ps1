[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$urls = @(
  "https://cdn.jsdelivr.net/npm/d3@7.8.5/dist/d3.min.js",
  "https://unpkg.com/d3@7.8.5/dist/d3.min.js"
)
foreach ($u in $urls) {
  try {
    $r = Invoke-WebRequest -Uri $u -UseBasicParsing -Method Head
    Write-Host ("OK " + $r.StatusCode + " " + $u)
  } catch {
    Write-Host ("FAIL " + $_.Exception.Message + " | " + $u)
  }
}
