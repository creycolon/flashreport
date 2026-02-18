#!/bin/bash

# ============================================================================
# EAS Build Script - flash_report APK/IPA Build & Download
# ============================================================================
# Este script realiza lo siguiente:
# 1. Verifica la instalación de eas-cli
# 2. Inicia sesión en Expo (si es necesario)
# 3. Configura las credenciales automáticamente
# 4. Envía el proyecto a EAS Build para Android y/o iOS
# 5. Obtiene y descarga el APK/IPA compilado
# ============================================================================

set -e  # Salir al primer error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables por defecto
PLATFORM="both"  # Opciones: android, ios, both
PROFILE="preview"
BUILD_TYPE="apk" # Para iOS sería "archive" o "simulator"

# Parsear argumentos
while [[ $# -gt 0 ]]; do
    case $1 in
        --platform|-p)
            PLATFORM="$2"
            shift 2
            ;;
        --profile|-r)
            PROFILE="$2"
            shift 2
            ;;
        --build-type|-t)
            BUILD_TYPE="$2"
            shift 2
            ;;
        --help|-h)
            echo "Uso: $0 [--platform android|ios|both] [--profile preview|development|production] [--build-type apk|archive|simulator]"
            echo ""
            echo "Opciones:"
            echo "  --platform, -p     Plataforma a compilar (android, ios, both)"
            echo "  --profile, -r      Perfil de compilación (preview, development, production)"
            echo "  --build-type, -t   Tipo de build (apk, archive, simulator)"
            echo "  --help, -h         Mostrar esta ayuda"
            exit 0
            ;;
        *)
            echo "Opción desconocida: $1"
            echo "Usa --help para ver las opciones disponibles"
            exit 1
            ;;
    esac
done

# Validar plataforma
if [[ ! "$PLATFORM" =~ ^(android|ios|both)$ ]]; then
    echo -e "${RED}Error:${NC} Plataforma inválida. Use 'android', 'ios' o 'both'"
    exit 1
fi

# Validar perfil
if [[ ! "$PROFILE" =~ ^(preview|development|production)$ ]]; then
    echo -e "${RED}Error:${NC} Perfil inválido. Use 'preview', 'development' o 'production'"
    exit 1
fi

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
      "ios": {
        "simulator": true
      },
      "distribution": "internal"
    },
    "production": {
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "autoIncrement": true
      }
    }
  },
  "submit": {
    "production": {}
  }
}
EOF
    print_step "eas.json creado con configuración básica (incluyendo iOS)"
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

# ============================================================================
# PASO 4: Configurar credenciales por plataforma
# ============================================================================
print_title "PASO 4: Configurar Credenciales"

if [[ "$PLATFORM" == "android" || "$PLATFORM" == "both" ]]; then
    print_step "Configurando credenciales de Android..."
    eas build:configure --platform android --non-interactive 2>/dev/null || {
        print_warning "La configuración automática puede requerir interacción manual"
        print_step "Si se abre el navegador, sigue las instrucciones para completar la configuración"
        eas build:configure --platform android
    }
fi

if [[ "$PLATFORM" == "ios" || "$PLATFORM" == "both" ]]; then
    print_step "Configurando credenciales de iOS..."
    print_warning "iOS requiere certificados y provisioning profiles de Apple"
    eas build:configure --platform ios --non-interactive 2>/dev/null || {
        print_warning "La configuración automática puede requerir interacción manual"
        print_step "Si se abre el navegador, sigue las instrucciones para completar la configuración"
        eas build:configure --platform ios
    }
fi

# ============================================================================
# PASO 5: Enviar proyecto a EAS Build
# ============================================================================
print_title "PASO 5: Enviar Proyecto a EAS Build"

