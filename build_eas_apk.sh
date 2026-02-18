#!/bin/bash

# ============================================================================
# EAS Build Script - flash_report APK Build & Download
# ============================================================================
# Este script realiza lo siguiente:
# 1. Verifica la instalación de eas-cli
# 2. Inicia sesión en Expo (si es necesario)
# 3. Configura las credenciales automáticamente
# 4. Envía el proyecto a EAS Build
# 5. Obtiene y descarga el APK compilado
# ============================================================================

set -e  # Salir al primer error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir títulos
print_title() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Función para imprimir pasos
print_step() {
    echo -e "${GREEN}✓${NC} $1"
}

# Función para imprimir advertencias
print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Función para imprimir errores
print_error() {
    echo -e "${RED}✗${NC} $1"
}

# ============================================================================
# PASO 1: Verificar prerrequisitos
# ============================================================================
print_title "PASO 1: Verificar Prerrequisitos"

# Verificar que estamos en un proyecto Expo válido
if [ ! -f "app.json" ] && [ ! -f "app.config.js" ] && [ ! -f "app.config.ts" ]; then
    print_error "No se encontró archivo de configuración de Expo (app.json, app.config.js o app.config.ts)"
    print_warning "Asegúrate de ejecutar este script desde el directorio raíz de un proyecto Expo"
    exit 1
fi
print_step "Proyecto Expo válido detectado"

# Verificar eas-cli
if ! command -v eas &> /dev/null; then
    print_error "eas-cli no está instalado"
    print_warning "Instálalo con: npm install -g eas-cli@latest"
    exit 1
fi
EAS_VERSION=$(eas --version)
print_step "eas-cli encontrado: $EAS_VERSION"

# Verificar jq para procesamiento JSON
if ! command -v jq &> /dev/null; then
    print_error "jq no está instalado (necesario para procesar JSON)"
    print_warning "Instálalo con: sudo apt-get install jq  # Ubuntu/Debian"
    print_warning "            o: brew install jq           # macOS"
    exit 1
fi
JQ_VERSION=$(jq --version)
print_step "jq encontrado: $JQ_VERSION"

# ============================================================================
# PASO 2: Verificar sesión en Expo
# ============================================================================
print_title "PASO 2: Verificar Sesión de Expo"

if ! eas whoami &> /dev/null; then
    print_warning "No hay sesión activa en Expo. Iniciando login..."
    eas login
else
    CURRENT_USER=$(eas whoami)
    print_step "Sesión activa como: $CURRENT_USER"
fi

# ============================================================================
# PASO 3: Configurar proyecto EAS automáticamente
# ============================================================================
print_title "PASO 3: Configurar Proyecto EAS"

