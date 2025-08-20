import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
	vus: Number(__ENV.VUS) || 50,
	duration: __ENV.DURATION || '30s',
	thresholds: {
		http_req_duration: ['p(95)<500'],
		http_req_failed: ['rate<0.01'],
	},
};

export default function () {
	const baseUrl = __ENV.BASE_URL || 'http://localhost:3000';

	const resGet = http.get(`${baseUrl}/api/ping-simple`);
	check(resGet, {
		'GET status is 200': (r) => r.status === 200,
		'GET has delayMs': (r) => !!r.json('delayMs'),
	});

	const payload = JSON.stringify({ hola: 'mundo', t: Date.now() });
	const headers = { 'Content-Type': 'application/json' };
	const resPost = http.post(`${baseUrl}/api/echo-simple`, payload, { headers });
	check(resPost, {
		'POST status is 200': (r) => r.status === 200,
		'POST echoes payload': (r) => r.json('recibido.hola') === 'mundo',
	});

	sleep(1);
}
