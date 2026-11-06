@echo off
echo ===================================================
echo Starting Stashh Platform
echo ===================================================

echo [1/3] Starting PostgreSQL container in Docker...
docker compose up -d postgres
echo PostgreSQL is running in Docker:
docker ps --filter "name=startup-investment-postgres" --format "Container: {{.Names}} | Status: {{.Status}} | Port: {{.Ports}}"

echo.
echo [2/3] Launching Spring Boot backend in a new window...
start "Stashh Backend" cmd /k "cd /d "%~dp0backend" && mvn spring-boot:run"

echo.
echo [3/3] Starting Vite frontend and opening browser...
cd /d "%~dp0"
npm --prefix frontend run dev -- --open
