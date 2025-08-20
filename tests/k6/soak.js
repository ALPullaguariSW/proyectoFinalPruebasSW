import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '5m', target: 40 },   // Ramp up to 40 users over 5 minutes
    { duration: '30m', target: 50 },  // Stay at 50 users for 30 minutes
    { duration: '5m', target: 60 },   // Ramp up to 60 users over 5 minutes
    { duration: '30m', target: 60 },  // Stay at 60 users for 30 minutes
    { duration: '5m', target: 0 },    // Ramp down to 0 users over 5 minutes
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.01'],   // Error rate must be less than 1%
    checks: ['rate>0.99'],            // 99% of checks must pass
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  const responses = http.batch([
    ['GET', `${BASE_URL}/api/usuarios`],
    ['GET', `${BASE_URL}/api/habitaciones`],
    ['GET', `${BASE_URL}/api/reservas`],
    ['GET', `${BASE_URL}/api/habitaciones/disponibles`],
  ]);

  responses.forEach((response) => {
    const success = check(response, {
      'status is 200': (r) => r.status === 200,
      'response time < 500ms': (r) => r.timings.duration < 500,
    });

    if (!success) {
      errorRate.add(1);
    }
  });

  sleep(2);
}
