@echo off
title EcomVerse - Stop All Services
color 0C

echo.
echo  ============================================================
echo   EcomVerse Microservices - Stopping All Services
echo  ============================================================
echo.

echo [1/2] Stopping all Java Spring Boot services...
taskkill /F /IM java.exe /T >nul 2>&1
echo       Done. All Java processes stopped.
echo.

echo [2/2] Stopping Kafka and Zookeeper Docker containers...
docker compose stop kafka zookeeper
echo       Done.
echo.

echo  ============================================================
echo   All services stopped.
echo  ============================================================
echo.
pause
