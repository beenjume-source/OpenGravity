@echo off
echo Iniciando OpenGravity...
echo.

cd /d "%~dp0"
call npm run dev

echo.
echo OpenGravity se ha detenido. Presiona cualquier tecla para cerrar esta ventana.
pause > nul
