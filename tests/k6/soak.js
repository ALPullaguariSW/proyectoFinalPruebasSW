import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Configuración para CI (más rápida)
export const options = {
  stages: [
    { duration: '30s', target: 20 },   // Ramp up a 20 VUs en 30s
    { duration: '30s', target: 20 },   // Mantener 20 VUs por 30s
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% de requests deben ser < 500ms
    http_req_failed: ['rate<0.01'],   // Error rate < 1%
    checks: ['rate>0.99'],            // Checks > 99%
  },
};

// Métricas personalizadas
const errorRate = new Rate('errors');

// Función principal del test
export default function () {
  const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
  
  // Test de endpoints básicos
  const responses = http.batch([
    ['GET', `${BASE_URL}/api/health`],
    ['GET', `${BASE_URL}/api/ping-simple`],
    ['GET', `${BASE_URL}/api/test-db`],
  ]);

  // Verificar respuestas
  responses.forEach((response, index) => {
    const isSuccess = check(response, {
      'status is 200': (r) => r.status === 200,
      'response time < 500ms': (r) => r.timings.duration < 500,
    });

    if (!isSuccess) {
      errorRate.add(1);
    }
  });

  // Pausa entre requests
  sleep(1);
}
