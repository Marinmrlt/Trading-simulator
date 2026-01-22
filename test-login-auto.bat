@echo off
curl.exe -v -X POST http://localhost:3000/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"trader1@test.com\", \"password\":\"password123\"}"
