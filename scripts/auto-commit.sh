#!/usr/bin/env bash
# Autocommit de repo: pide solo el mensaje del commit, hace add/commit y push (si hay upstream)
set -euo pipefail

if ! command -v git >/dev/null 2>&1; then
  echo "Git no está instalado o no está en PATH." >&2
  exit 1
fi

if ! ROOT=$(git rev-parse --show-toplevel 2>/dev/null); then
  echo "No parece que estés dentro de un repositorio Git." >&2
  exit 1
fi
cd "$ROOT"
echo "Repo: $ROOT"

if [ -z "$(git status --porcelain)" ]; then
  echo "No hay cambios por commitear."
  exit 0
fi

MESSAGE="${1-}"
if [ -z "$MESSAGE" ]; then
  read -r -p "Mensaje del commit: " MESSAGE
fi
if [[ -z "${MESSAGE// /}" ]]; then
  echo "El mensaje del commit no puede estar vacío." >&2
  exit 1
fi

echo "Agregando cambios..."
git add -A

echo "Creando commit..."
if git commit -m "$MESSAGE"; then
  if git rev-parse --abbrev-ref --symbolic-full-name '@{u}' >/dev/null 2>&1; then
    echo "Haciendo push..."
    if git push; then
      echo "Push realizado."
    else
      echo "Commit local creado, pero no se pudo hacer push automáticamente." >&2
    fi
  else
    echo "No hay upstream configurado. Commit creado localmente."
  fi
else
  echo "No se pudo crear el commit (posiblemente no hubo cambios staged)." >&2
  exit 1
fi

exit 0
