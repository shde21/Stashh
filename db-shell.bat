@echo off
echo Connecting to PostgreSQL shell (startup_investment)...
echo Type \dt to view tables, or \q to exit.
docker exec -it startup-investment-postgres psql -U startup_app -d startup_investment
pause
