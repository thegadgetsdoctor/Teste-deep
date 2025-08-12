
@echo off
REM (Opcional) Inicia o MongoDB local, se necessário
REM start "MongoDB" cmd /k "mongod --dbpath %~dp0data"


REM Inicia o backend
start "Backend" cmd /k "cd /d %~dp0backend && npm install && node server.js"

REM Aguarda o backend subir (tenta conexão na porta 5000)
set RETRIES=10
:wait_backend
timeout /t 2 >nul
powershell -Command "try { $c = New-Object Net.Sockets.TcpClient('localhost',5000); if ($c.Connected) { $c.Close(); exit 0 } else { exit 1 } } catch { exit 1 }"
if %ERRORLEVEL% neq 0 (
	set /a RETRIES-=1
	if %RETRIES% gtr 0 goto wait_backend
	echo ERRO: Backend não iniciou corretamente na porta 5000. Verifique a janela do backend.
	pause
	exit /b 1
)

REM Inicia o frontend
start "Frontend" cmd /k "cd /d %~dp0frontend && npm install && npm start"

