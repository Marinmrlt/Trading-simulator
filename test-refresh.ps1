# Test Refresh Token Flow

$BaseUrl = "http://localhost:3000"
$Email = "refresh_tester@test.com"
$Password = "pass123"

Write-Host "1. Registering User..."
try {
    Invoke-RestMethod -Method Post -Uri "$BaseUrl/auth/register" -Body (@{email=$Email; password=$Password; firstName="Refresh"; lastName="Tester"} | ConvertTo-Json) -ContentType "application/json"
} catch {
    Write-Host "User likely exists, continuing..."
}

Write-Host "2. Logging In..."
$Login = Invoke-RestMethod -Method Post -Uri "$BaseUrl/auth/login" -Body (@{email=$Email; password=$Password} | ConvertTo-Json) -ContentType "application/json"
$AT = $Login.accessToken
$RT = $Login.refreshToken

Write-Host "Got AT: $AT"
Write-Host "Got RT: $RT"

if (-not $RT) {
    Write-Error "Refresh Token missing!"
    exit
}

Write-Host "3. Accessing Protected Route (with AT)..."
Invoke-RestMethod -Uri "$BaseUrl/users/me" -Method Get -Headers @{ Authorization = "Bearer $AT" }

Write-Host "4. Refreshing Tokens..."
$Refreshed = Invoke-RestMethod -Uri "$BaseUrl/auth/refresh" -Method Post -Headers @{ Authorization = "Bearer $RT" }
$NewAT = $Refreshed.accessToken
$NewRT = $Refreshed.refreshToken

Write-Host "New AT: $NewAT"
Write-Host "New RT: $NewRT"

if ($NewAT -eq $AT) {
    Write-Error "Access Token should have changed!"
} else {
    Write-Host "Tokens Rotated Successfully!"
}

Write-Host "5. Logout..."
Invoke-RestMethod -Uri "$BaseUrl/auth/logout" -Method Post -Headers @{ Authorization = "Bearer $NewAT" }
Write-Host "Logged out."

Write-Host "6. Trying Refresh with Old RT (Should Fail)..."
try {
    Invoke-RestMethod -Uri "$BaseUrl/auth/refresh" -Method Post -Headers @{ Authorization = "Bearer $RT" }
    Write-Error "Should have failed!"
} catch {
    Write-Host "Success: Old RT rejected ($($_.Exception.Response.StatusCode))"
}

Write-Host "7. Trying Refresh with Revoked RT (Should Fail)..."
try {
    Invoke-RestMethod -Uri "$BaseUrl/auth/refresh" -Method Post -Headers @{ Authorization = "Bearer $NewRT" }
    Write-Error "Should have failed (Revoked)!"
} catch {
    Write-Host "Success: Revoked RT rejected ($($_.Exception.Response.StatusCode))"
}

Write-Host "Test Complete."
