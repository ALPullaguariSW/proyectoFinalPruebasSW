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
  console.log('🔍 Headers:', req.headers);
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

// Endpoint para inicializar la base de datos manualmente
app.post('/api/init-db', async (req, res) => {
  try {
    console.log('🚀 Inicializando base de datos manualmente...');
    
    // Crear un pool temporal separado para no afectar el pool principal
    const { Pool } = require('pg');
    const tempPool = new Pool({
      connectionString: process.env.DATABASE_URL || 
        `postgresql://${process.env.POSTGRES_USER || 'reservas_db_knfd_user'}:${process.env.POSTGRES_PASSWORD || 'fPLvTe9gRVqQuhUSgcQmv7ehmNfDMqRk'}@${process.env.POSTGRES_HOST || 'dpg-d2j4m5gdl3ps738nulb0-a.oregon-postgres.render.com'}:${process.env.POSTGRES_PORT || 5432}/${process.env.POSTGRES_DB || 'reservas_db_knfd'}`,
      ssl: {
        rejectUnauthorized: false,
        sslmode: 'require'
      }
    });

    try {
      // Leer y ejecutar el script SQL
      const fs = require('fs');
      const path = require('path');
      const initSqlPath = path.join(__dirname, 'init-postgres.sql');
      
      if (fs.existsSync(initSqlPath)) {
        const initSql = fs.readFileSync(initSqlPath, 'utf8');
        await tempPool.query(initSql);
        console.log('✅ Base de datos inicializada correctamente');
      } else {
        // Crear esquema básico si no existe el archivo
        const basicSchema = `
          CREATE TABLE IF NOT EXISTS usuarios (
            id SERIAL PRIMARY KEY,
            nombre VARCHAR(100) NOT NULL,
            correo VARCHAR(100) UNIQUE NOT NULL,
            contrasena VARCHAR(255) NOT NULL,
            rol VARCHAR(20) DEFAULT 'usuario',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS tipos_habitacion (
            id SERIAL PRIMARY KEY,
            nombre VARCHAR(50) NOT NULL,
            descripcion TEXT,
            precio DECIMAL(10,2) NOT NULL,
            capacidad INT NOT NULL
          );

          CREATE TABLE IF NOT EXISTS habitaciones (
            id SERIAL PRIMARY KEY,
            numero VARCHAR(10) UNIQUE NOT NULL,
            tipo_id INT REFERENCES tipos_habitacion(id),
            estado VARCHAR(20) DEFAULT 'disponible'
          );

          CREATE TABLE IF NOT EXISTS reservas (
            id SERIAL PRIMARY KEY,
            usuario_id INT REFERENCES usuarios(id),
            habitacion_id INT REFERENCES habitaciones(id),
            fecha_inicio DATE NOT NULL,
            fecha_fin DATE NOT NULL,
            estado VARCHAR(20) DEFAULT 'pendiente',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          INSERT INTO tipos_habitacion (nombre, descripcion, precio, capacidad) VALUES
            ('Individual', 'Habitación individual con cama de matrimonio', 50.00, 2),
            ('Doble', 'Habitación doble con dos camas individuales', 75.00, 2),
            ('Suite', 'Suite de lujo con jacuzzi', 150.00, 4)
          ON CONFLICT DO NOTHING;

          INSERT INTO habitaciones (numero, tipo_id, estado) VALUES
            ('101', 1, 'disponible'),
            ('102', 1, 'disponible'),
            ('201', 2, 'disponible'),
            ('202', 2, 'disponible'),
            ('301', 3, 'disponible')
          ON CONFLICT DO NOTHING;
        `;
        
        await tempPool.query(basicSchema);
        console.log('✅ Esquema básico creado correctamente');
      }
      
      res.json({ mensaje: 'Base de datos inicializada correctamente' });
    } finally {
      // Cerrar solo el pool temporal
      await tempPool.end();
    }
    
  } catch (error) {
    console.error('❌ Error al inicializar BD:', error);
    res.status(500).json({ mensaje: 'Error al inicializar BD', error: error.message });
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
