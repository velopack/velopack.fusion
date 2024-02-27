@echo off
REM This script requires several tools to be installed for it to work:
REM cargo (rust): winget install Rustlang.Rustup

setlocal enabledelayedexpansion

if "%~1"=="" (
    echo Version number is required.
    echo Usage: build.bat [version] [extra_args...]
    exit /b 1
)

echo.
echo Building vfusion
cd %~dp0..\..\..\for-rust
cargo build --features cli
copy target\debug\vfusion.exe %~dp0..\..\bin\Vfusion.exe

cd %~dp0
rmdir /q /s out
call npm run package

echo.
echo Building Velopack Release v%~1
vpk pack -u VeloElectronForge -o ..\releases -p out\my-app-win32-x64 -e my-app.exe -v %*