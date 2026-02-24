#!/bin/bash

# Instalar ngrok desde repositorio oficial
echo "📦 Instalando ngrok..."
curl -sSL https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
echo "deb https://ngrok-agent.s3.amazonaws.com bookworm main" | sudo tee /etc/apt/sources.list.d/ngrok.list >/dev/null
sudo apt update -qq
sudo apt install -y ngrok

# Configurar token
echo "🔑 Configurando ngrok..."
ngrok config add-authtoken 2LOQxluOKLxg2vjtIZhs4eADnr1_4k5eBNWqfdZCFsUmS9fEv

# Configuración
PORT=8081
TIMEOUT=30
CHECK_INTERVAL=2

echo "🚀 Iniciando Flash Report Supabase..."

# Función para verificar puerto
check_port() {
    nc -z localhost $PORT 2>/dev/null
}

# Iniciar Metro
echo "📱 Iniciando servidor Metro en puerto $PORT..."
npx expo start --port $PORT &
METRO_PID=$!

trap "kill $METRO_PID 2>/dev/null" EXIT

# Esperar a Metro
echo "⏳ Esperando a Metro (máx ${TIMEOUT}s)..."
elapsed=0
while [ $elapsed -lt $TIMEOUT ]; do
    if check_port; then
        echo "✅ Metro detectado en puerto $PORT"
        break
    fi
    sleep $CHECK_INTERVAL
    elapsed=$((elapsed + CHECK_INTERVAL))
done

if [ $elapsed -ge $TIMEOUT ]; then
    echo "❌ ERROR: Metro no respondió"
    kill $METRO_PID 2>/dev/null
    exit 1
fi

# Iniciar ngrok
echo "🌐 Iniciando ngrok..."
ngrok http $PORT