build_platform() {
    local platform=$1
    local build_id=""
    
    print_step "Iniciando build para $platform (perfil: $PROFILE)..."
    print_warning "Este proceso puede tomar varios minutos (típicamente 5-15 minutos)"
    
    local build_command=""
    if [ "$platform" == "android" ]; then
        build_command="eas build --platform android --profile $PROFILE --non-interactive --json"
    else
        build_command="eas build --platform ios --profile $PROFILE --non-interactive --json"
    fi
    
    print_step "Enviando build a EAS Cloud para $platform..."
    BUILD_OUTPUT=$($build_command 2>&1)
    BUILD_EXIT_CODE=$?
    
    # Intentar extraer BUILD_ID del JSON de salida
    BUILD_ID=$(echo "$BUILD_OUTPUT" | jq -r '.id // empty' 2>/dev/null || echo "")
    
    # Si no se pudo extraer el ID, verificar si hay mensaje de error en el JSON
    if [ -z "$BUILD_ID" ]; then
        ERROR_MESSAGE=$(echo "$BUILD_OUTPUT" | jq -r '.message // .error // empty' 2>/dev/null || echo "")
        
        if [ -n "$ERROR_MESSAGE" ]; then
            print_error "Error al enviar build a EAS para $platform: $ERROR_MESSAGE"
        else
            print_error "No se pudo obtener el BUILD_ID para $platform. El comando eas build puede haber fallado."
            print_error "Código de salida: $BUILD_EXIT_CODE"
            print_error "Output completo:"
            echo "$BUILD_OUTPUT"
        fi
        
        # Sugerencias para solucionar problemas comunes
        print_warning "Posibles soluciones:"
        print_warning "1. Verifica tu conexión a internet"
        print_warning "2. Ejecuta 'eas whoami' para verificar tu sesión en Expo"
        print_warning "3. Verifica que tu proyecto esté configurado correctamente con 'eas project:info'"
        print_warning "4. Intenta ejecutar manualmente: $build_command"
        
        return 1
    fi
    
    print_step "✓ Build enviado con éxito a EAS Cloud para $platform"
    print_step "Build ID: $BUILD_ID"
    print_step "URL de seguimiento: https://expo.dev/builds/$BUILD_ID"
    
    echo "$BUILD_ID"
}

# Almacenar IDs de builds
BUILD_IDS=()

if [[ "$PLATFORM" == "android" || "$PLATFORM" == "both" ]]; then
    ANDROID_BUILD_ID=$(build_platform "android")
    if [ $? -eq 0 ]; then
        BUILD_IDS+=("android:$ANDROID_BUILD_ID")
    fi
fi

if [[ "$PLATFORM" == "ios" || "$PLATFORM" == "both" ]]; then
    IOS_BUILD_ID=$(build_platform "ios")
    if [ $? -eq 0 ]; then
        BUILD_IDS+=("ios:$IOS_BUILD_ID")
    fi
fi

