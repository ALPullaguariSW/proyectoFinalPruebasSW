# 🚀 Inicio Rápido - Desarrollo Local

## Prerequisitos
- Node.js 18+ 
- npm

## Configuración Rápida

### 1. Backend
```bash
cd backend
npm install
npm start
```
El backend estará corriendo en `http://localhost:3000`

### 2. Frontend (en otra terminal)
```bash
cd frontend
npm install
npm start
```
El frontend estará corriendo en `http://localhost:4200`

## Tests

### Tests Unitarios
```bash
# Backend
cd backend && npm test

# Frontend  
cd frontend && npm run test:ci
```

### Tests de Performance (k6)
```bash
# Asegurar que el backend esté corriendo
cd backend && npm start &

# Ejecutar tests k6
k6 run tests/k6/ramp-load.js
k6 run tests/k6/spike.js  
k6 run tests/k6/soak.js
```

## Base de Datos
- **Desarrollo**: SQLite (archivo local)
- **Producción**: PostgreSQL (ver docker-compose.yml)

## URLs
- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000
- **GitHub Pages**: Se configura automáticamente en push a main
