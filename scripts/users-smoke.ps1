$ErrorActionPreference = 'Stop'

# Config
$BaseUrl = "http://localhost:" + ($env:PORT ? $env:PORT : 3000)
$Email = $env:TEST_EMAIL
$Password = $env:TEST_PASSWORD

if (-not $Email -or -not $Password) {
  Write-Host "Please set TEST_EMAIL and TEST_PASSWORD environment variables (or edit this file)." -ForegroundColor Yellow
  Write-Host "Example:" -ForegroundColor Yellow
  Write-Host "  setx TEST_EMAIL admin@example.com" -ForegroundColor Yellow
  Write-Host "  setx TEST_PASSWORD Password123!" -ForegroundColor Yellow
  exit 1
}

Write-Host "Logging in as $Email ..." -ForegroundColor Cyan
$loginBody = @{ email = $Email; password = $Password } | ConvertTo-Json -Depth 5
$loginResp = Invoke-RestMethod -Method POST -Uri "$BaseUrl/api/auth/login" -ContentType 'application/json' -Body $loginBody

if (-not $loginResp.accessToken) {
  throw "Login failed. Response: $($loginResp | ConvertTo-Json -Depth 10)"
}

$token = $loginResp.accessToken
$userId = $loginResp.user.userId
Write-Host "Login OK. UserId=$userId" -ForegroundColor Green

# Fetch current user (no role decorator on findOne, only JWT required)
$headers = @{ Authorization = "Bearer $token" }
$me = Invoke-RestMethod -Method GET -Uri "$BaseUrl/api/users/$userId" -Headers $headers

Write-Host "User fetched:" -ForegroundColor Green
$me | ConvertTo-Json -Depth 10

# Optionally, try admin-only list (will fail if not Admin)
try {
  $all = Invoke-RestMethod -Method GET -Uri "$BaseUrl/api/users" -Headers $headers
  Write-Host "Users list (admin endpoints):" -ForegroundColor Green
  $all | ConvertTo-Json -Depth 10
} catch {
  Write-Host "Skipping users list (requires Admin role)" -ForegroundColor Yellow
}


