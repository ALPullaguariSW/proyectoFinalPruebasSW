import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 1,
  duration: '30s',
};

export default function () {
  const baseUrl = __ENV.BASE_URL || 'http://localhost:3000';

  // 1. Prueba de ping (debería funcionar)
  let res = http.get(`${baseUrl}/api/ping-simple`);
  check(res, {
    'ping status is 200': (r) => r.status === 200,
  });

  // 2. Registro de usuario
  const regPayload = JSON.stringify({
    nombre: 'Debug User',
    correo: `debug_${__VU}_${__ITER}@test.com`,
    contrasena: 'p4ss!w',
    confirm_contrasena: 'p4ss!w',
  });
  
  res = http.post(`${baseUrl}/api/registro`, regPayload, {
    headers: { 'Content-Type': 'application/json' },
  });
  
  check(res, {
    'registro status': (r) => r.status === 200 || r.status === 400,
  });

  // 3. Login para obtener token
  const loginPayload = JSON.stringify({ 
    correo: `debug_${__VU}_${__ITER}@test.com`, 
    contrasena: 'p4ss!w' 
  });
  
  res = http.post(`${baseUrl}/api/login`, loginPayload, {
    headers: { 'Content-Type': 'application/json' },
  });
  
  check(res, {
    'login status': (r) => r.status === 200,
    'login has token': (r) => !!r.json('token'),
  });

  if (res.status === 200) {
    const token = res.json('token');
    const usuarioId = res.json('usuario.id');
    const authHeaders = { Authorization: `Bearer ${token}` };

    console.log(`✅ Login exitoso - Usuario ID: ${usuarioId}, Token: ${token.substring(0, 20)}...`);

    // 4. Probar habitaciones disponibles SIN autenticación
    const today = new Date();
    const start = new Date(today.getTime() + 24 * 3600 * 1000);
    const end = new Date(today.getTime() + 48 * 3600 * 1000);
    const qs = `fecha_inicio=${start.toISOString().split('T')[0]}&fecha_fin=${end.toISOString().split('T')[0]}`;
    
    console.log(`🔍 Probando habitaciones disponibles: ${qs}`);
    
    res = http.get(`${baseUrl}/api/habitaciones-disponibles?${qs}`);
    console.log(`📊 Habitaciones disponibles (sin auth): ${res.status} - ${res.body}`);
    
    check(res, {
      'habitaciones sin auth status': (r) => r.status === 200 || r.status === 401,
    });

    // 5. Probar habitaciones disponibles CON autenticación
    res = http.get(`${baseUrl}/api/habitaciones-disponibles?${qs}`, { 
      headers: authHeaders 
    });
    console.log(`📊 Habitaciones disponibles (con auth): ${res.status} - ${res.body}`);
    
    check(res, {
      'habitaciones con auth status': (r) => r.status === 200,
    });

    // 6. Probar mis reservas
    res = http.get(`${baseUrl}/api/mis-reservas/${usuarioId}`, { 
      headers: authHeaders 
    });
    console.log(`📊 Mis reservas: ${res.status} - ${res.body}`);
    
    check(res, {
      'mis reservas status': (r) => r.status === 200,
    });

  } else {
    console.log(`❌ Login falló: ${res.status} - ${res.body}`);
  }

  sleep(2);
}
