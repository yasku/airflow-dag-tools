#!/bin/bash

echo "🔍 Corrigiendo rutas absolutas en archivos React..."

FRONTEND_DIR="./frontend/src"

# Reemplazar URLs absolutas por vacío (sin espacios)
find $FRONTEND_DIR -type f \( -name "*.js" -o -name "*.jsx" \) -exec sed -i \
  -e 's|http://127.0.0.1:8000||g' \
  -e 's|http://localhost:8000||g' \
  -e 's|` ||g' \
  -e 's|" ||g' \
  {} +

echo "✅ Reemplazo completado. URLs relativas aplicadas sin espacios extra."
