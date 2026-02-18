#!/bin/bash
set -e

# ============================================================================
# iOS Local Build Environment Setup Script
# ============================================================================
# Este script prepara el entorno de desarrollo para compilar iOS localmente
# ============================================================================

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_step() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_title() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# ============================================================================
# 1. Verificar sistema operativo (iOS solo funciona en macOS)
# ============================================================================
print_title "PASO 1: Verificar Sistema Operativo"

if [[ "$OSTYPE" != "darwin"* ]]; then
    print_error "Este script solo funciona en macOS. iOS no se puede compilar en Linux/Windows."
    print_warning "Para compilar iOS necesitas:"
    print_warning "  - macOS (preferiblemente Monterey o superior)"
    print_warning "  - Xcode instalado"
    exit 1
fi

print_step "Sistema operativo verificado: macOS"
sw_vers

# ============================================================================
# 2. Limpiar cachés y derivados de Xcode
# ============================================================================
print_title "PASO 2: Limpiar Cachés de Xcode"

if [ -d "ios/build" ]; then
    print_step "Eliminando carpeta de build..."
    rm -rf ios/build
fi

if [ -d "ios/Pods" ]; then
    print_step "Eliminando Pods..."
    rm -rf ios/Pods
fi

if [ -f "ios/Podfile.lock" ]; then
    print_step "Eliminando Podfile.lock..."
    rm -f ios/Podfile.lock
fi

if [ -d "ios/DerivedData" ]; then
    print_step "Eliminando DerivedData..."
    rm -rf ios/DerivedData
fi

print_step "Cachés limpiados"

# ============================================================================
# 3. Verificar Xcode y Command Line Tools
# ============================================================================
print_title "PASO 3: Verificar Xcode y Herramientas"

# Verificar Xcode
if ! command -v xcode-select &> /dev/null; then
    print_error "Xcode Command Line Tools no está instalado"
    print_warning "Instálalo con: xcode-select --install"
    exit 1
fi

XCODE_PATH=$(xcode-select -p)
print_step "Xcode Command Line Tools encontrado: $XCODE_PATH"

# Verificar Xcode.app
if [ ! -d "/Applications/Xcode.app" ]; then
    print_warning "Xcode.app no encontrado en /Applications"
    print_warning "Instala Xcode desde la App Store o desde https://developer.apple.com/download/more/"
    print_warning "Luego ejecuta: sudo xcode-select -s /Applications/Xcode.app/Contents/Developer"
    exit 1
fi

print_step "Xcode.app encontrado en /Applications"

# Verificar licencia de Xcode
if ! xcodebuild -license check 2>/dev/null; then
    print_warning "Licencia de Xcode no aceptada"
    print_warning "Ejecuta: sudo xcodebuild -license accept"
    exit 1
fi

print_step "Licencia de Xcode aceptada"

# Verificar versión de Xcode
XCODE_VERSION=$(xcodebuild -version | head -n 1)
print_step "Versión de Xcode: $XCODE_VERSION"

# ============================================================================
# 4. Verificar CocoaPods
# ============================================================================
print_title "PASO 4: Verificar CocoaPods"

if ! command -v pod &> /dev/null; then
    print_warning "CocoaPods no está instalado"
    print_step "Instalando CocoaPods..."
    
    # Verificar Ruby
    if ! command -v ruby &> /dev/null; then
        print_error "Ruby no está instalado. CocoaPods requiere Ruby."
        exit 1
    fi
    
    # Instalar CocoaPods
    sudo gem install cocoapods
fi

POD_VERSION=$(pod --version)
print_step "CocoaPods encontrado: v$POD_VERSION"

# ============================================================================
# 5. Verificar Node.js y npm/yarn
# ============================================================================
print_title "PASO 5: Verificar Node.js y Gestor de Paquetes"

if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado"
    print_warning "Instálalo con: brew install node"
    exit 1
fi

NODE_VERSION=$(node --version)
print_step "Node.js encontrado: $NODE_VERSION"

if ! command -v npm &> /dev/null; then
    print_error "npm no está instalado"
    exit 1
fi

