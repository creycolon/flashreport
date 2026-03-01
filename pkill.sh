#!/bin/bash

# Iteramos sobre el rango de puertos del 8000 al 9000

sudo lsof -t -i:8081-9008 | xargs -r sudo kill -9

: << 'COMENTARIO'
for port in {8000..9000}; do
    # Buscamos el PID usando lsof. La flag -t devuelve solo el número del PID.
    # Redirigimos errores a /dev/null para no ver mensajes de "no hay proceso" en cada vuelta.
    PID=$(sudo lsof -t -i :$port 2>/dev/null)

    if [ -n "$PID" ]; then
        echo "Matando proceso en puerto $port (PID: $PID)..."
        sudo kill -9 $PID
        echo "Proceso en puerto $port eliminado."
    fi
done

echo "Finalizado el escaneo del rango 8000-9000."

COMENTARIO


