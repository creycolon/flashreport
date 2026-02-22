# Flash Report - Instrucciones para Build APK

## 📱 Configuración para Generar APK

### ✅ **Estado Actual:**
- ✅ Proyecto configurado con Expo EAS
- ✅ Cuenta Expo vinculada: `creyco`
- ✅ Package name: `com.creyco.flashreport`
- ✅ Versión: 1.0.0
- ✅ Sistema de temas dinámico implementado
- ✅ Configuración de build lista

### 🚀 **Scripts Disponibles:**
    Para plataforma especifica
    eas build --platform android --clear-cache
    eas build --platform ios --clear-cache

    Si ya estas en un proceso iniciado
        
    npx expo prebuild --clean

    git add .
    git commit -m "fix: clearing cache and preparing new build"
    eas build --platform all --clear-cache

#### **1. Primer Build (Generar Keystore)**
```bash
# Ejecuta ESTE script la PRIMERA VEZ
./first-build.sh
```

**IMPORTANTE:** Este script:
- Genera el Android Keystore (solo primera vez)
- Abre el navegador para autorización
- Inicia el primer build
- **GUARDA UNA COPIA DEL KEYSTORE** si te lo pide

#### **2. Builds Posteriores**
```bash
# Usa ESTE script después del primer build
./build-apk.sh
```

Este script te permite:
- Build Preview (APK para pruebas internas)
- Build Production (APK para distribución)
- Ver builds anteriores

#### **3. Scripts NPM (alternativos)**
```bash
# Build Preview
npm run build:android-preview

# Build Production  
npm run build:android
```

### 🔑 **Sobre el Android Keystore:**

**⚠️ ATENCIÓN:** El keystore es CRÍTICO:
- Identifica tu aplicación de forma única
- Es necesario para publicar actualizaciones
- Si lo pierdes, NO podrás actualizar la misma app en Google Play
- Expo lo guarda en la nube automáticamente

### ⏱️ **Tiempos de Build:**
- **Primer build:** 15-25 minutos (incluye keystore generation)
- **Builds posteriores:** 5-10 minutos
- **Tamaño APK:** ~25-40 MB

### 🌐 **Seguimiento del Build:**

1. **URL del proyecto:** https://expo.dev/accounts/creyco/projects/flash_report
2. **URL de builds:** https://expo.dev/accounts/creyco/projects/flash_report/builds
3. **Cuenta:** `creyco`

### 📥 **Descargar APK:**

Cuando el build termine:
1. Ve a: https://expo.dev/accounts/creyco/projects/flash_report/builds
2. Busca el build más reciente
3. Haz clic en "Download"

**O usa comandos:**
```bash
# Listar builds
npx eas build:list --platform android

# Descargar APK
npx eas build:download --id [BUILD_ID] --path ./flash_report.apk

# Instalar en dispositivo
adb install ./flash_report.apk
```

### 🔧 **Solución de Problemas:**

#### **Error: "Generating a new Android Keystore"**
- Ejecuta `./first-build.sh` (primer build)
- Sigue las instrucciones en pantalla
- Autoriza en el navegador cuando se abra

#### **Error: "No hay sesión activa"**
```bash
eas login
# O
npx eas login
```

#### **Error: "eas-cli no encontrado"**
```bash
npm install -g eas-cli@latest
# O usa npx:
npx eas [comando]
```

#### **Verificar configuración:**
```bash
# Ver sesión
eas whoami

# Ver proyecto
eas project:info

# Ver configuración Android
eas credentials --platform android
```

### 📋 **Checklist Antes del Build:**

- [ ] Cuenta Expo: `creyco` (verificado)
- [ ] Package name: `com.creyco.flashreport` (configurado)
- [ ] Versión: 1.0.0 (versionCode: 1)
- [ ] Assets (iconos): verificados
- [ ] Cambios: commitados en git
- [ ] Conexión a internet: estable

### 📞 **Soporte:**

- **Documentación Expo:** https://docs.expo.dev/build/setup/
- **Estado del servicio:** https://status.expo.dev/
- **Dashboard del proyecto:** https://expo.dev/accounts/creyco/projects/flash_report

---

**¡Listo para construir el APK! 🎉**

Ejecuta: `./first-build.sh` para el primer build
