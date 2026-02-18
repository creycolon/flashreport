#!/bin/bash

# Configuración
API_KEY="AQ.Ab8RN6J8lF_o6do-ya9h8W42cn-gzLENf4Iz3nLcJbYrIyFaFw"
PROJECT_ID="18266581404286886305"
BASE_URL="https://stitch.googleapis.com/v1/projects"
DOWNLOAD_DIR="stitch_downloads"

# IDs de los screens solicitados
declare -a SCREEN_IDS=(
    "dbbf10e47a0a461b906110e16b8882dd"
    "46a4c4e834104f50b178127a1d30fec1"
    "fa814594872d4d8c92d36a42f9251159"
    "8cab46cf66a94b818f6e60749164874a"
    "d744b6e498504306bde406fd8bcb2fcf"
)

# Nombres descriptivos para los screens (opcional)
declare -A SCREEN_NAMES=(
    ["dbbf10e47a0a461b906110e16b8882dd"]="Dashboard_Web_Principal"
    ["46a4c4e834104f50b178127a1d30fec1"]="Movimientos_Operativos_Web"
    ["fa814594872d4d8c92d36a42f9251159"]="Informes_y_Auditoria_Web"
    ["8cab46cf66a94b818f6e60749164874a"]="Configuracion_y_Parametros_Web"
    ["d744b6e498504306bde406fd8bcb2fcf"]="Login_Movil"
)

# Crear directorio de descargas
mkdir -p "$DOWNLOAD_DIR"

# Función para descargar un archivo
download_file() {
    local url="$1"
    local output_file="$2"
    
    echo "Descargando: $output_file"
    curl -L -H "X-Goog-Api-Key: $API_KEY" "$url" -o "$output_file" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "  ✓ Descargado: $(basename "$output_file")"
    else
        echo "  ✗ Error descargando: $(basename "$output_file")"
    fi
}

# Función principal
main() {
    echo "=== Descargando screens del proyecto Stitch ==="
    echo "Proyecto: $PROJECT_ID"
    echo "Directorio: $DOWNLOAD_DIR"
    echo "Total screens: ${#SCREEN_IDS[@]}"
    echo ""
    
    for screen_id in "${SCREEN_IDS[@]}"; do
        echo "Procesando screen: $screen_id"
        
        # Obtener nombre descriptivo o usar el ID
        screen_name="${SCREEN_NAMES[$screen_id]:-$screen_id}"
        
        # Crear subdirectorio para este screen
        screen_dir="$DOWNLOAD_DIR/$screen_name"
        mkdir -p "$screen_dir"
        
        # URL para obtener metadatos del screen
        screen_url="$BASE_URL/$PROJECT_ID/screens/$screen_id"
        
        echo "  Obteniendo metadatos..."
        metadata_file="$screen_dir/metadata.json"
        curl -s -H "X-Goog-Api-Key: $API_KEY" "$screen_url" -o "$metadata_file"
        
        if [ ! -s "$metadata_file" ]; then
            echo "  ✗ Error obteniendo metadatos para $screen_id"
            continue
        fi
        
        # Extraer URLs de descarga del JSON
        screenshot_url=$(jq -r '.screenshot.downloadUrl // empty' "$metadata_file")
        html_url=$(jq -r '.htmlCode.downloadUrl // empty' "$metadata_file")
        
        # Determinar extensión de la imagen basada en la URL
        if [[ -n "$screenshot_url" ]]; then
            # Intentar detectar extensión
            if [[ "$screenshot_url" =~ \.(jpg|jpeg|JPG|JPEG) ]]; then
                img_ext="jpg"
            elif [[ "$screenshot_url" =~ \.(png|PNG) ]]; then
                img_ext="png"
            elif [[ "$screenshot_url" =~ \.(webp|WEBP) ]]; then
                img_ext="webp"
            else
                img_ext="png"  # por defecto
            fi
            
            img_file="$screen_dir/${screen_name}_screenshot.$img_ext"
            download_file "$screenshot_url" "$img_file"
        else
            echo "  ✗ No se encontró URL de screenshot"
        fi
        
        if [[ -n "$html_url" ]]; then
            html_file="$screen_dir/${screen_name}_code.html"
            download_file "$html_url" "$html_file"
        else
            echo "  ✗ No se encontró URL de código HTML"
        fi
        
        echo ""
    done
    
    echo "=== Descarga completada ==="
    echo "Archivos guardados en: $DOWNLOAD_DIR"
    
    # Mostrar resumen
    echo ""
    echo "Resumen de descargas:"
    for screen_dir in "$DOWNLOAD_DIR"/*/; do
        if [ -d "$screen_dir" ]; then
            screen_name=$(basename "$screen_dir")
            echo "  $screen_name:"
            for file in "$screen_dir"/*; do
                if [ -f "$file" ]; then
                    size=$(du -h "$file" | cut -f1)
                    echo "    - $(basename "$file") ($size)"
                fi
            done
        fi
    done
}

# Ejecutar script principal
main