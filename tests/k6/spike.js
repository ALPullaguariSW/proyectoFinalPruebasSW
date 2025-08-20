import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '10s', target: 0 },   // Start with 0 users
    { duration: '20s', target: 300 }, // Spike to 300 users in 20 seconds
    { duration: '2m', target: 300 },  // Stay at 300 users for 2 minutes
    { duration: '20s', target: 0 },   // Drop back to 0 users in 20 seconds
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
    ['POST', `${BASE_URL}/api/auth/login`, null, {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@test.com', password: 'password' })
    }],
  ]);

  responses.forEach((response) => {
    const success = check(response, {
      'status is 200 or 401': (r) => r.status === 200 || r.status === 401,
      'response time < 500ms': (r) => r.timings.duration < 500,
    });

    if (!success) {
      errorRate.add(1);
    }
  });

  sleep(1);
}
