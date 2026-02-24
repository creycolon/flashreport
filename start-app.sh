#!/bin/bash
#
# Script mejorado para lanzar Flash Report Supabase con verificación de Metro
# Solo inicia ngrok si el servidor Metro responde correctamente.

# Configuración
SUBDOMAIN="flashreport"
PORT=8081
TIMEOUT=30      # segundos máximos de espera para que Metro arranque
CHECK_INTERVAL=2 # segundos entre cada verificación

# Agregar ngrok al PATH si está en /tmp
export PATH=$PATH:/tmp

echo "🚀 Iniciando Flash Report Supabase..."

# Función para verificar si el puerto está respondiendo (Metro listo)
check_port() {
    nc -z localhost $PORT 2>/dev/null
}

# Iniciar servidor Metro en segundo plano y guardar su PID
echo "📱 Iniciando servidor Metro en puerto $PORT..."
npx expo start --port $PORT &
METRO_PID=$!

# Asegurar que matamos el proceso si el script termina inesperadamente
trap "kill $METRO_PID 2>/dev/null" EXIT

# Esperar a que Metro esté listo (con timeout)
echo "⏳ Esperando a que Metro esté disponible (máx. ${TIMEOUT}s)..."
elapsed=0
while [ $elapsed -lt $TIMEOUT ]; do
    if check_port; then
        echo "✅ Servidor Metro detectado en puerto $PORT"
        break
    fi
    sleep $CHECK_INTERVAL
    elapsed=$((elapsed + CHECK_INTERVAL))
done

# Si no se detectó Metro en el tiempo límite, abortar
if [ $elapsed -ge $TIMEOUT ]; then
    echo "❌ ERROR: El servidor Metro no respondió después de ${TIMEOUT} segundos."
    echo "   Revisa si 'npx expo start' se ejecuta correctamente o si el puerto $PORT está ocupado."
    kill $METRO_PID 2>/dev/null
    exit 1
fi

# Iniciar ngrok solo si Metro está funcionando
echo "🌐 Iniciando ngrok tunnel hacia el puerto $PORT con subdominio '$SUBDOMAIN'..."
ngrok http $PORT --subdomain=$SUBDOMAIN

# Al salir (cuando ngrok se detenga), el trap se encargará de matar el proceso Metro
