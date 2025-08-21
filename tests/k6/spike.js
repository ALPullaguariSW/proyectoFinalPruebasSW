import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Configuración Spike: salto brusco 0→300 VUs según requisitos del ingeniero
export const options = {
  stages: [
    { duration: '15s', target: 300 },  // Spike brusco a 300 VUs en 15s
    { duration: '1m', target: 300 },   // Mantener 300 VUs por 1 min
    { duration: '15s', target: 0 },    // Bajar a 0 VUs en 15s
  ],
  thresholds: {
    'http_req_duration{expected_response:true}': ['p(95)<500'], // 95% de requests exitosos < 500ms
    http_req_failed: ['rate<0.01'],   // Error rate < 1%
    checks: ['rate>0.99'],            // Checks > 99%
  },
};

// Métricas personalizadas
const errorRate = new Rate('errors');

// Función principal del test
export default function () {
  const BASE_URL = __ENV.BASE_URL || 'https://proyectofinalpruebassw.onrender.com';
  
  // Test de endpoints reales del backend para spike test
  const responses = http.batch([
    ['GET', `${BASE_URL}/api/health`],
    ['GET', `${BASE_URL}/api/tipos-habitacion`],
    ['GET', `${BASE_URL}/api/habitaciones-disponibles?fecha_inicio=2024-12-01&fecha_fin=2024-12-02`],
  ]);

  // Verificar respuestas
  responses.forEach((response, index) => {
    const isSuccess = check(response, {
      'status is 200': (r) => r.status === 200,
      'response time < 1000ms': (r) => r.timings.duration < 1000, // Más tolerante para spike test
      'has response body': (r) => r.body && r.body.length > 0,
    });

    if (!isSuccess) {
      errorRate.add(1);
    }
  });

  // Test de login (simulación para spike)
  const loginPayload = JSON.stringify({
    correo: 'admin@hotel.com',
    contrasena: 'password'
  });

  const loginResponse = http.post(`${BASE_URL}/api/login`, loginPayload, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(loginResponse, {
    'login status is 200 or 401': (r) => r.status === 200 || r.status === 401,
    'login response time < 1000ms': (r) => r.timings.duration < 1000,
  });

  // Pausa más corta para spike test
  sleep(0.3);
}
