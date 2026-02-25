#!/bin/bash

# Flash Report Deploy Script
# Ejecute en su servidor Ubuntu

set -e

echo "=== Flash Report Deploy ==="

# Configuración
IMAGE="ghcr.io/creycolon/flash_report_supabase:latest"
CONTAINER_NAME="flash-report"
PORT=80

# Login a GitHub Container Registry
echo "Iniciando sesión en GitHub Container Registry..."
docker login ghcr.io -u creycolon -p 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

# Detener y remover contenedor existente si hay
if [ "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
    echo "Deteniendo contenedor anterior..."
    docker stop $CONTAINER_NAME
    docker rm $CONTAINER_NAME
fi

# Descargar imagen
echo "Descargando imagen..."
docker pull $IMAGE

# Ejecutar contenedor
echo "Iniciando contenedor..."
docker run -d -p $PORT:80 --name $CONTAINER_NAME $IMAGE

echo "=== Deploy completado ==="
echo "Acceda a: http://$(hostname -I | awk '{print $1}')"
