# Script de despliegue manual para Render (PowerShell)
# Uso: .\deploy-render.ps1 [RENDER_API_KEY]

param(
    [Parameter(Mandatory=$true)]
    [string]$RenderApiKey
)

# Verificar que se proporcione la API key
if ([string]::IsNullOrEmpty($RenderApiKey)) {
    Write-Host "❌ Error: Debes proporcionar tu RENDER_API_KEY" -ForegroundColor Red
    Write-Host "Uso: .\deploy-render.ps1 [RENDER_API_KEY]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Para obtener tu API key:" -ForegroundColor Cyan
    Write-Host "1. Ve a https://dashboard.render.com/account/api-keys" -ForegroundColor White
    Write-Host "2. Crea una nueva API key" -ForegroundColor White
    Write-Host "3. Ejecuta: .\deploy-render.ps1 TU_API_KEY" -ForegroundColor White
    exit 1
}

$BlueprintFile = "render.yaml"

Write-Host "🚀 Iniciando despliegue a Render..." -ForegroundColor Green
Write-Host "📁 Archivo de blueprint: $BlueprintFile" -ForegroundColor Cyan

# Verificar que existe el archivo de blueprint
if (-not (Test-Path $BlueprintFile)) {
    Write-Host "❌ Error: No se encontró el archivo $BlueprintFile" -ForegroundColor Red
    exit 1
}

# Desplegar usando Render Blueprint
Write-Host "📤 Enviando blueprint a Render..." -ForegroundColor Yellow

$Headers = @{
    "Authorization" = "Bearer $RenderApiKey"
    "Content-Type" = "application/json"
}

$BlueprintContent = Get-Content $BlueprintFile -Raw

try {
    $Response = Invoke-RestMethod -Uri "https://api.render.com/v1/blueprint-instances" -Method Post -Headers $Headers -Body $BlueprintContent
    
    Write-Host "✅ Despliegue iniciado exitosamente!" -ForegroundColor Green
    Write-Host "📊 Respuesta de Render:" -ForegroundColor Cyan
    $Response | ConvertTo-Json -Depth 10 | Write-Host
    
    $BlueprintId = $Response.id
    
    if ($BlueprintId) {
        Write-Host ""
        Write-Host "🔍 Para monitorear el progreso:" -ForegroundColor Cyan
        Write-Host "https://dashboard.render.com/blueprint-instances/$BlueprintId" -ForegroundColor Blue
        
        Write-Host ""
        Write-Host "⏳ Esperando a que el despliegue se complete..." -ForegroundColor Yellow
        
        # Esperar a que el despliegue se complete
        do {
            Start-Sleep -Seconds 30
            
            try {
                $StatusResponse = Invoke-RestMethod -Uri "https://api.render.com/v1/blueprint-instances/$BlueprintId" -Method Get -Headers $Headers
                $Status = $StatusResponse.status
                
                switch ($Status) {
                    "created" { 
                        Write-Host "🔄 Estado: $Status - Construyendo..." -ForegroundColor Yellow
                    }
                    "building" { 
                        Write-Host "🔄 Estado: $Status - Construyendo..." -ForegroundColor Yellow
                    }
                    "live" { 
                        Write-Host "✅ Estado: $Status - ¡Despliegue completado!" -ForegroundColor Green
                        
                        # Obtener URLs de los servicios
                        try {
                            $ServicesResponse = Invoke-RestMethod -Uri "https://api.render.com/v1/blueprint-instances/$BlueprintId/services" -Method Get -Headers $Headers
                            
                            Write-Host ""
                            Write-Host "🌐 URLs de despliegue:" -ForegroundColor Cyan
                            foreach ($Service in $ServicesResponse.services) {
                                Write-Host "$($Service.name): $($Service.service.url)" -ForegroundColor Green
                            }
                        }
                        catch {
                            Write-Host "⚠️ No se pudieron obtener las URLs de los servicios" -ForegroundColor Yellow
                        }
                        
                        break
                    }
                    "failed" {
                        Write-Host "❌ Estado: $Status - El despliegue falló" -ForegroundColor Red
                        Write-Host "📋 Detalles del error:" -ForegroundColor Red
                        $StatusResponse | ConvertTo-Json -Depth 10 | Write-Host
                        exit 1
                    }
                    default {
                        Write-Host "❓ Estado desconocido: $Status" -ForegroundColor Yellow
                    }
                }
            }
            catch {
                Write-Host "⚠️ Error al verificar el estado: $($_.Exception.Message)" -ForegroundColor Yellow
            }
        } while ($Status -in @("created", "building"))
    }
}
catch {
    Write-Host "❌ Error en el despliegue:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 ¡Despliegue completado exitosamente!" -ForegroundColor Green
Write-Host "📚 Para más información, visita: https://dashboard.render.com" -ForegroundColor Cyan
