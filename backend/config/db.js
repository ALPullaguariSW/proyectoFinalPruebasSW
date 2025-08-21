require('dotenv').config();
const { Pool } = require('pg');

// Usar URL de conexión completa si está disponible
const connectionString = process.env.DATABASE_URL || 
  `postgresql://${process.env.POSTGRES_USER || 'reservas_db_knfd_user'}:${process.env.POSTGRES_PASSWORD || 'fPLvTe9gRVqQuhUSgcQmv7ehmNfDMqRk'}@${process.env.POSTGRES_HOST || 'dpg-d2j4m5gdl3ps738nulb0-a.oregon-postgres.render.com'}:${process.env.POSTGRES_PORT || 5432}/${process.env.POSTGRES_DB || 'reservas_db_knfd'}`;

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
    sslmode: 'require'
  },
  connectionTimeoutMillis: 60000,
  idleTimeoutMillis: 60000,
  max: 10,
  min: 2
});

pool.on('connect', () => {
  console.log('✅ Conectado a la base de datos PostgreSQL en Render');
});

pool.on('error', (err) => {
  console.error('❌ Error de conexión PostgreSQL:', err.message);
});

module.exports = pool;
