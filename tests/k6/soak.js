import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '5m', target: 40 },
    { duration: '30m', target: 50 },
    { duration: '5m', target: 60 },
    { duration: '20m', target: 60 },
    { duration: '5m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
    checks: ['rate>0.99'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  const responses = http.batch([
    ['GET', `${BASE_URL}/api/ping-simple`],
    ['GET', `${BASE_URL}/api/tipos-habitacion`],
    ['GET', `${BASE_URL}/api/habitaciones-disponibles`],
    ['POST', `${BASE_URL}/api/echo-simple`, JSON.stringify({ test: 'data' })],
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
