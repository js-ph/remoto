# Autocommit de repo: pide solo el mensaje del commit, hace add/commit y push (si hay upstream)
param(
    [string]$Message
)

function Write-Info($m) { Write-Host $m -ForegroundColor Cyan }
function Write-Success($m) { Write-Host $m -ForegroundColor Green }
function Write-Warn($m) { Write-Host $m -ForegroundColor Yellow }
function Write-Err($m) { Write-Host $m -ForegroundColor Red }

# 1) Validar git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Err "Git no está instalado o no está en PATH."
    exit 1
}

# 2) Ir al root del repo
$root = git rev-parse --show-toplevel 2>$null
if (-not $root) {
    Write-Err "No parece que estés dentro de un repositorio Git."
    exit 1
}
Set-Location $root
Write-Info "Repo: $root"

# 3) Verificar si hay cambios
$status = git status --porcelain
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Warn "No hay cambios por commitear."
    exit 0
}

# 4) Pedir solo el mensaje del commit (si no se pasa por parámetro)
if (-not $Message) {
    $Message = Read-Host "Mensaje del commit"
}
if ([string]::IsNullOrWhiteSpace($Message)) {
    Write-Err "El mensaje del commit no puede estar vacío."
    exit 1
}

# 5) add + commit
Write-Info "Agregando cambios..."
git add -A | Out-Null

Write-Info "Creando commit..."
git commit -m "$Message"
if ($LASTEXITCODE -ne 0) {
    Write-Warn "No se pudo crear el commit (posiblemente no hubo cambios staged)."
    exit $LASTEXITCODE
}
Write-Success "Commit creado."

# 6) Intentar push si hay upstream configurado
$branch = (git rev-parse --abbrev-ref HEAD).Trim()
$null = git rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Info "Haciendo push a la rama '$branch'..."
    git push
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Push realizado."
    } else {
        Write-Warn "Commit local creado, pero no se pudo hacer push automáticamente."
    }
} else {
    Write-Warn "No hay upstream configurado para '$branch'. Commit creado localmente."
}

exit 0
