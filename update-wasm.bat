@echo off
echo == 1/4 Build Un ==
dotnet build "C:\dev\un\Un.csproj" -c Release --nologo
if errorlevel 1 goto :error
echo == 2/4 Build WASM ==
dotnet build "C:\dev\un.playground\Un.Playground.Wasm\Un.Playground.Wasm.csproj" -c Release --nologo
if errorlevel 1 goto :error
echo == 3/4 Copy _framework ==
rmdir /s /q "C:\dev\un.playground\web\public\_framework" 2>nul
mkdir "C:\dev\un.playground\web\public\_framework" 2>nul
xcopy /s /y "C:\dev\un.playground\Un.Playground.Wasm\bin\Release\net8.0\wwwroot\_framework\*" "C:\dev\un.playground\web\public\_framework\" >nul
if exist "C:\dev\un.playground\web\public\_framework\_framework" rmdir /s /q "C:\dev\un.playground\web\public\_framework\_framework"
echo == 4/4 Build web ==
call npm run build --prefix "C:\dev\un.playground\web"
if errorlevel 1 goto :error
echo.
echo ✅ WASM 최신화 완료 — 414 files, 247 catalog
echo    Run: npm run dev -- --host --port 5173
goto :eof
:error
echo ❌ 실패 — 로그 확인
pause
