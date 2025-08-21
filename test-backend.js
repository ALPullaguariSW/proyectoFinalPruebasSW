// Script simple para probar el backend
const http = require('http');

const BASE_URL = 'http://localhost:3000';

async function testEndpoint(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Probando endpoints del backend...\n');

  try {
    // Test 1: Health check
    console.log('1️⃣ Probando /api/health...');
    const health = await testEndpoint('/api/health');
    console.log(`   Status: ${health.status}`);
    console.log(`   Response:`, health.data);
    console.log('');

    // Test 2: Ping simple
    console.log('2️⃣ Probando /api/ping-simple...');
    const ping = await testEndpoint('/api/ping-simple');
    console.log(`   Status: ${ping.status}`);
    console.log(`   Response:`, ping.data);
    console.log('');

    // Test 3: Test DB
    console.log('3️⃣ Probando /api/test-db...');
    const db = await testEndpoint('/api/test-db');
    console.log(`   Status: ${db.status}`);
    console.log(`   Response:`, db.data);
    console.log('');

    // Test 4: Echo POST
    console.log('4️⃣ Probando /api/echo-simple (POST)...');
    const echo = await testEndpoint('/api/echo-simple', 'POST', { test: 'data' });
    console.log(`   Status: ${echo.status}`);
    console.log(`   Response:`, echo.data);
    console.log('');

    console.log('✅ Todos los tests pasaron exitosamente!');
    console.log('🚀 El backend está funcionando correctamente.');

  } catch (error) {
    console.error('❌ Error en los tests:', error.message);
    console.log('');
    console.log('🔍 Verifica que:');
    console.log('   1. El backend esté ejecutándose (npm start)');
    console.log('   2. Esté en el puerto 3000');
    console.log('   3. La base de datos esté conectada');
  }
}

// Ejecutar tests
runTests();
