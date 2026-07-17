@echo off
title EcomVerse - Start All Services
color 0A

echo.
echo  ============================================================
echo   EcomVerse Microservices - Starting All Services
echo  ============================================================
echo.

REM ── Step 1: Start Docker services (Zookeeper + Kafka only, MySQL is local) ──
echo [1/5] Starting Kafka and Zookeeper via Docker...
docker compose up zookeeper kafka -d
if %errorlevel% neq 0 (
    echo ERROR: Docker failed. Make sure Docker Desktop is running.
    pause
    exit /b 1
)
echo       Waiting 15 seconds for Kafka to be ready...
timeout /t 15 /nobreak >nul
echo       Kafka is ready.
echo.

REM ── Step 2: Start Auth Service (port 8081) ──
echo [2/5] Starting Auth Service on port 8081...
start "Auth Service :8081" cmd /k "cd /d "%~dp0auth-user-service" && mvn spring-boot:run"
timeout /t 5 /nobreak >nul
echo.

REM ── Step 3: Start Product-Order Service (port 8082) ──
echo [3/5] Starting Product-Order Service on port 8082...
start "Product-Order Service :8082" cmd /k "cd /d "%~dp0product-order-service" && mvn spring-boot:run"
timeout /t 5 /nobreak >nul
echo.

REM ── Step 4: Start Payment-Wallet Service (port 8083) ──
echo [4/5] Starting Payment-Wallet Service on port 8083...
start "Payment-Wallet Service :8083" cmd /k "cd /d "%~dp0payment-wallet-service" && mvn spring-boot:run"
timeout /t 5 /nobreak >nul
echo.

REM ── Step 5: Start API Gateway (port 8080) ──
echo [5/5] Starting API Gateway on port 8080...
start "API Gateway :8080" cmd /k "cd /d "%~dp0api-gateway" && mvn spring-boot:run"
echo.

echo  ============================================================
echo   All services are starting up in separate windows.
echo.
echo   Service         Port    Window Title
echo   -----------     ----    -------------------------
echo   API Gateway     8080    "API Gateway :8080"
echo   Auth Service    8081    "Auth Service :8081"
echo   Product-Order   8082    "Product-Order Service :8082"
echo   Payment-Wallet  8083    "Payment-Wallet Service :8083"
echo   Kafka           9092    (Docker - runs in background)
echo   Zookeeper       2181    (Docker - runs in background)
echo.
echo   Wait ~60 seconds for all services to fully start.
echo   Check each window for "Started ... in X seconds" message.
echo  ============================================================
echo.
pause
