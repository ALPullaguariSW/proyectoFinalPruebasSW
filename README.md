# 🏨 Plataforma de Reservas de Hotel

Sistema completo de gestión de reservas de hotel con backend Node.js/Express, frontend Angular y base de datos PostgreSQL.

## 🚀 Características

- **Backend**: API REST con Node.js, Express y PostgreSQL
- **Frontend**: Aplicación Angular con interfaz moderna y responsive
- **Autenticación**: JWT con roles de usuario y administrador
- **Base de datos**: PostgreSQL con esquema optimizado
- **CI/CD**: GitHub Actions con pruebas automáticas y despliegue continuo
- **Testing**: Cobertura ≥90% con Jest y Karma
- **Performance**: Pruebas de carga con k6

## 🏗️ Arquitectura

```
├── backend/           # API REST (Node.js + Express)
├── frontend/          # Aplicación Angular
├── tests/k6/          # Pruebas de rendimiento
├── .github/workflows/ # CI/CD con GitHub Actions
└── render.yaml        # Infraestructura como código (Render)
```

## 🚀 Despliegue

### **Opción 1: Despliegue Automático (Recomendado)**

El proyecto se despliega automáticamente cuando se hace push a la rama `main`:

1. **CI**: Se ejecutan todas las pruebas y se valida cobertura ≥90%
2. **CD Backend**: Se despliega automáticamente a Render
3. **CD Frontend**: Se despliega automáticamente a GitHub Pages

### **Opción 2: Despliegue Manual**

#### **Backend + Base de Datos en Render**

1. **Obtener API Key de Render:**
   - Ve a [https://dashboard.render.com/account/api-keys](https://dashboard.render.com/account/api-keys)
   - Crea una nueva API key

2. **Desplegar usando PowerShell (Windows):**
   ```powershell
   .\deploy-render.ps1 TU_API_KEY_AQUI
   ```

3. **Desplegar usando Bash (Linux/Mac):**
   ```bash
   chmod +x deploy-render.sh
   ./deploy-render.sh TU_API_KEY_AQUI
   ```

#### **Frontend en GitHub Pages**

```bash
cd frontend
npm run build
# El build se despliega automáticamente a GitHub Pages
```

## 🔧 Configuración Local

### **Requisitos**

- Node.js 20+
- npm 9+
- PostgreSQL 14+

### **Backend**

```bash
cd backend
npm install
npm start
```

**Variables de entorno necesarias:**
```env
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/plataforma_reservas
JWT_SECRET=tu-secreto-jwt-aqui
PORT=3000
```

### **Frontend**

```bash
cd frontend
npm install
npm start
```

## 🧪 Testing

### **Pruebas Unitarias**

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm run test:ci
```

### **Pruebas de Rendimiento (k6)**

```bash
# Instalar k6
# https://k6.io/docs/getting-started/installation/

# Ejecutar pruebas
cd tests/k6
k6 run ramp-load.js
k6 run spike.js
k6 run soak.js
```

## 📊 Cobertura de Pruebas

- **Backend**: ≥96% (Jest)
- **Frontend**: ≥96% (Karma/Jasmine)

## 🔄 CI/CD Pipeline

### **Workflow CI**
- ✅ Checkout del repositorio
- ✅ Setup de Node.js 20
- ✅ Instalación de dependencias
- ✅ Ejecución de pruebas unitarias
- ✅ Validación de cobertura ≥90%
- ✅ Publicación de reportes como artefactos

### **Workflow CD**
- ✅ Despliegue automático del backend a Render
- ✅ Despliegue automático del frontend a GitHub Pages
- ✅ Actualización automática del README con URLs

## 🌐 URLs de Despliegue

- **Frontend**: [GitHub Pages](https://TU_USUARIO.github.io/TU_REPO/)
- **Backend**: [Render](https://plataforma-reservas-backend.onrender.com)
- **Health Check**: [https://plataforma-reservas-backend.onrender.com/api/health](https://plataforma-reservas-backend.onrender.com/api/health)

## 📋 Estado del Proyecto

- [x] **CI/CD**: GitHub Actions configurado
- [x] **Testing**: Cobertura ≥90% alcanzada
- [x] **Performance**: Pruebas k6 implementadas
- [x] **Backend**: Desplegado en Render
- [x] **Frontend**: Desplegado en GitHub Pages
- [x] **Base de datos**: PostgreSQL en Render

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:

1. Revisa los [issues](https://github.com/TU_USUARIO/TU_REPO/issues)
2. Crea un nuevo issue con detalles del problema
3. Incluye logs de error y pasos para reproducir

---

**Desarrollado con ❤️ para el Proyecto Final de Pruebas de Software**
