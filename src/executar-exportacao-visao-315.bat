@echo off
setlocal

set "HANDIT_EMAIL="
set "HANDIT_PASSWORD="

echo Executando exportacao com contexto para as visoes 304 e 315...
node "%~dp0exportar-visao-315-contexto.js"

endlocal
