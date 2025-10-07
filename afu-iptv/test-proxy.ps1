# Stream Proxy Test Script
# Port 3002'de çalışan development sunucusunu test eder

$streamUrl = "http://tgrpro25.xyz:8080/play/hls-nginx/665166ed-8eb5-4a22-a73e-d61a36e0d584/665166ed-8eb5-4a22-a73e-d61a36e0d584_1759684618.ts?token=eyJpdiI6IjZ6aE12WWlXcmdrNTgzY3RpRzVQWUE9PSIsInZhbHVlIjoiOGY4YkxsdzlMcnAxNFFZU3N3NFNpU2pQaFlxeURqVG5TWkRyUG5YT3BqT2lDWFRSajRFbE5ycUwyQXRzYklkZCIsIm1hYyI6IjBiMjkyNjU3OTdiNTg3YjNjODFjZTM5NDBlNWMyMGU4NTkxOTRmYWU0YzEzZjMxYmY5NjE2Njk2NTM5Yjk3MjgiLCJ0YWciOiIifQ%3D%3D&h=d02b388cae257fb4c467ba92db49a85e&r=cd290e&rt=2f37c32dee90a7e90ffd09d067f18d51&s=3609788&lvtoken=eyJpdiI6IlJCeHp5aVVLUkNta1dDUnd1RUNxckE9PSIsInZhbHVlIjoiYk95cm02ejVORFZQWlJlMWRoTUwvak96cnord25WbzlrMGwxZHJsQTZDSWo2M1lrUWF0ZFFQMVBhMTlXby81dk1GM1ZwdU1yTUxuN1prOTFEMTdKNDhGeU1CemJVdU5aM2lGR3UvbTd3UDBQN051ZnJxeFkzQ1BNWHFKYUZRUDJDaGJDVmlyQmVWMjRoazBoWFRNSkZzNE0wZVRvZE5xSUlLWndoOEpvS21zeVFaS2FPYmZhRTRLWk1MTjNHRVNVQnZkTXo1VGY5aWNLS3IrNElSR1pudz09IiwibWFjIjoiOGI0MGQxMGY5ZWUzNWZmZjk0OGJmNmE3OTVlMWIzOWJkZTVlNTVlM2E4OGNlYzI0OTM1YTcyZTBhOGM5ZTE5MiIsInRhZyI6IiJ9"
$referer = "http://tgrpro25.xyz:8080/live/Mustafa0301/03012025@xyz/307968.m3u8"

# URL encode
$encodedStreamUrl = [System.Uri]::EscapeDataString($streamUrl)
$encodedReferer = [System.Uri]::EscapeDataString($referer)

# Test 1: Debug mode ile
Write-Host "=== Test 1: Debug Mode ===" -ForegroundColor Cyan
$proxyUrl = "http://localhost:3000/api/proxy/stream?url=$encodedStreamUrl&referer=$encodedReferer&debug=1"
Write-Host "URL: $proxyUrl" -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri $proxyUrl -Method GET -Headers @{
        "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        "Accept" = "*/*"
        "Accept-Language" = "tr,en-US;q=0.9,en;q=0.8"
        "Referer" = "http://localhost:3000/"
    } -UseBasicParsing
    
    Write-Host "✅ Success! Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Headers:" -ForegroundColor Yellow
    $response.Headers | Format-Table
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "Status Code: $statusCode" -ForegroundColor Red
        
        # Response body'yi oku
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        $reader.Close()
        Write-Host "Response: $responseBody" -ForegroundColor Yellow
    }
}

# Test 2: Daha basit bir test
Write-Host "`n=== Test 2: Simple m3u8 Test ===" -ForegroundColor Cyan
$simpleStreamUrl = "http://tgrpro25.xyz:8080/live/Mustafa0301/03012025@xyz/307968.m3u8"
$encodedSimpleUrl = [System.Uri]::EscapeDataString($simpleStreamUrl)
$proxyUrl2 = "http://localhost:3000/api/proxy/stream?url=$encodedSimpleUrl&debug=1"

Write-Host "URL: $proxyUrl2" -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri $proxyUrl2 -Method GET -UseBasicParsing
    Write-Host "✅ Success! Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Content Length: $($response.Content.Length)" -ForegroundColor Yellow
    Write-Host "First 500 chars:" -ForegroundColor Yellow
    Write-Host $response.Content.Substring(0, [Math]::Min(500, $response.Content.Length))
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "Status Code: $statusCode" -ForegroundColor Red
    }
}

# Test 3: Health check
Write-Host "`n=== Test 3: Health Check ===" -ForegroundColor Cyan
try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/health" -Method GET
    Write-Host "✅ Health Check Success!" -ForegroundColor Green
    $healthResponse | ConvertTo-Json -Depth 10 | Write-Host
} catch {
    Write-Host "❌ Health Check Failed: $($_.Exception.Message)" -ForegroundColor Red
}

