@echo off
title Backend Game Store
cd /d "C:\Users\kawii\OneDrive\Escritorio\Hola_React\Game_Store\backend"

echo 🚀 Iniciando Backend Game Store...
echo 📁 Directorio: %CD%
echo.

REM Verificar que el archivo index.js existe
if not exist "src\index.js" (
    echo ❌ Error: No se encuentra el archivo src\index.js
    pause
    exit /b 1
)

echo ✅ Archivo encontrado: src\index.js
echo 🔄 Ejecutando servidor...
echo.

node src\index.js
echo.
echo 🔚 El servidor se ha detenido
pause