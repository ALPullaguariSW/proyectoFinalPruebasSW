# Plataforma de Reservas A

Sistema de reservas con backend en Node.js/Express y frontend en Angular. Integra autenticación con JWT y base de datos MySQL. Este repositorio implementa CI/CD completo con GitHub Actions, pruebas de rendimiento con k6, y cobertura de tests ≥90%.

## Arquitectura

- **Backend**: Express, MySQL (mysql2), JWT, CORS, dotenv
- **Frontend**: Angular, consumo de API vía proxy
- **CI/CD**: GitHub Actions con workflows separados para CI y CD
- **Testing**: Jest con cobertura ≥90%, k6 para pruebas de rendimiento
- **Deployment**: GitHub Pages (frontend) + Render (backend)

## Requisitos

- Node.js 20+
- MySQL
- k6 (para pruebas de rendimiento)

## Configuración Local

### Backend
```bash
cd backend
npm install
npm start
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Testing

### Tests Unitarios (Backend)
```bash
cd backend
npm test
```

### Tests de Rendimiento (k6)
```bash
# Ramp/Load test
k6 run tests/k6/ramp-load.js

# Spike test
k6 run tests/k6/spike.js

# Soak test
k6 run tests/k6/soak.js
```

## CI/CD Pipeline

### Integración Continua (CI)
- **Triggers**: push y pull_request a main
- **Jobs**: Backend (lint + tests), Frontend (build), Performance (k6)
- **Cobertura**: ≥90% en líneas, ramas, funciones y statements
- **Artefactos**: Reportes de cobertura, logs, resultados de k6

### Despliegue Continuo (CD)
- **Condición**: Solo se ejecuta si CI + k6 pasan exitosamente
- **Frontend**: GitHub Pages automático
- **Backend**: Render con API trigger
- **Secrets**: RENDER_TOKEN, RENDER_SERVICE_ID

## Estructura de Tests k6

### Ramp/Load
- Incremento gradual: 10 → 100 VUs en 10 minutos
- Thresholds: p(95) < 500ms, error rate < 1%, checks > 99%

### Spike
- Salto brusco: 0 → 300 VUs en 20s, mantener 2 min
- Thresholds: p(95) < 500ms, error rate < 1%, checks > 99%

### Soak
- Carga sostenida: 40-60 VUs durante 60 minutos
- Thresholds: p(95) < 500ms, error rate < 1%, checks > 99%

## Variables de Entorno

### Backend (.env)
```
PORT=3000
DB_HOST=localhost
DB_USER=usuario
DB_PASSWORD=clave
DB_NAME=    reservas_db
JWT_SECRET=alguno-seguro
```

### Configuración de GitHub Pages

Para habilitar GitHub Pages:

1. Ir a Settings > Pages del repositorio
2. Source: "GitHub Actions"
3. El despliegue se ejecutará automáticamente en push a main

## Despliegue

### Frontend (GitHub Pages)
1. El workflow se ejecuta automáticamente en push a main
2. Se despliega desde `frontend/dist/`
3. URL: `https://{username}.github.io/{repo-name}`

### Backend (Local)
1. Ejecutar localmente con `npm start` en el directorio `backend/`
2. Puerto por defecto: 3000
3. Base de datos: SQLite local (development) / PostgreSQL (production)

## Monitoreo y Métricas

- **Cobertura de Tests**: Reportes HTML y LCOV
- **Performance**: Resultados JSON de k6
- **Deployment**: URLs y logs de despliegue
- **CI Status**: Checks visibles en PRs

## Contribución

1. Fork del repositorio
2. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -m 'Add nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

## Licencia

ISC
