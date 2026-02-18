#!/bin/bash

# ============================================================================
# Flash Report - Build APK
# ============================================================================
# Script para construir APK de Flash Report usando Expo EAS Build.
# Usa este script después del PRIMER BUILD (keystore ya generado).
# ============================================================================

set -e  # Salir al primer error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  FLASH REPORT - BUILD APK                              ${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo -e "${RED}✗ Error: No se encuentra package.json${NC}"
    echo "Ejecuta este script desde el directorio raíz del proyecto"
    exit 1
fi

# Mostrar información del proyecto
PROJECT_NAME=$(grep '"name"' package.json | head -1 | awk -F: '{ print $2 }' | sed 's/[", ]//g')
PROJECT_VERSION=$(grep '"version"' package.json | head -1 | awk -F: '{ print $2 }' | sed 's/[", ]//g')

echo -e "${GREEN}✓ Proyecto: $PROJECT_NAME v$PROJECT_VERSION${NC}"

# Opciones de build
echo ""
echo -e "${YELLOW}Selecciona el tipo de build:${NC}"
echo "1) Preview APK (para pruebas internas)"
echo "2) Production APK (para distribución)"
echo "3) Ver builds anteriores"
echo "4) Salir"
echo ""

read -p "Opción [1]: " choice
choice=${choice:-1}

case $choice in
    1)
        PROFILE="preview"
        echo -e "${GREEN}✓ Build seleccionado: Preview APK${NC}"
        ;;
    2)
        PROFILE="production"
        echo -e "${GREEN}✓ Build seleccionado: Production APK${NC}"
        ;;
    3)
        echo ""
        echo -e "${YELLOW}Listando builds anteriores...${NC}"
        npx eas build:list --platform android --limit 5
        echo ""
        echo "Para ver más detalles: npx eas build:list --platform android"
        exit 0
        ;;
    4|*)
        echo -e "${YELLOW}✗ Cancelado${NC}"
        exit 0
        ;;
esac

# Verificar eas-cli
echo ""
echo -e "${YELLOW}Verificando eas-cli...${NC}"
if ! command -v eas &> /dev/null; then
    echo -e "${RED}✗ eas-cli no encontrado${NC}"
    echo "Usando npx eas..."
    EAS_CMD="npx eas"
else
    EAS_CMD="eas"
    echo -e "${GREEN}✓ eas-cli encontrado${NC}"
fi

# Verificar sesión
echo ""
echo -e "${YELLOW}Verificando sesión Expo...${NC}"
if ! $EAS_CMD whoami &> /dev/null; then
    echo -e "${RED}✗ No hay sesión activa${NC}"
    echo "Ejecuta: eas login"
    exit 1
else
    USER=$($EAS_CMD whoami)
    echo -e "${GREEN}✓ Sesión activa como: $USER${NC}"
fi

# Confirmar build
echo ""
echo -e "${YELLOW}Resumen del build:${NC}"
echo "• Proyecto: $PROJECT_NAME v$PROJECT_VERSION"
echo "• Perfil: $PROFILE"
echo "• Plataforma: Android (APK)"
echo "• Tiempo estimado: 5-15 minutos"
echo "• Costo: Gratis (Expo EAS Free Tier)"
echo ""

read -p "¿Continuar con el build? (s/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo -e "${YELLOW}✗ Build cancelado${NC}"
    exit 0
fi

# Ejecutar build
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  INICIANDO BUILD...                                    ${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ "$PROFILE" = "preview" ]; then
    echo -e "${GREEN}✓ Ejecutando: npm run build:android-preview${NC}"
    npm run build:android-preview
else
    echo -e "${GREEN}✓ Ejecutando: npm run build:android${NC}"
    npm run build:android
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  ¡BUILD COMPLETADO!                                   ${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Para descargar el APK:"
echo "1. Ve a: https://expo.dev/accounts/creyco/projects/flash_report/builds"
echo "2. Busca el build más reciente"
echo "3. Haz clic en 'Download'"
echo ""
echo "Comandos útiles:"
echo "• Ver builds: npx eas build:list --platform android"
echo "• Descargar: npx eas build:download --id [BUILD_ID] --path ./app.apk"
echo "• Instalar: adb install ./app.apk"
echo ""
echo -e "${GREEN}✓ Script completado${NC}"