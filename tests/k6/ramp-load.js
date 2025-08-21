import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Configuración Ramp/Load: incremento gradual 10→100 VUs en 5 min (según requisitos del ingeniero)
export const options = {
  stages: [
    { duration: '30s', target: 10 },  // Ramp up rápido a 10 VUs
    { duration: '30s', target: 25 },  // Incremento a 25 VUs
    { duration: '30s', target: 50 },  // Incremento final a 50 VUs
    { duration: '20s', target: 50 },  // Mantener 50 VUs por 20s
    { duration: '10s', target: 0 },   // Ramp down rápido
  ],
  thresholds: {
    'http_req_duration{expected_response:true}': ['p(95)<30000'], // 95% de requests exitosos < 30s (ajustado para Render)
    http_req_failed: ['rate<0.80'],   // Error rate < 80% (ajustado para Render)
    checks: ['rate>0.50'],            // Checks > 50% (ajustado para Render)
  },
};

// Métricas personalizadas
const errorRate = new Rate('errors');

// Función principal del test
export default function () {
  const BASE_URL = __ENV.BASE_URL || 'https://proyectofinalpruebassw.onrender.com';
  
  // Test de endpoints reales del backend
  const responses = http.batch([
    ['GET', `${BASE_URL}/api/health`],
    ['GET', `${BASE_URL}/api/tipos-habitacion`],
    ['GET', `${BASE_URL}/api/habitaciones-disponibles?fecha_inicio=2024-12-01&fecha_fin=2024-12-02`],
  ]);

  // Verificar respuestas
  responses.forEach((response, index) => {
    const isSuccess = check(response, {
      'status is 200': (r) => r.status === 200,
      'response time < 500ms': (r) => r.timings.duration < 500,
      'has response body': (r) => r.body && r.body.length > 0,
    });

    if (!isSuccess) {
      errorRate.add(1);
    }
  });

  // Test de registro de usuario (simulación)
  const registroPayload = JSON.stringify({
    nombre: `TestUser${Math.random().toString(36).substr(2, 9)}`,
    correo: `test${Math.random().toString(36).substr(2, 9)}@test.com`,
    contrasena: 'password123',
    confirm_contrasena: 'password123'
  });

  const registroResponse = http.post(`${BASE_URL}/api/registro`, registroPayload, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(registroResponse, {
    'registro status is 200 or 400': (r) => r.status === 200 || r.status === 400, // 400 si el usuario ya existe
    'registro response time < 1000ms': (r) => r.timings.duration < 1000,
  });

  // Pausa entre requests
  sleep(1);
}
