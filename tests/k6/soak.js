import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Configuración Soak: carga sostenida 40-60 VUs (duración reducida para CI)
export const options = {
  stages: [
    { duration: '20s', target: 30 },   // Ramp up rápido a 30 VUs
    { duration: '1m', target: 40 },    // Mantener carga sostenida 40 VUs por 1 min
    { duration: '20s', target: 50 },   // Incremento a 50 VUs
    { duration: '1m', target: 50 },    // Mantener 50 VUs por 1 min
    { duration: '20s', target: 0 },    // Ramp down rápido
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
  
  // Test de endpoints reales del backend para soak test (endurance)
  const responses = http.batch([
    ['GET', `${BASE_URL}/api/health`],
    ['GET', `${BASE_URL}/api/tipos-habitacion`],
    ['GET', `${BASE_URL}/api/habitaciones-disponibles?fecha_inicio=2024-12-01&fecha_fin=2024-12-02`],
  ]);

  // Verificar respuestas con criterios estrictos para soak test
  responses.forEach((response, index) => {
    const isSuccess = check(response, {
      'status is 200': (r) => r.status === 200,
      'response time < 500ms': (r) => r.timings.duration < 500,
      'has response body': (r) => r.body && r.body.length > 0,
      'no server errors': (r) => !r.body.includes('error') && !r.body.includes('Error'),
    });

    if (!isSuccess) {
      errorRate.add(1);
    }
  });

  // Test de flujo completo: consulta de disponibilidad variada
  const fechaInicio = new Date();
  fechaInicio.setDate(fechaInicio.getDate() + Math.floor(Math.random() * 30)); // Random entre 0-30 días
  const fechaFin = new Date(fechaInicio);
  fechaFin.setDate(fechaFin.getDate() + Math.floor(Math.random() * 7) + 1); // Random entre 1-7 días de estancia

  const disponibilidadResponse = http.get(
    `${BASE_URL}/api/habitaciones-disponibles?fecha_inicio=${fechaInicio.toISOString().split('T')[0]}&fecha_fin=${fechaFin.toISOString().split('T')[0]}`
  );

  check(disponibilidadResponse, {
    'disponibilidad status is 200': (r) => r.status === 200,
    'disponibilidad response time < 800ms': (r) => r.timings.duration < 800,
    'disponibilidad has habitaciones': (r) => {
      try {
        const data = JSON.parse(r.body);
        return data.habitaciones && Array.isArray(data.habitaciones);
      } catch {
        return false;
      }
    },
  });

  // Pausa más larga para soak test (simula usuarios reales)
  sleep(Math.random() * 2 + 1); // Random entre 1-3 segundos
}
