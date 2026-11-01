@echo off
chcp 65001 >nul
title AI Notes - Step 1 : First LLM API Call
cd /d "%~dp0"

REM ---- locate node.exe (PATH may be stale inside a running explorer) ----
set "NODE_EXE="
where node >nul 2>nul && set "NODE_EXE=node"
if not defined NODE_EXE if exist "%USERPROFILE%\bin\node\node.exe" set "NODE_EXE=%USERPROFILE%\bin\node\node.exe"
if not defined NODE_EXE for /f "delims=" %%i in ('dir /b /o-n "%USERPROFILE%\.workbuddy\binaries\node\versions" 2^>nul') do if not defined NODE_EXE if exist "%USERPROFILE%\.workbuddy\binaries\node\versions\%%i\node.exe" set "NODE_EXE=%USERPROFILE%\.workbuddy\binaries\node\versions\%%i\node.exe"

if not defined NODE_EXE (
  echo.
  echo   ERROR: node.exe not found on this machine.
  echo   Tell Jerry and he will fix it in one command.
  ping -n 4 127.0.0.1 >nul
  exit /b 1
)

echo ============================================================
echo   AI Notes  -  Step 1 : First LLM API Call
echo ============================================================
echo   node: %NODE_EXE%
echo.
echo   Paste your DeepSeek API Key (starts with sk-)
echo   It lives in this process only, never written to disk.
echo.
set /p "DSK=   API Key : "
if "%DSK%"=="" (
  echo.
  echo   No key entered. Bye.
  ping -n 3 127.0.0.1 >nul
  exit /b 1
)

set DEEPSEEK_API_KEY=%DSK%

echo.
echo   Running step1-first-call.js, please wait ...
echo.

REM Save full output (including errors) into output.log
"%NODE_EXE%" step1-first-call.js > output.log 2>&1

echo.
echo ------------------------------------------------------------
echo   FULL OUTPUT:
echo ------------------------------------------------------------
type output.log
echo.
echo ------------------------------------------------------------
echo   Saved to output.log  -  close this window.
pause >nul
