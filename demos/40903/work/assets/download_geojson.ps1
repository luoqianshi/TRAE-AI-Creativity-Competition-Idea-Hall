try {
  $url = "https://geo.datav.aliyun.com/areas_v3/bound/100000.json"
  $dest = "c:\Users\jere\Desktop\work\assets\china-provinces.json"
  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
  $wc = New-Object System.Net.WebClient
  $wc.Encoding = [System.Text.Encoding]::UTF8
  $wc.DownloadFile($url, $dest)
  $size = (Get-Item $dest).Length
  Write-Host ("OK size=" + $size)
} catch {
  Write-Host ("FAIL: " + $_.Exception.Message)
}
