#!/bin/bash

NAME="flash_report_supabase - "

#!/bin/bash

NAME="flash_report_supabase - "

# Verificar si hay cambios
if git diff --quiet && git diff --cached --quiet; then
    echo "❌ No hay cambios para commitear"
    exit 1
fi

git add .
git commit -m "${NAME}$(date +%Y%m%d_%H%M)"
git branch -M main
git push -u origin main

echo "✅ Push completado exitosamente"


