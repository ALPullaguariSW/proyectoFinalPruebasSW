import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
	vus: Number(__ENV.VUS) || 20,
	duration: __ENV.DURATION || '45s',
	thresholds: {
		http_req_duration: ['p(95)<800'],
		http_req_failed: ['rate<0.05'],
	},
};

function formatDate(date) {
	return date.toISOString().split('T')[0];
}

export default function () {
	const baseUrl = __ENV.BASE_URL || 'http://localhost:3000';

	// Datos únicos por VU/iteración
	const email = `user_${__VU}_${__ITER}@test.com`;
	const password = 'p4ss!w';

	// Registro
	const regPayload = JSON.stringify({
		nombre: `Usuario ${__VU}`,
		correo: email,
		contrasena: password,
		confirm_contrasena: password,
	});
	let res = http.post(`${baseUrl}/api/registro`, regPayload, {
		headers: { 'Content-Type': 'application/json' },
	});
	check(res, {
		'registro ok o ya existe': (r) => r.status === 200 || r.status === 400,
	});

	// Login
	const loginPayload = JSON.stringify({ correo: email, contrasena: password });
	res = http.post(`${baseUrl}/api/login`, loginPayload, {
		headers: { 'Content-Type': 'application/json' },
	});
	check(res, {
		'login 200': (r) => r.status === 200,
		'login token': (r) => !!r.json('token'),
	});
	const token = res.json('token');
	const usuarioId = res.json('usuario.id');
	const authHeaders = { Authorization: `Bearer ${token}` };

	// Consultar habitaciones disponibles
	const today = new Date();
	const start = new Date(today.getTime() + 24 * 3600 * 1000);
	const end = new Date(today.getTime() + 48 * 3600 * 1000);
	const qs = `fecha_inicio=${formatDate(start)}&fecha_fin=${formatDate(end)}`;
	res = http.get(`${baseUrl}/api/habitaciones-disponibles?${qs}`, { headers: authHeaders });
	check(res, {
		'disponibles 200': (r) => r.status === 200,
	});

	const habitaciones = res.json('habitaciones') || [];
	if (habitaciones.length > 0) {
		const hab = habitaciones.find((h) => h.disponible);
		if (hab) {
			const reservarPayload = JSON.stringify({
				usuario_id: usuarioId,
				habitacion_id: hab.id,
				fecha_inicio: formatDate(start),
				fecha_fin: formatDate(end),
				accion: 'reservar',
			});
			const r2 = http.post(`${baseUrl}/api/reservar`, reservarPayload, {
				headers: { 'Content-Type': 'application/json', ...authHeaders },
			});
			check(r2, {
				'reservar 200/400 (conflicto)': (r) => r.status === 200 || r.status === 400,
			});
		}
	}

	const r3 = http.get(`${baseUrl}/api/mis-reservas/${usuarioId}`, { headers: authHeaders });
	check(r3, {
		'mis reservas 200': (r) => r.status === 200,
	});

	sleep(1);
}
