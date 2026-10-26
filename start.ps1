Write-Host "=== Starting Startup Investment Platform ===" -ForegroundColor Cyan

# 1. Check & start PostgreSQL
Write-Host "[1/3] Ensuring PostgreSQL container is running..." -ForegroundColor Yellow
docker compose up -d postgres

# 2. Check & start Spring Boot backend
$backendActive = Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue
if (-not $backendActive) {
    Write-Host "[2/3] Launching Spring Boot backend in a background window..." -ForegroundColor Yellow
    $backendDir = Join-Path $PSScriptRoot "backend"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$backendDir'; Write-Host 'Starting Backend API on port 8080...' -ForegroundColor Cyan; mvn spring-boot:run"

    Write-Host "Waiting for backend API to become ready..." -ForegroundColor Yellow
    $retries = 35
    while ($retries -gt 0) {
        try {
            $resp = Invoke-RestMethod -Uri "http://localhost:8080/actuator/health" -TimeoutSec 1 -ErrorAction Stop
            if ($resp.status -eq "UP") {
                Write-Host "Backend is connected and healthy!" -ForegroundColor Green
                break
            }
        } catch {
            Start-Sleep -Seconds 1
            $retries--
        }
    }
} else {
    Write-Host "[2/3] Backend is already running on port 8080." -ForegroundColor Green
}

# 3. Start Frontend & Open Browser
Write-Host "[3/3] Starting Vite frontend and opening browser..." -ForegroundColor Green
npm --prefix frontend run dev -- --open
