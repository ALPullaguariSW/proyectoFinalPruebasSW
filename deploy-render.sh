#!/bin/bash

# Script de despliegue manual para Render
# Uso: ./deploy-render.sh [RENDER_API_KEY]

set -e

# Verificar que se proporcione la API key
if [ -z "$1" ]; then
    echo "❌ Error: Debes proporcionar tu RENDER_API_KEY"
    echo "Uso: ./deploy-render.sh [RENDER_API_KEY]"
    echo ""
    echo "Para obtener tu API key:"
    echo "1. Ve a https://dashboard.render.com/account/api-keys"
    echo "2. Crea una nueva API key"
    echo "3. Ejecuta: ./deploy-render.sh TU_API_KEY"
    exit 1
fi

RENDER_API_KEY=$1
BLUEPRINT_FILE="render.yaml"

echo "🚀 Iniciando despliegue a Render..."
echo "📁 Archivo de blueprint: $BLUEPRINT_FILE"

# Verificar que existe el archivo de blueprint
if [ ! -f "$BLUEPRINT_FILE" ]; then
    echo "❌ Error: No se encontró el archivo $BLUEPRINT_FILE"
    exit 1
fi

# Desplegar usando Render Blueprint
echo "📤 Enviando blueprint a Render..."

RESPONSE=$(curl -s -X POST "https://api.render.com/v1/blueprint-instances" \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d @$BLUEPRINT_FILE)

# Verificar la respuesta
if echo "$RESPONSE" | grep -q "id"; then
    echo "✅ Despliegue iniciado exitosamente!"
    echo "📊 Respuesta de Render:"
    echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
    
    # Extraer el ID del blueprint instance
    BLUEPRINT_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    
    if [ ! -z "$BLUEPRINT_ID" ]; then
        echo ""
        echo "🔍 Para monitorear el progreso:"
        echo "https://dashboard.render.com/blueprint-instances/$BLUEPRINT_ID"
        
        echo ""
        echo "⏳ Esperando a que el despliegue se complete..."
        
        # Esperar a que el despliegue se complete
        while true; do
            STATUS_RESPONSE=$(curl -s -X GET "https://api.render.com/v1/blueprint-instances/$BLUEPRINT_ID" \
              -H "Authorization: Bearer $RENDER_API_KEY")
            
            STATUS=$(echo "$STATUS_RESPONSE" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
            
            case $STATUS in
                "created"|"building")
                    echo "🔄 Estado: $STATUS - Construyendo..."
                    sleep 30
                    ;;
                "live")
                    echo "✅ Estado: $STATUS - ¡Despliegue completado!"
                    
                    # Obtener URLs de los servicios
                    SERVICES_RESPONSE=$(curl -s -X GET "https://api.render.com/v1/blueprint-instances/$BLUEPRINT_ID/services" \
                      -H "Authorization: Bearer $RENDER_API_KEY")
                    
                    echo ""
                    echo "🌐 URLs de despliegue:"
                    echo "$SERVICES_RESPONSE" | jq -r '.services[] | "\(.name): \(.service.url)"' 2>/dev/null || echo "$SERVICES_RESPONSE"
                    break
                    ;;
                "failed")
                    echo "❌ Estado: $STATUS - El despliegue falló"
                    echo "📋 Detalles del error:"
                    echo "$STATUS_RESPONSE" | jq '.' 2>/dev/null || echo "$STATUS_RESPONSE"
                    exit 1
                    ;;
                *)
                    echo "❓ Estado desconocido: $STATUS"
                    sleep 30
                    ;;
            esac
        done
    fi
else
    echo "❌ Error en el despliegue:"
    echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
    exit 1
fi

echo ""
echo "🎉 ¡Despliegue completado exitosamente!"
echo "📚 Para más información, visita: https://dashboard.render.com"
