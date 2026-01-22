# Test Script for Trading Simulator API

$BaseUrl = "http://localhost:3000"

Write-Host "1. Testing Health/Root..."
Invoke-RestMethod -Uri "$BaseUrl/" -Method Get
Write-Host "--------------------------------"

Write-Host "2. Registering User 'trader1'..."
$UserBody = @{
    email = "trader1@test.com"
    password = "password123"
    name = "Trader One"
} | ConvertTo-Json
try {
    $RegisterResponse = Invoke-RestMethod -Uri "$BaseUrl/auth/register" -Method Post -Body $UserBody -ContentType "application/json"
    Write-Host "Registered: $($RegisterResponse.id)"
} catch {
    Write-Host "User likely already exists, proceeding to login..."
}
Write-Host "--------------------------------"

Write-Host "3. Logging in..."
$LoginResponse = Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method Post -Body $UserBody -ContentType "application/json"
$Token = $LoginResponse.access_token
Write-Host "Got Token: $Token"
$Headers = @{ Authorization = "Bearer $Token" }
Write-Host "--------------------------------"

Write-Host "4. Getting Market Assets (Binance Data)..."
$Assets = Invoke-RestMethod -Uri "$BaseUrl/market/assets" -Method Get -Headers $Headers
Write-Host "Found $($Assets.Count) assets."
Write-Host "BTC Price: $($Assets | Where-Object {$_.symbol -eq 'BTC'} | Select-Object -ExpandProperty price)"
Write-Host "--------------------------------"

Write-Host "5. Depositing Funds (10,000 USD)..."
$DepositBody = @{
    amount = 10000
    currency = "USD"
} | ConvertTo-Json
$Wallet = Invoke-RestMethod -Uri "$BaseUrl/wallet/deposit" -Method Post -Body $DepositBody -ContentType "application/json" -Headers $Headers
Write-Host "Current Balance: $($Wallet.balance) $($Wallet.currency)"
Write-Host "--------------------------------"

Write-Host "6. Placing MARKET BUY Order (0.01 BTC)..."
$OrderBody = @{
    symbol = "BTC"
    side = "BUY"
    type = "MARKET"
    amount = 0.01
} | ConvertTo-Json
$Order = Invoke-RestMethod -Uri "$BaseUrl/trade/orders" -Method Post -Body $OrderBody -ContentType "application/json" -Headers $Headers
Write-Host "Order Placed: ID $($Order.id) - Status: $($Order.status)"
Write-Host "--------------------------------"

Write-Host "7. Checking Wallet after Trade..."
$Wallets = Invoke-RestMethod -Uri "$BaseUrl/wallet" -Method Get -Headers $Headers
$Wallets | Format-Table currency, balance, locked
Write-Host "--------------------------------"

Write-Host "8. Testing Technical Analysis (RSI for BTC)..."
$RSI = Invoke-RestMethod -Uri "$BaseUrl/analysis/rsi?symbol=BTC&period=14" -Method Get -Headers $Headers
Write-Host "RSI Values Preview: $($RSI | Select-Object -First 5)"
Write-Host "--------------------------------"

Write-Host "9. Testing Backtest Engine (SMA_CROSS)..."
$BacktestBody = @{
    symbol = "BTC"
    timeframe = "1h"
    initialCapital = 1000
    strategy = "SMA_CROSS"
    limit = 100
} | ConvertTo-Json
$Backtest = Invoke-RestMethod -Uri "$BaseUrl/backtest/run" -Method Post -Body $BacktestBody -ContentType "application/json" -Headers $Headers
Write-Host "Backtest Result: Return $($Backtest.totalReturn) - Trades: $($Backtest.tradesCount)"
Write-Host "--------------------------------"

Write-Host "Tests Completed."
