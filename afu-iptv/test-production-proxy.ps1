# Production Proxy Test Script
# https://teve.ahmetfuzunkaya.com üzerinde proxy'yi test eder

$baseUrl = "https://teve.ahmetfuzunkaya.com"
$streamUrl = "http://tgrpro25.xyz:8080/play/hls-nginx/a4c050db-2ad7-429f-9deb-441335b3208e/a4c050db-2ad7-429f-9deb-441335b3208e_1759804967.ts?token=eyJpdiI6IjBTR3c0VHFhMFFjQzMxVTN0cmNqSlE9PSIsInZhbHVlIjoiaVE4NEQyT0hDaStSNU56eUZBemV3ajYwOEN0MFdZeklmQ2xwQTFzS0NtNHhsU2NvR1lJTFZVOVFJNDBrL2JVZCIsIm1hYyI6Ijg0MDYwYmYxM2FkMWI4OWMzYmYyODMxYWYxODBmNzNiMzlhYTc1NjY0NjcwYWI3ZTBmYTQ0MDg3M2Y0Y2M4ZGYiLCJ0YWciOiIifQ%3D%3D&h=9703348edd643ff880992149cacd7feb&r=e05d04&rt=6e47434b15a5b42fb6b7fe656de5fec9&s=1358864&lvtoken=eyJpdiI6InBKdFIzc0pXOHFHYzZRS1h0REF2QUE9PSIsInZhbHVlIjoiSG9iOGRUMXJDaUx0TGFDMTRJd0M1L2gwbndHdG1xM0lzOEEvQUI3SXFDS3I1N0VKaWJuUFMwMVkvdVk5SmRCTndXR0szeGF4bTV5d3IwY1ZkTzBmc1VGc2M0N0dNdjV5b040SW4yWHJyUHltb2J6RkNBc1NaQ3JIZmFuVnc0Yml1NFBZRWg3dUJoc2h3MHcrQmMycE4yVTlZOEVlY09VYXVMMUsycllIVGVqeHNJdm5zZ0ZTclMxdk9STHRGNXl5WFZoL1dnYURUYmNxRy9wbXhVRUJrQT09IiwibWFjIjoiNTI4YmFjYzYyZjU2YjE2MjI0ZmUxMjVjMjY1ZGRlYTE3NjdiNjBiYWZlMjE5YjM0OTc2YjhiMWU3YjhiYTRmMiIsInRhZyI6IiJ9"
$referer = "http://tgrpro25.xyz:8080/live/Mustafa0301/03012025@xyz/433.m3u8"

# URL encode
$encodedStreamUrl = [System.Uri]::EscapeDataString($streamUrl)
$encodedReferer = [System.Uri]::EscapeDataString($referer)

# Test 1: Health Check
Write-Host "=== Test 1: Health Check ===" -ForegroundColor Cyan
try {
    $healthResponse = Invoke-RestMethod -Uri "$baseUrl/api/health" -Method GET
    Write-Host "✅ Health Check Success!" -ForegroundColor Green
    Write-Host "Xtream Status: $($healthResponse.xtream.status)" -ForegroundColor Yellow
    if ($healthResponse.xtream.error) {
        Write-Host "Xtream Error: $($healthResponse.xtream.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Health Check Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Proxy Test Endpoint
Write-Host "`n=== Test 2: Proxy Test Endpoint ===" -ForegroundColor Cyan
$testUrl = "$baseUrl/api/proxy/test?url=$encodedStreamUrl"
Write-Host "URL: $testUrl" -ForegroundColor Yellow

try {
    $testResponse = Invoke-RestMethod -Uri $testUrl -Method GET
    Write-Host "✅ Proxy Test Success!" -ForegroundColor Green
    Write-Host "Status: $($testResponse.status)" -ForegroundColor Yellow
    Write-Host "Success: $($testResponse.success)" -ForegroundColor Yellow
    if ($testResponse.error) {
        Write-Host "Error: $($testResponse.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Proxy Test Failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "Status Code: $statusCode" -ForegroundColor Red
    }
}

# Test 3: Actual Proxy Stream (with debug)
Write-Host "`n=== Test 3: Proxy Stream (Debug Mode) ===" -ForegroundColor Cyan
$proxyUrl = "$baseUrl/api/proxy/stream?url=$encodedStreamUrl&referer=$encodedReferer&debug=1"
Write-Host "URL: $proxyUrl" -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri $proxyUrl -Method GET -Headers @{
        "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        "Accept" = "*/*"
        "Accept-Language" = "tr,en-US;q=0.9,en;q=0.8"
        "Referer" = "$baseUrl/"
    } -UseBasicParsing
    
    Write-Host "✅ Proxy Stream Success! Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Content Length: $($response.Content.Length)" -ForegroundColor Yellow
    Write-Host "Content Type: $($response.Headers['Content-Type'])" -ForegroundColor Yellow
    
    # Debug headers
    Write-Host "`nDebug Headers:" -ForegroundColor Cyan
    $debugHeaders = @("X-Proxy-Debug", "X-Proxy-Environment", "X-Proxy-Referer", "X-Proxy-Origin", "X-Proxy-Sent-Cookie", "X-Proxy-Retry", "X-Proxy-Upstream-Status", "X-Proxy-Target-Host")
    foreach ($header in $debugHeaders) {
        if ($response.Headers[$header]) {
            Write-Host "  $header`: $($response.Headers[$header])" -ForegroundColor Yellow
        }
    }
    
} catch {
    Write-Host "❌ Proxy Stream Failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "Status Code: $statusCode" -ForegroundColor Red
        
        # Response body'yi oku
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            $reader.Close()
            Write-Host "Response: $responseBody" -ForegroundColor Yellow
        } catch {
            Write-Host "Could not read response body" -ForegroundColor Red
        }
    }
}

# Test 4: Simple m3u8 test
Write-Host "`n=== Test 4: Simple m3u8 Test ===" -ForegroundColor Cyan
$simpleStreamUrl = "http://tgrpro25.xyz:8080/live/Mustafa0301/03012025@xyz/433.m3u8"
$encodedSimpleUrl = [System.Uri]::EscapeDataString($simpleStreamUrl)
$proxyUrl2 = "$baseUrl/api/proxy/stream?url=$encodedSimpleUrl&debug=1"

Write-Host "URL: $proxyUrl2" -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri $proxyUrl2 -Method GET -UseBasicParsing
    Write-Host "✅ Simple m3u8 Success! Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Content Length: $($response.Content.Length)" -ForegroundColor Yellow
    Write-Host "First 200 chars:" -ForegroundColor Yellow
    Write-Host $response.Content.Substring(0, [Math]::Min(200, $response.Content.Length))
} catch {
    Write-Host "❌ Simple m3u8 Failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "Status Code: $statusCode" -ForegroundColor Red
    }
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Green