NPM_VERSION=$(npm --version)
print_step "npm encontrado: $NPM_VERSION"

# ============================================================================
# 6. Instalar dependencias del proyecto
# ============================================================================
print_title "PASO 6: Instalar Dependencias del Proyecto"

print_step "Instalando dependencias de npm..."
npm install

print_step "Instalando CocoaPods en ios/..."
cd ios
pod install --repo-update
cd ..

print_step "Dependencias instaladas correctamente"

# ============================================================================
# 7. Limpiar y regenerar proyecto nativo (Prebuild)
# ============================================================================
print_title "PASO 7: Regenerar Proyecto Nativo (Prebuild)"

print_step "Regenerando proyecto nativo para iOS..."
npx expo prebuild --platform ios --clean

print_step "Proyecto nativo regenerado"

# ============================================================================
# 8. Verificar dispositivos/simuladores disponibles
# ============================================================================
print_title "PASO 8: Verificar Dispositivos Disponibles"

print_step "Buscando simuladores y dispositivos iOS disponibles..."

# Listar dispositivos disponibles
SIMULATORS=$(xcrun simctl list devices available | grep -E "iPhone|iPad" | head -5)

if [ -z "$SIMULATORS" ]; then
    print_warning "No se encontraron simuladores disponibles"
    print_warning "Abre Xcode > Window > Devices and Simulators para crear uno"
else
    print_step "Simuladores disponibles:"
    echo "$SIMULATORS"
fi

# ============================================================================
# 9. Compilar para iOS
# ============================================================================
print_title "PASO 9: Compilar para iOS"

echo ""
echo "¿Dónde quieres compilar?"
echo "1) Simulador iOS (recomendado para pruebas)"
echo "2) Dispositivo físico (requiere certificados de desarrollo)"
echo "3) Solo generar build (sin ejecutar)"
echo ""
read -p "Selecciona una opción (1-3): " BUILD_OPTION

case $BUILD_OPTION in
    1)
        print_step "Compilando para simulador iOS..."
        npx expo run:ios --simulator "iPhone 15"
        ;;
    2)
        print_step "Compilando para dispositivo físico..."
        print_warning "Asegúrate de tener:"
        print_warning "  - Certificado de desarrollo de Apple"
        print_warning "  - Provisioning Profile configurado"
        print_warning "  - Dispositivo conectado y confiado"
        npx expo run:ios --device
        ;;
    3)
        print_step "Generando build para iOS..."
        cd ios
        xcodebuild -workspace flash_report.xcworkspace -scheme flash_report -configuration Debug -sdk iphonesimulator -destination 'platform=iOS Simulator,name=iPhone 15' clean build
        cd ..
        print_step "Build generado en ios/build/"
        ;;
    *)
        print_error "Opción inválida. Saliendo..."
        exit 1
        ;;
esac

# ============================================================================
# RESUMEN FINAL
# ============================================================================
print_title "COMPILACIÓN COMPLETADA"

print_step "Resumen:"
echo -e "  ${YELLOW}Proyecto:${NC} flash_report"
echo -e "  ${YELLOW}Plataforma:${NC} iOS"
echo -e "  ${YELLOW}Xcode:${NC} $XCODE_VERSION"
echo -e "  ${YELLOW}CocoaPods:${NC} v$POD_VERSION"
echo -e "  ${YELLOW}Node.js:${NC} $NODE_VERSION"

print_title "Próximos Pasos"

echo -e "1. ${YELLOW}Ver logs de la app:${NC}"
echo -e "   npx expo start --clear"
echo ""
echo -e "2. ${YELLOW}Compilar nuevamente:${NC}"
echo -e "   npx expo run:ios"
echo ""
echo -e "3. ${YELLOW}Abrir en Xcode:${NC}"
echo -e "   open ios/flash_report.xcworkspace"
echo ""
echo -e "4. ${YELLOW}Limpiar y recompilar:${NC}"
echo -e "   cd ios && pod install && cd .."
echo -e "   npx expo prebuild --platform ios --clean"
echo -e "   npx expo run:ios"
echo ""

print_step "¡Listo! Tu app iOS está compilada y ejecutándose."