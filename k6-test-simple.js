import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 1,
  duration: '10s',
};

export default function () {
  const baseUrl = __ENV.BASE_URL || 'http://localhost:3000';

  // Prueba simple de ping
  let res = http.get(`${baseUrl}/api/ping-simple`);
  check(res, {
    'ping status is 200': (r) => r.status === 200,
  });

  // Prueba de registro
  const regPayload = JSON.stringify({
    nombre: 'Test User',
    correo: `test_${__VU}_${__ITER}@test.com`,
    contrasena: 'p4ss!w',
    confirm_contrasena: 'p4ss!w',
  });
  
  res = http.post(`${baseUrl}/api/registro`, regPayload, {
    headers: { 'Content-Type': 'application/json' },
  });
  
  check(res, {
    'registro status': (r) => r.status === 200 || r.status === 400,
    'registro response': (r) => r.body.length > 0,
  });

  console.log(`Registro response: ${res.status} - ${res.body}`);

  sleep(1);
}
