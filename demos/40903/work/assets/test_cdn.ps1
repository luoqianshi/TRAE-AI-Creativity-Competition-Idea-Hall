[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$urls = @(
  "https://cdn.jsdelivr.net/npm/d3-geo@3.1.1/dist/d3-geo.min.js",
  "https://unpkg.com/d3-geo@3.1.1/dist/d3-geo.min.js",
  "https://d3js.org/d3-geo.v3.min.js"
)
foreach ($u in $urls) {
  try {
    $r = Invoke-WebRequest -Uri $u -UseBasicParsing -Method Head
    Write-Host ("OK " + $r.StatusCode + " " + $u)
  } catch {
    Write-Host ("FAIL " + $_.Exception.Message + " | " + $u)
  }
}
