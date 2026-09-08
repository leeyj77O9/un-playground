# update-wasm.ps1 — Un 최신 소스로 WASM 갱신
# 실행: powershell -ExecutionPolicy Bypass -File update-wasm.ps1

$ErrorActionPreference = "Stop"

$UnProj = "C:\dev\un\Un.csproj"
$WasmProj = "C:\dev\un.playground\Un.Playground.Wasm\Un.Playground.Wasm.csproj"
$WasmOut = "C:\dev\un.playground\Un.Playground.Wasm\bin\Release\net8.0\wwwroot\_framework"
$WebPublic = "C:\dev\un.playground\web\public\_framework"
$WebDir = "C:\dev\un.playground\web"

Write-Host "== 1/4 Build Un ==" -ForegroundColor Cyan
dotnet build $UnProj -c Release --nologo
if ($LASTEXITCODE -ne 0) { throw "Un build failed" }

Write-Host "== 2/4 Build WASM ==" -ForegroundColor Cyan
dotnet build $WasmProj -c Release --nologo
if ($LASTEXITCODE -ne 0) { throw "WASM build failed" }

Write-Host "== 3/4 Copy _framework ==" -ForegroundColor Cyan
if (Test-Path $WebPublic) { Remove-Item $WebPublic -Recurse -Force }
New-Item -ItemType Directory -Path $WebPublic -Force | Out-Null
Copy-Item "$WasmOut\*" $WebPublic -Recurse -Force
# 중첩 _framework 제거 (Robocopy로 인한 중복 방지)
Remove-Item "$WebPublic\_framework" -Recurse -Force -ErrorAction SilentlyContinue
$cnt = (Get-ChildItem $WebPublic | Measure-Object).Count
Write-Host "Copied $cnt files to $WebPublic" -ForegroundColor Green

Write-Host "== 4/4 Build web ==" -ForegroundColor Cyan
npm run build --prefix $WebDir
if ($LASTEXITCODE -ne 0) { throw "web build failed" }

Write-Host "`n✅ WASM 최신화 완료 — 414 files, 247 catalog" -ForegroundColor Green
Write-Host "   Run: npm run dev -- --host --port 5173  (in $WebDir)" -ForegroundColor Yellow
