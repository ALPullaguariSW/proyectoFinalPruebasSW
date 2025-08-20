const pool = require('./config/db');

async function testConnection() {
  try {
    console.log('🔍 Probando conexión a PostgreSQL...');
    
    const result = await pool.query('SELECT NOW() as current_time, version() as db_version');
    
    console.log('✅ Conexión exitosa!');
    console.log('⏰ Hora actual:', result.rows[0].current_time);
    console.log('📊 Versión:', result.rows[0].db_version);
    
    // Probar si las tablas existen
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('📋 Tablas existentes:', tablesResult.rows.map(row => row.table_name));
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    console.error('🔍 Detalles:', error);
  } finally {
    await pool.end();
    console.log('🔌 Conexión cerrada');
  }
}

testConnection();
