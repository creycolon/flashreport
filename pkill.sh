#!/bin/bash

# Obtener el PID del proceso en el puerto 8081
PID=$(sudo lsof -t -i:8081)

if [ -n "$PID" ]; then
    echo "Matando proceso en puerto 8081 (PID: $PID)..."
    sudo kill -9 $PID
    echo "Proceso eliminado"
else
    echo "No hay proceso ejecutándose en el puerto 8081"
fi

#sudo lsof -t -i:8081-8085 | xargs -r sudo kill -

#for port in {8081..8085}; do 
#    PID=$(sudo lsof -t -i:$port)
#    [ -n "$PID" ] && sudo kill -9 $PID
#done