if [ ${#BUILD_IDS[@]} -eq 0 ]; then
    print_error "No se pudo enviar ningún build. Saliendo..."
    exit 1
fi

# ============================================================================
# PASO 6: Monitorear los builds
# ============================================================================
print_title "PASO 6: Monitorear Compilación"

monitor_build() {
    local platform=$1
    local build_id=$2
    
    print_step "Esperando que se complete el build para $platform..."
    print_warning "Puedes ver el progreso en: https://expo.dev/builds/$build_id"
    
    # Esperar a que se complete con polling
    MAX_ATTEMPTS=180  # 30 minutos con 10 segundos entre intentos
    ATTEMPT=0
    
    while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
        BUILD_STATUS=$(eas build:view --id "$build_id" --json 2>&1 | jq -r '.status // empty' 2>/dev/null || echo "")
        
        if [ "$BUILD_STATUS" = "FINISHED" ] || [ "$BUILD_STATUS" = "finished" ]; then
            print_step "¡Build completado exitosamente para $platform!"
            return 0
        elif [ "$BUILD_STATUS" = "FAILED" ] || [ "$BUILD_STATUS" = "failed" ]; then
            print_error "El build falló para $platform. Detalles:"
            eas build:view --id "$build_id" --json
            return 1
        fi
        
        ATTEMPT=$((ATTEMPT + 1))
        PROGRESS=$((ATTEMPT * 100 / MAX_ATTEMPTS))
        echo -ne "Estado $platform: ${BUILD_STATUS:-PENDING} | Progreso: ${PROGRESS}% (Intento $ATTEMPT/$MAX_ATTEMPTS)\r"
        
        sleep 10
    done
    
    # Verificar si se agotó el tiempo de espera
    if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
        print_error "Se agotó el tiempo de espera (30 minutos) para completar el build para $platform"
        print_warning "El build puede estar todavía en progreso. Verifica manualmente en:"
        print_warning "  https://expo.dev/builds/$build_id"
        return 1
    fi
}

# Monitorear cada build
for build_info in "${BUILD_IDS[@]}"; do
    IFS=':' read -r platform build_id <<< "$build_info"
    if ! monitor_build "$platform" "$build_id"; then
        print_warning "Build para $platform falló, continuando con los demás..."
    fi
done

# ============================================================================
# PASO 7: Descargar APK/IPA
# ============================================================================
print_title "PASO 7: Descargar Archivos Compilados"

download_build() {
    local platform=$1
    local build_id=$2
    
    # Crear directorio para descargas si no existe
    DOWNLOAD_DIR="./builds/$platform"
    mkdir -p "$DOWNLOAD_DIR"
    
    print_step "Descargando archivo para $platform..."
    
    local filename=""
    local extension=""
    if [ "$platform" == "android" ]; then
        filename="flash_report-$(date +%Y%m%d-%H%M%S).apk"
        extension="apk"
    else
        filename="flash_report-$(date +%Y%m%d-%H%M%S).ipa"
        extension="ipa"
    fi
    
    FILE_PATH="$DOWNLOAD_DIR/$filename"
    
    # Descargar el archivo usando eas build:download
    print_step "Descargando archivo desde EAS Cloud para $platform..."
    if eas build:download --id "$build_id" --path "$FILE_PATH" 2>&1; then
        # Verificar que el archivo se descargó correctamente
        if [ ! -f "$FILE_PATH" ]; then
            print_error "El archivo $extension no se creó después de la descarga para $platform"
            return 1
        fi
        
        FILE_SIZE=$(du -h "$FILE_PATH" | cut -f1)
        FILE_BYTES=$(du -b "$FILE_PATH" | cut -f1)
        
        if [ "$FILE_BYTES" -eq 0 ]; then
            print_error "El archivo $extension está vacío (0 bytes) para $platform. La descarga puede haber fallado."
            return 1
        fi
        
        print_step "✓ Archivo descargado exitosamente para $platform: $filename ($FILE_SIZE, $FILE_BYTES bytes)"
        print_step "Ubicación: $(pwd)/$FILE_PATH"
        
        echo "$FILE_PATH"
    else
        print_error "No se pudo descargar el archivo automáticamente para $platform"
        print_step "Descárgalo manualmente desde:"
        echo "  https://expo.dev/builds/$build_id"
        print_step "O ejecuta manualmente:"
        echo "  eas build:download --id=$build_id --path=$FILE_PATH"
        print_warning "El archivo puede no estar disponible inmediatamente después de completar el build."
        print_warning "Espera unos minutos e intenta nuevamente."
        return 1
    fi
}

# Descargar cada archivo
DOWNLOADS=()
for build_info in "${BUILD_IDS[@]}"; do
    IFS=':' read -r platform build_id <<< "$build_info"
    if downloaded_file=$(download_build "$platform" "$build_id"); then
        DOWNLOADS+=("$platform:$downloaded_file")
    fi
done

# ============================================================================
# RESUMEN FINAL
# ============================================================================
print_title "COMPILACIÓN COMPLETADA"

echo ""
echo -e "${GREEN}Build IDs:${NC}"
for build_info in "${BUILD_IDS[@]}"; do
    IFS=':' read -r platform build_id <<< "$build_info"
    echo -e "  $platform: $build_id"
done

echo ""
echo -e "${GREEN}Archivos descargados:${NC}"
for download_info in "${DOWNLOADS[@]}"; do
    IFS=':' read -r platform file_path <<< "$download_info"
    echo -e "  $platform: $file_path"
done

echo ""
print_title "Próximos Pasos"

for download_info in "${DOWNLOADS[@]}"; do
    IFS=':' read -r platform file_path <<< "$download_info"
    
    if [ "$platform" == "android" ]; then
        echo -e "1. ${YELLOW}Instalar en dispositivo Android:${NC}"
        echo -e "   adb install $file_path"
        echo ""
    else
        echo -e "1. ${YELLOW}Instalar en dispositivo iOS:${NC}"
        echo -e "   Usa Xcode, TestFlight o una herramienta de distribución"
        echo ""
    fi
done

echo -e "2. ${YELLOW}Ver compilaciones anteriores:${NC}"
echo -e "   eas build:list"
echo ""
echo -e "3. ${YELLOW}Descargar manualmente:${NC}"
for build_info in "${BUILD_IDS[@]}"; do
    IFS=':' read -r platform build_id <<< "$build_info"
    echo -e "   eas build:download --id=$build_id"
done

print_step "¡Listo!"