<#
  Script: scripts/test-integration.ps1
  Purpose: Automatiza pruebas de integración (Jest) en Windows PowerShell.
  - Instala dependencias (backend y raíz) si es necesario.
  - (Opcional) Levanta MariaDB con Docker Compose (compose-test).
  - Exporta URL_DATABASE y TEST_PORT.
  - Ejecuta npm run test:integration.

  Uso básico:
    powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\test-integration.ps1

  Con Docker:
    powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\test-integration.ps1 -WithDocker

  Parámetros útiles:
    -WithDocker      [switch]  Levanta MariaDB usando compose-test.
    -DatabaseUrl     [string]  DSN manual. Si no se indica, se infiere según -WithDocker.
    -TestPort        [int]     Puerto del backend de pruebas (default 5050).
    -ComposeFile     [string]  Ruta del compose (default .\compose-test\docker-compose.yml).
    -BackendDir      [string]  Ruta del backend (default .\backend).
    -RootDir         [string]  Raíz del repo (default .).
#>

param(
  [switch]$WithDocker = $false,
  [string]$DatabaseUrl,
  [int]$TestPort = 5050,
  [string]$ComposeFile = ".\compose-test\docker-compose.yml",
  [string]$BackendDir = ".\backend",
  [string]$RootDir = "."
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Write-Step($msg) { Write-Host "[STEP] $msg" -ForegroundColor Cyan }
function Write-Info($msg) { Write-Host "[INFO] $msg" -ForegroundColor Gray }
function Fail($msg, $code=1) { Write-Host "[ERROR] $msg" -ForegroundColor Red; exit $code }

Write-Step "Verificando Node y npm"
try {
  $null = node -v
  $null = npm -v
} catch {
  Fail "Node.js y npm no están disponibles en PATH. Instala Node 18+ e inténtalo de nuevo."
}

if ($WithDocker) {
  Write-Step "Verificando Docker Compose"
  try { $null = docker compose version } catch { Fail "Docker Desktop/Compose no disponible." }

  if (-not (Test-Path $ComposeFile)) { Fail "No se encontró el archivo de compose: $ComposeFile" }

  Write-Step "Levantando MariaDB con Docker ($ComposeFile)"
  docker compose -f $ComposeFile up -d db | Out-Null

  # Espera a que el puerto 3306 esté disponible
  Write-Info "Esperando a que MariaDB acepte conexiones en 127.0.0.1:3306 (timeout ~60s)"
  $deadline = [DateTime]::UtcNow.AddSeconds(60)
  $ready = $false
  while ([DateTime]::UtcNow -lt $deadline) {
    try {
      $tcp = Test-NetConnection -ComputerName 127.0.0.1 -Port 3306 -WarningAction SilentlyContinue
      if ($tcp.TcpTestSucceeded) { $ready = $true; break }
    } catch { }
    Start-Sleep -Seconds 2
  }
  if (-not $ready) { Fail "MariaDB no respondió a tiempo en 127.0.0.1:3306" }
}

# Determinar URL de base de datos por defecto
if ([string]::IsNullOrWhiteSpace($DatabaseUrl)) {
  if ($WithDocker) {
    $DatabaseUrl = "mariadb://root:root123@127.0.0.1:3306/testdb"
  } else {
    $DatabaseUrl = "mariadb://root:root@127.0.0.1:3306/testdb"
  }
}

Write-Step "Instalando dependencias del backend si es necesario ($BackendDir)"
Push-Location $BackendDir
try {
  if (-not (Test-Path "node_modules")) { npm install | Out-Null } else { Write-Info "node_modules ya existe en backend" }
} finally { Pop-Location }

Write-Step "Instalando dev deps en la raíz si es necesario ($RootDir)"
Push-Location $RootDir
try {
  if (-not (Test-Path "node_modules")) { npm install | Out-Null } else { Write-Info "node_modules ya existe en raíz" }
} finally { Pop-Location }

Write-Step "Exportando variables de entorno y ejecutando pruebas"
$env:URL_DATABASE = $DatabaseUrl
$env:TEST_PORT = "$TestPort"

Write-Info "URL_DATABASE = $env:URL_DATABASE"
Write-Info "TEST_PORT    = $env:TEST_PORT"

Push-Location $RootDir
try {
  npm run test:integration
  $exitCode = $LASTEXITCODE
} finally { Pop-Location }

if ($exitCode -ne 0) { Fail "Pruebas fallaron con código $exitCode" $exitCode }

Write-Host "Pruebas de integración OK" -ForegroundColor Green
exit 0
