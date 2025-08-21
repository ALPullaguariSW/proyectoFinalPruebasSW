// Cargar variables de entorno
require('dotenv').config();

// Requerir librerías
const express = require('express');
const cors = require('cors');
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Middleware de logging para debugging
app.use((req, res, next) => {
  console.log(`🔍 ${req.method} ${req.path} - Body:`, req.body);
  console.log(`🔍 Headers:`, req.headers);
  next();
});

// Conexión a la base de datos
const pool = require('./config/db');

// Ruta básica de prueba (opcional)
app.get('/', (req, res) => {
  res.send('✅ Servidor funcionando y base de datos conectada');
});

// Importar rutas de usuario
const usuariosRoutes = require('./routes/usuarios');
app.use('/api', usuariosRoutes);

// Importar rutas de administración
const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

// Importar ruta de health check
const healthRoutes = require('./routes/health');
app.use('/api', healthRoutes);

// Endpoints sencillos para pruebas de carga (k6)
app.get('/api/ping-simple', async (req, res) => {
  const delayMs = Math.floor(Math.random() * 500);
  await new Promise((resolve) => setTimeout(resolve, delayMs));
  res.json({ mensaje: 'pong', delayMs });
});

// Endpoint para probar la conexión a la base de datos
app.get('/api/test-db', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT 1 as test');
    res.json({ mensaje: 'Conexión a BD exitosa', data: rows[0] });
  } catch (error) {
    console.error('Error de conexión a BD:', error);
    res.status(500).json({ mensaje: 'Error de conexión a BD', error: error.message });
  }
});

app.post('/api/echo-simple', (req, res) => {
  res.status(200).json({ recibido: req.body ?? null });
});

// Puerto del .env o 3000 por defecto (Render usa 10000)
const PORT = process.env.PORT || 3000;

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});
