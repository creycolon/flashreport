#!/bin/bash
set -e

# 1. Stop any running Gradle daemons (forces restart with new JAVA_HOME)
echo "🛑 Deteniendo demonios de Gradle..."
if [ -d "android" ]; then cd android && ./gradlew --stop && cd ..; fi

# 2. Set JAVA_HOME to the compatible JDK 21 (found on your system)
echo "☕ Configurando Java 21..."
export JAVA_HOME="/usr/lib/jvm/java-21-openjdk-amd64"
if [ ! -d "$JAVA_HOME" ]; then echo "Error: Java 21 not found at $JAVA_HOME"; exit 1; fi
export PATH=$JAVA_HOME/bin:$PATH

# 3. Verify version
echo "🔍 Verificando versión de Java (debe ser 21)..."
java -version

# 4. Set ANDROID_HOME (Found at ~/Android/Sdk)
echo "📱 Configurando Android SDK..."
export ANDROID_HOME="$HOME/Android/Sdk"
if [ ! -d "$ANDROID_HOME" ]; then echo "Error: Android SDK not found at $ANDROID_HOME"; exit 1; fi
export PATH=$ANDROID_HOME/platform-tools:$PATH

# 5. Clean Prebuild (Fixes Reference Linking Errors)
echo "🧹 Regenerando proyecto nativo (Prebuild)..."
npx expo prebuild --platform android --clean

# 6. Run the build targeting the connected device
echo "🚀 Iniciando compilación en dispositivo físico..."
npx expo run:android

