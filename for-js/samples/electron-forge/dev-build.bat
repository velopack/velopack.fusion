@echo off
REM This script requires several tools to be installed for it to work:
REM cargo (rust): winget install Rustlang.Rustup
REM Nerdbank.GitVersioning (nbgv): dotnet tool install --global nbgv
REM C++ Build Tools, typically installed via "Desktop development with C++" workload.

setlocal enabledelayedexpansion

if "%~1"=="" (
    echo Version number is required.
    echo Usage: build.bat [version] [extra_args...]
    exit /b 1
)

echo.
echo Building Velopack Rust
cd %~dp0..\..\..\..\velopack\src\Rust
cargo build --features windows,extendedcli

echo.
echo Building Velopack Vpk
cd %~dp0..\..\..\..\velopack
dotnet build src/Velopack.Vpk/Velopack.Vpk.csproj

cd %~dp0
rmdir /q /s out
call npm run package

echo.
echo Building Velopack Release v%~1
%~dp0..\..\..\..\velopack\build\Debug\net8.0\vpk pack -u VeloElectronForge -o ..\releases -p out\my-app-win32-x64 -e my-app.exe -v %*