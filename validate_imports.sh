#!/bin/bash

echo "🔍 Verificando importaciones relativas en React..."

# Ruta base del código fuente de React
SRC_DIR="./frontend/src"

# Buscar todas las importaciones relativas en .js y .jsx
grep -rhoP "import.*from\s+['\"](\.\.?\/[^\"]+)['\"]" $SRC_DIR | \
while read -r line; do
  # Extraer la ruta de importación
  IMPORT_PATH=$(echo $line | sed -E "s/.*from ['\"](.*)['\"].*/\1/")

  # Resolver ruta completa al archivo
  FULL_PATH="$SRC_DIR/$IMPORT_PATH"

  # Comprobar si existe como archivo .js, .jsx o como carpeta con index.js
  if [[ ! -f "$FULL_PATH.js" && ! -f "$FULL_PATH.jsx" && ! -f "$FULL_PATH/index.js" && ! -f "$FULL_PATH/index.jsx" ]]; then
    echo "❌ Importación rota: $IMPORT_PATH (→ $FULL_PATH.[js|jsx])"
  fi
done

echo "✅ Validación completada."
