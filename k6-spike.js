import http from 'k6/http';
import { sleep } from 'k6';

const defaultStages = [
	{ duration: '10s', target: 10 },
	{ duration: '10s', target: 200 },
	{ duration: '20s', target: 200 },
	{ duration: '10s', target: 0 },
];

export const options = {
	stages: __ENV.STAGES ? JSON.parse(__ENV.STAGES) : defaultStages,
};

export default function () {
	const baseUrl = __ENV.BASE_URL || 'http://localhost:3000';
	http.get(`${baseUrl}/api/ping-simple`);
	sleep(0.5);
}