# Crear eas.json básico si no existe
if [ ! -f "eas.json" ]; then
    print_warning "eas.json no encontrado, creando configuración básica..."
    cat > eas.json << 'EOF'
{
  "cli": {
    "version": ">= 16.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "android": {
        "buildType": "apk"
      },
      "distribution": "internal"
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
EOF
    print_step "eas.json creado con configuración básica"
else
    print_step "eas.json encontrado"
fi

# Inicializar proyecto EAS si no está configurado
if ! eas project:info &> /dev/null; then
    print_warning "Proyecto EAS no configurado, inicializando..."
    eas init --id=flash_report --non-interactive --force || {
        print_warning "Inicialización automática falló, continuando con configuración manual..."
    }
else
    print_step "Proyecto EAS ya configurado"
fi

print_warning "Configurando credenciales de Android (esto puede abrir el navegador si es necesario)..."

# Ejecutar eas build:configure para Android automáticamente
eas build:configure --platform android --non-interactive 2>/dev/null || {
    print_warning "La configuración automática puede requerir interacción manual"
    print_step "Si se abre el navegador, sigue las instrucciones para completar la configuración"
    eas build:configure --platform android
}

# ============================================================================
# PASO 4: Enviar proyecto a EAS Build
# ============================================================================
print_title "PASO 4: Enviar Proyecto a EAS Build"

print_step "Iniciando build en la nube (perfil: preview, buildType: apk)..."
print_warning "Este proceso puede tomar varios minutos (típicamente 5-15 minutos)"

print_step "Enviando build a EAS Cloud..."
BUILD_OUTPUT=$(eas build --platform android --profile preview --non-interactive --json 2>&1)
BUILD_EXIT_CODE=$?

# Intentar extraer BUILD_ID del JSON de salida
BUILD_ID=$(echo "$BUILD_OUTPUT" | jq -r '.id // empty' 2>/dev/null || echo "")

# Si no se pudo extraer el ID, verificar si hay mensaje de error en el JSON
if [ -z "$BUILD_ID" ]; then
    ERROR_MESSAGE=$(echo "$BUILD_OUTPUT" | jq -r '.message // .error // empty' 2>/dev/null || echo "")
    
    if [ -n "$ERROR_MESSAGE" ]; then
        print_error "Error al enviar build a EAS: $ERROR_MESSAGE"
    else
        print_error "No se pudo obtener el BUILD_ID. El comando eas build puede haber fallado."
        print_error "Código de salida: $BUILD_EXIT_CODE"
        print_error "Output completo:"
        echo "$BUILD_OUTPUT"
    fi
    
    # Sugerencias para solucionar problemas comunes
    print_warning "Posibles soluciones:"
    print_warning "1. Verifica tu conexión a internet"
    print_warning "2. Ejecuta 'eas whoami' para verificar tu sesión en Expo"
    print_warning "3. Verifica que tu proyecto esté configurado correctamente con 'eas project:info'"
    print_warning "4. Intenta ejecutar manualmente: eas build --platform android --profile preview"
    
    exit 1
fi

print_step "✓ Build enviado con éxito a EAS Cloud"
print_step "Build ID: $BUILD_ID"
print_step "URL de seguimiento: https://expo.dev/builds/$BUILD_ID"

# ============================================================================
# PASO 5: Monitorear el build
# ============================================================================
print_title "PASO 5: Monitorear Compilación"

print_step "Esperando que se complete el build..."
print_warning "Puedes ver el progreso en: https://expo.dev/builds/$BUILD_ID"

# Esperar a que se complete con polling
MAX_ATTEMPTS=180  # 30 minutos con 10 segundos entre intentos
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    BUILD_STATUS=$(eas build:view --id "$BUILD_ID" --json 2>&1 | jq -r '.status // empty' 2>/dev/null || echo "")
    
    if [ "$BUILD_STATUS" = "FINISHED" ] || [ "$BUILD_STATUS" = "finished" ]; then
        print_step "¡Build completado exitosamente!"
        break
    elif [ "$BUILD_STATUS" = "FAILED" ] || [ "$BUILD_STATUS" = "failed" ]; then
        print_error "El build falló. Detalles:"
        eas build:view --id "$BUILD_ID" --json
        exit 1
    fi
    
    ATTEMPT=$((ATTEMPT + 1))
    PROGRESS=$((ATTEMPT * 100 / MAX_ATTEMPTS))
    echo -ne "Estado: ${BUILD_STATUS:-PENDING} | Progreso: ${PROGRESS}% (Intento $ATTEMPT/$MAX_ATTEMPTS)\r"
    
    sleep 10
done

# Verificar si se agotó el tiempo de espera
if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
    print_error "Se agotó el tiempo de espera (30 minutos) para completar el build"
    print_warning "El build puede estar todavía en progreso. Verifica manualmente en:"
    print_warning "  https://expo.dev/builds/$BUILD_ID"
    print_warning "Puedes descargar el APK manualmente más tarde con:"
    print_warning "  eas build:download --id=$BUILD_ID"
    print_warning "Ejemplo: eas build:download --id=$BUILD_ID --path=./flash_report.apk"
    exit 1
fi

# ============================================================================
# PASO 6: Descargar APK
# ============================================================================
print_title "PASO 6: Descargar APK"

# Crear directorio para descargas si no existe
DOWNLOAD_DIR="./builds/apk"
mkdir -p "$DOWNLOAD_DIR"

print_step "Descargando APK..."

APK_FILENAME="flash_report-$(date +%Y%m%d-%H%M%S).apk"
APK_PATH="$DOWNLOAD_DIR/$APK_FILENAME"

# Descargar el APK usando eas build:download
print_step "Descargando APK desde EAS Cloud..."
if eas build:download --id "$BUILD_ID" --path "$APK_PATH" 2>&1; then
    # Verificar que el archivo se descargó correctamente
    if [ ! -f "$APK_PATH" ]; then
        print_error "El archivo APK no se creó después de la descarga"
        exit 1
    fi
    
    APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
    APK_BYTES=$(du -b "$APK_PATH" | cut -f1)
    
    if [ "$APK_BYTES" -eq 0 ]; then
        print_error "El archivo APK está vacío (0 bytes). La descarga puede haber fallado."
        exit 1
    fi
    
    # Verificar que el archivo tenga extensión .apk (aunque el nombre ya lo tiene)
    if [[ "$APK_PATH" != *.apk ]]; then
        print_warning "El archivo descargado no tiene extensión .apk: $APK_PATH"
    fi
    
    print_step "✓ APK descargado exitosamente: $APK_FILENAME ($APK_SIZE, $APK_BYTES bytes)"
    print_step "Ubicación: $(pwd)/$APK_PATH"
else
    print_error "No se pudo descargar el APK automáticamente"
    print_step "Descárgalo manualmente desde:"
    echo "  https://expo.dev/builds/$BUILD_ID"
    print_step "O ejecuta manualmente:"
    echo "  eas build:download --id=$BUILD_ID --path=$APK_PATH"
    print_warning "El APK puede no estar disponible inmediatamente después de completar el build."
    print_warning "Espera unos minutos e intenta nuevamente."
    exit 1
fi

# ============================================================================
# RESUMEN FINAL
# ============================================================================
print_title "COMPILACIÓN COMPLETADA"

print_step "Build ID: $BUILD_ID"
print_step "Perfil utilizado: preview (APK)"
print_step "Descarga manual: https://expo.dev/builds/$BUILD_ID"

if [ -f "$APK_PATH" ]; then
    print_step "APK local: $APK_PATH"
    print_step "Comando para instalar en dispositivo:"
    echo -e "  ${YELLOW}adb install $APK_PATH${NC}"
fi

print_title "Próximos Pasos"
echo -e "1. ${YELLOW}Instalar en dispositivo:${NC}"
echo -e "   adb install $APK_PATH"
echo ""
echo -e "2. ${YELLOW}Ver logs:${NC}"
echo -e "   adb logcat"
echo ""
echo -e "3. ${YELLOW}Ver compilaciones anteriores:${NC}"
echo -e "   eas build:list --platform android"
echo ""

print_step "¡Listo!"