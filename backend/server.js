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

// Importar rutas de usuario
const usuariosRoutes = require('./routes/usuarios');
app.use('/api', usuariosRoutes);

// Importar rutas de administración
const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

// Importar ruta de health check
const healthRoutes = require('./routes/health');
app.use('/api', healthRoutes);

// RUTAS DIRECTAS PARA COINCIDIR CON EL FRONTEND
// Obtener tipos de habitación (pública)
app.get('/api/tipos-habitacion', async (req, res) => {
  try {
    const { rows: tipos } = await pool.query('SELECT id, nombre, descripcion, precio, capacidad FROM tipos_habitacion ORDER BY nombre');
    res.json(tipos);
  } catch (error) {
    console.error('Error en obtenerTiposHabitacion:', error);
    res.status(500).json({ mensaje: 'Error al obtener tipos de habitación.' });
  }
});

// Obtener habitaciones disponibles (pública)
app.get('/api/habitaciones-disponibles', async (req, res) => {
  const { fecha_inicio, fecha_fin, tipo_habitacion } = req.query;

  if (!fecha_inicio || !fecha_fin) {
    return res.status(400).json({ mensaje: 'Las fechas de entrada y salida son requeridas.', claseMensaje: 'error' });
  }
  if (fecha_fin <= fecha_inicio) {
    return res.status(400).json({ mensaje: 'La fecha de salida debe ser posterior a la fecha de entrada.', claseMensaje: 'error' });
  }

  try {
    const sql = `
      SELECT h.id, h.numero, h.estado,
        th.nombre as tipo, th.descripcion, th.precio, th.capacidad,
        NOT EXISTS (
          SELECT 1 FROM reservas r
          WHERE r.habitacion_id = h.id
            AND NOT (r.fecha_fin <= $1 OR r.fecha_inicio >= $2)
        ) AS disponible
      FROM habitaciones h
      JOIN tipos_habitacion th ON h.tipo_id = th.id
      WHERE ($3 IS NULL OR th.nombre = $3)
      ORDER BY th.nombre, th.precio, h.numero
    `;

    const params = [fecha_inicio, fecha_fin, tipo_habitacion || null];
    const { rows: habitaciones } = await pool.query(sql, params);

    return res.json({ habitaciones });
  } catch (error) {
    console.error('Error en obtenerHabitacionesDisponibles:', error);
    return res.status(500).json({ mensaje: 'Error al buscar habitaciones. Intente más tarde.', claseMensaje: 'error' });
  }
});

// Obtener mis reservas (protegida)
app.get('/api/mis-reservas/:usuario_id', async (req, res) => {
  const usuario_id = req.params.usuario_id;
  if (!usuario_id) {
    return res.status(400).json({ mensaje: 'Falta el ID de usuario.', claseMensaje: 'error' });
  }
  try {
    const { rows: reservas } = await pool.query(
      `SELECT r.id, r.fecha_inicio, r.fecha_fin, r.created_at,
        th.nombre AS habitacion_tipo, h.numero AS habitacion_numero, th.precio AS habitacion_precio
      FROM reservas r
      JOIN habitaciones h ON r.habitacion_id = h.id
      JOIN tipos_habitacion th ON h.tipo_id = th.id
      WHERE r.usuario_id = $1
      ORDER BY r.fecha_inicio DESC`,
      [usuario_id]
    );
    return res.json({ reservas });
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al obtener las reservas. Intente más tarde.', claseMensaje: 'error' });
  }
});

// Realizar reserva (protegida)
app.post('/api/reservar', async (req, res) => {
  const { usuario_id, fecha_inicio, fecha_fin, tipo_habitacion, habitacion_id, accion } = req.body;
  
  // Validaciones de fechas
  if (!fecha_inicio || !fecha_fin) {
    return res.status(400).json({ mensaje: 'Las fechas de entrada y salida son requeridas.', claseMensaje: 'error' });
  }
  if (fecha_fin <= fecha_inicio) {
    return res.status(400).json({ mensaje: 'La fecha de salida debe ser posterior a la fecha de entrada.', claseMensaje: 'error' });
  }
  
  // Consultar disponibilidad
  if (accion === 'consultar') {
    try {
      let sql = `
        SELECT h.id, h.numero, h.estado,
          th.nombre as tipo, th.descripcion, th.precio, th.capacidad,
          NOT EXISTS (
            SELECT 1 FROM reservas r
            WHERE r.habitacion_id = h.id
            AND NOT (r.fecha_fin <= $1 OR r.fecha_inicio >= $2)
          ) AS disponible
        FROM habitaciones h
        JOIN tipos_habitacion th ON h.tipo_id = th.id`;
      
      const params = [fecha_inicio, fecha_fin];
      if (tipo_habitacion) {
        sql += ' WHERE th.nombre = $3';
        params.push(tipo_habitacion);
      }
      sql += ' ORDER BY th.nombre, th.precio, h.numero';
      
      const { rows: habitaciones } = await pool.query(sql, params);
      return res.json({ habitaciones });
    } catch (error) {
      return res.status(500).json({ mensaje: 'Error al buscar habitaciones. Intente más tarde.', claseMensaje: 'error' });
    }
  }
  
  // Realizar reserva
  if (accion === 'reservar') {
    if (!habitacion_id) {
      return res.status(400).json({ mensaje: 'Debes seleccionar una habitación disponible para reservar.', claseMensaje: 'error' });
    }
    try {
      // Verificar disponibilidad de la habitación seleccionada
      const { rows: disp } = await pool.query(
        'SELECT id FROM reservas WHERE habitacion_id = $1 AND NOT (fecha_fin <= $2 OR fecha_inicio >= $3)',
        [habitacion_id, fecha_inicio, fecha_fin]
      );
      if (disp.length > 0) {
        return res.status(400).json({ mensaje: 'La habitación seleccionada ya está reservada para esas fechas.', claseMensaje: 'error' });
      }
      // Insertar reserva
      await pool.query(
        'INSERT INTO reservas (usuario_id, habitacion_id, fecha_inicio, fecha_fin) VALUES ($1, $2, $3, $4)',
        [usuario_id, habitacion_id, fecha_inicio, fecha_fin]
      );
      return res.json({ mensaje: '¡Reserva registrada con éxito!', claseMensaje: 'success' });
    } catch (error) {
      return res.status(500).json({ mensaje: 'Error al registrar la reserva. Por favor, inténtelo de nuevo.', claseMensaje: 'error' });
    }
  }
  
  // Si no se especifica acción válida
  return res.status(400).json({ mensaje: 'Acción no válida.', claseMensaje: 'error' });
});

// Cancelar reserva (protegida)
app.post('/api/cancelar-reserva', async (req, res) => {
  const { reserva_id, usuario_id } = req.body;
  if (!reserva_id || !usuario_id) {
    return res.status(400).json({ mensaje: 'Faltan datos para cancelar la reserva.', claseMensaje: 'error' });
  }
  try {
    // Solo permite cancelar si la reserva pertenece al usuario
    const { rowCount } = await pool.query('DELETE FROM reservas WHERE id = $1 AND usuario_id = $2', [reserva_id, usuario_id]);
    if (rowCount > 0) {
      return res.json({ mensaje: 'Reserva cancelada exitosamente.', claseMensaje: 'success' });
    } else {
      return res.status(404).json({ mensaje: 'Reserva no encontrada o no pertenece al usuario.', claseMensaje: 'error' });
    }
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al cancelar la reserva. Intente más tarde.', claseMensaje: 'error' });
  }
});

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
