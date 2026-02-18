#!/bin/bash

# ============================================================================
# Flash Report - Primer Build APK
# ============================================================================
# Este script maneja el PRIMER BUILD de la aplicación Android APK.
# Genera el keystore de Android (solo primera vez) y construye el APK.
# ============================================================================

set -e  # Salir al primer error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  FLASH REPORT - PRIMER BUILD APK                        ${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Verificar eas-cli
if ! command -v eas &> /dev/null; then
    echo -e "${RED}✗ Error: eas-cli no está instalado${NC}"
    echo "Instálalo con: npm install -g eas-cli@latest"
    echo "O usa la versión local: npx eas ..."
    exit 1
fi

# Verificar sesión Expo
echo -e "${YELLOW}⚠ Verificando sesión en Expo...${NC}"
if ! eas whoami &> /dev/null; then
    echo -e "${YELLOW}⚠ No hay sesión activa. Iniciando login...${NC}"
    eas login
else
    USER=$(eas whoami)
    echo -e "${GREEN}✓ Sesión activa como: $USER${NC}"
fi

# Verificar proyecto configurado
echo ""
echo -e "${YELLOW}⚠ Verificando configuración del proyecto...${NC}"
if ! eas project:info &> /dev/null; then
    echo -e "${RED}✗ Proyecto no configurado en EAS${NC}"
    echo "Configurando automáticamente..."
    eas init --id 40ad4b20-a4d2-47e7-98bd-82c8f7c7394e
else
    echo -e "${GREEN}✓ Proyecto ya configurado en EAS${NC}"
fi

# Verificar archivos de configuración
echo ""
echo -e "${YELLOW}⚠ Verificando archivos de configuración...${NC}"
if [ ! -f "eas.json" ]; then
    echo -e "${RED}✗ Error: eas.json no encontrado${NC}"
    exit 1
fi

if [ ! -f "app.json" ]; then
    echo -e "${RED}✗ Error: app.json no encontrado${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Configuración verificada${NC}"

# ============================================================================
# PASO CRÍTICO: Generar keystore
# ============================================================================
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  PASO CRÍTICO: Generar Android Keystore                  ${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}⚠ ATENCIÓN: Esto es SOLO para el PRIMER BUILD${NC}"
echo ""
echo "El keystore es un archivo de firma digital que:"
echo "1. Identifica tu aplicación de forma única"
echo "2. Es NECESARIO para publicar actualizaciones"
echo "3. DEBES guardar una copia de seguridad"
echo ""
echo -e "${RED}IMPORTANTE: Si pierdes el keystore, NO podrás publicar${NC}"
echo -e "${RED}actualizaciones de la misma aplicación en Google Play${NC}"
echo ""

read -p "¿Continuar con la generación del keystore? (s/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo -e "${YELLOW}⚠ Cancelado por el usuario${NC}"
    echo "Puedes generar el keystore manualmente en:"
    echo "https://expo.dev/accounts/creyco/projects/flash_report/builds/android"
    exit 0
fi

echo ""
echo -e "${YELLOW}⚠ Generando keystore...${NC}"
echo -e "${YELLOW}⚠ Esto abrirá tu navegador para autorización${NC}"
echo -e "${YELLOW}⚠ Sigue las instrucciones en pantalla${NC}"
echo ""

# Intentar generar keystore automáticamente
echo -e "${GREEN}✓ Ejecutando: eas build:configure --platform android${NC}"
eas build:configure --platform android

# ============================================================================
# Construir APK
# ============================================================================
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Construyendo APK...                                    ${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}⚠ Este proceso puede tomar 15-25 minutos${NC}"
echo -e "${YELLOW}⚠ Se construirá en la nube de Expo${NC}"
echo ""

read -p "¿Iniciar build ahora? (s/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo -e "${YELLOW}⚠ Build cancelado${NC}"
    echo "Puedes ejecutarlo manualmente con:"
    echo "npm run build:android-preview"
    exit 0
fi

echo ""
echo -e "${GREEN}✓ Iniciando build...${NC}"
echo "Perfil: preview (APK interno)"
echo "Plataforma: Android"
echo ""
echo -e "${YELLOW}⚠ URL para seguir el progreso:${NC}"
echo "https://expo.dev/accounts/creyco/projects/flash_report/builds"

# Ejecutar build
npm run build:android-preview

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  ¡BUILD INICIADO!                                     ${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Sigue el progreso en:"
echo "https://expo.dev/accounts/creyco/projects/flash_report/builds"
echo ""
echo "Para descargar el APK cuando termine:"
echo "1. Ve a la URL anterior"
echo "2. Busca el build más reciente"
echo "3. Haz clic en 'Download'"
echo ""
echo "O usa el comando:"
echo "npx eas build:list --platform android"
echo "npx eas build:download --id [BUILD_ID] --path ./flash_report.apk"
echo ""
echo -e "${GREEN}✓ Script completado${NC}"