const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Crear un pool temporal para la inicialización
const tempPool = new Pool({
  connectionString: process.env.DATABASE_URL || 
    `postgresql://${process.env.POSTGRES_USER || 'reservas_db_knfd_user'}:${process.env.POSTGRES_PASSWORD || 'fPLvTe9gRVqQuhUSgcQmv7ehmNfDMqRk'}@${process.env.POSTGRES_HOST || 'dpg-d2j4m5gdl3ps738nulb0-a.oregon-postgres.render.com'}:${process.env.POSTGRES_PORT || 5432}/${process.env.POSTGRES_DB || 'reservas_db_knfd'}`,
  ssl: {
    rejectUnauthorized: false,
    sslmode: 'require'
  }
});

async function initializeDatabase() {
  try {
    console.log('🚀 Inicializando base de datos...');
    
    // Leer el archivo init-postgres.sql (compatible con PostgreSQL)
    const initSqlPath = path.join(__dirname, '..', 'init-postgres.sql');
    
    if (!fs.existsSync(initSqlPath)) {
      console.log('⚠️  Archivo init.sql no encontrado, creando esquema básico...');
      await createBasicSchema();
      return;
    }
    
    const initSql = fs.readFileSync(initSqlPath, 'utf8');
    
    // Ejecutar el script SQL
    await tempPool.query(initSql);
    
    console.log('✅ Base de datos inicializada correctamente');
    
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error.message);
    
    // Si falla, intentar crear esquema básico
    try {
      console.log('🔄 Intentando crear esquema básico...');
      await createBasicSchema();
    } catch (fallbackError) {
      console.error('❌ Error al crear esquema básico:', fallbackError.message);
      throw fallbackError;
    }
  } finally {
    // Cerrar solo el pool temporal
    await tempPool.end();
  }
}

async function createBasicSchema() {
  const basicSchema = `
    -- Crear tabla de usuarios si no existe
    CREATE TABLE IF NOT EXISTS usuarios (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL,
      correo VARCHAR(100) UNIQUE NOT NULL,
      contrasena VARCHAR(255) NOT NULL,
      rol VARCHAR(20) DEFAULT 'usuario',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Crear tabla de tipos de habitación si no existe
    CREATE TABLE IF NOT EXISTS tipos_habitacion (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(50) NOT NULL,
      descripcion TEXT,
      precio DECIMAL(10,2) NOT NULL,
      capacidad INT NOT NULL
    );

    -- Crear tabla de habitaciones si no existe
    CREATE TABLE IF NOT EXISTS habitaciones (
      id SERIAL PRIMARY KEY,
      numero VARCHAR(10) UNIQUE NOT NULL,
      tipo_id INT REFERENCES tipos_habitacion(id),
      estado VARCHAR(20) DEFAULT 'disponible'
    );

    -- Crear tabla de reservas si no existe
    CREATE TABLE IF NOT EXISTS reservas (
      id SERIAL PRIMARY KEY,
      usuario_id INT REFERENCES usuarios(id),
      habitacion_id INT REFERENCES habitaciones(id),
      fecha_inicio DATE NOT NULL,
      fecha_fin DATE NOT NULL,
      estado VARCHAR(20) DEFAULT 'pendiente',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Insertar datos básicos si no existen
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

// Ejecutar si se llama directamente
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('🎉 Inicialización completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { initializeDatabase };
