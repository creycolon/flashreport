#!/bin/bash
# Configuración
PORT=8081
TIMEOUT=30
CHECK_INTERVAL=2
LOG_FILE="expo-start.log"
NGROK_AUTH_TOKEN="2LOQxluOKLxg2vjtIZhs4eADnr1_4k5eBNWqfdZCFsUmS9fEv"
echo "🚀 Iniciando Flash Report Supabase..."
# Verificar si ngrok está instalado
if ! command -v ngrok &> /dev/null; then
    echo "📦 Instalando ngrok..."
    curl -sSL https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
    echo "deb https://ngrok-agent.s3.amazonaws.com bookworm main" | sudo tee /etc/apt/sources.list.d/ngrok.list >/dev/null
    sudo apt update -qq
    sudo apt install -y ngrok
fi
# Configurar ngrok con authtoken
echo "🔑 Configurando ngrok..."
ngrok config add-authtoken $NGROK_AUTH_TOKEN
# Iniciar Metro
echo "📱 Iniciando servidor Metro en puerto $PORT..."
npx expo start --port $PORT 2>&1 | tee "$LOG_FILE" &
METRO_PID=$!
# Esperar a Metro
echo "⏳ Esperando a Metro..."
sleep 10
# Iniciar ngrok con subdominio aleatorio (ngrok lo asigna automáticamente)
echo "🌐 Iniciando ngrok..."
ngrok http $PORT --scheme=http,https
trap "kill $METRO_PID 2>/dev/null" EXIT
