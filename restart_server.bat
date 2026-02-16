@echo off
taskkill /IM php.exe /F
echo Stopped existing PHP processes.
timeout /t 1
echo Starting new PHP server...
run_php.bat
