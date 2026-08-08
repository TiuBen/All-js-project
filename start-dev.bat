@echo off
rem ============================================
rem 航班调度检查系统 - 一键启动脚本
rem 1) 预置数据（航班 + 已填好的检查单 -> PostgreSQL）
rem 2) 启动后端 (5183)
rem 3) 启动前端 (5173)
rem 使用完直接关闭窗口即可（Ctrl+C 停止）
rem ============================================
cd /d "%~dp0"

echo [1/3] 预置数据（航班 + 已填好的检查单 -^> PostgreSQL）...
cd packages\backend\full-web-backend\V5-dispatch
call node scripts\init_seed.js
echo.

echo [2/3] 启动后端 http://localhost:5183 ...
start "V5-Dispatch-Backend" cmd /k "cd /d %~dp0packages\backend\full-web-backend\V5-dispatch && node src\server.js"
echo.

echo [3/3] 启动前端 http://localhost:5173 ...
start "Flight-Dispatch-Frontend" cmd /k "cd /d %~dp0packages\frontend\flight-dispatch-system && node .\node_modules\vite\bin\vite.js --port 5173"

timeout /t 3 >nul
start http://localhost:5173
echo.
echo 已在默认浏览器打开 http://localhost:5173
echo 两个服务窗口请保持打开；停止时直接关闭窗口即可。
pause
