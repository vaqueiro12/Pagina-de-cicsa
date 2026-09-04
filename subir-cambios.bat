@echo off
chcp 65001 >nul
title Subir cambios a GitHub - CICSA
cd /d "%~dp0"

echo ============================================
echo   SUBIR CAMBIOS A GITHUB - Pagina CICSA
echo ============================================
echo.

git status --short
echo.

set /p mensaje="Escribe una breve descripcion de lo que cambiaste: "

if "%mensaje%"=="" (
    echo.
    echo No escribiste ninguna descripcion. Cancelando...
    pause
    exit /b
)

echo.
echo Preparando archivos...
git add .

echo Guardando version...
git commit -m "%mensaje%"

echo Subiendo a GitHub...
git push

echo.
echo ============================================
echo   LISTO. Revisa arriba si hubo algun error.
echo ============================================
pause
