const request = require('supertest');
const express = require('express');
const usuariosRoutes = require('./usuarios');

// Mock del middleware de autenticación
jest.mock('../middleware/auth', () => jest.fn((req, res, next) => {
  req.usuario = { id: 1, email: 'user@test.com' };
  next();
}));

// Mock de los controladores
jest.mock('../controllers/usuariosController', () => ({
  registroUsuario: jest.fn((req, res) => res.json({ success: true })),
  loginUsuario: jest.fn((req, res) => res.json({ success: true, token: 'test-token' })),
  reservarHabitacion: jest.fn((req, res) => res.json({ success: true })),
  cancelarReserva: jest.fn((req, res) => res.json({ success: true })),
  misReservas: jest.fn((req, res) => res.json({ success: true, data: [] })),
  obtenerTiposHabitacion: jest.fn((req, res) => res.json({ success: true, data: [] })),
  obtenerHabitacionesDisponibles: jest.fn((req, res) => res.json({ success: true, data: [] }))
}));

const app = express();
app.use(express.json());
app.use('/usuarios', usuariosRoutes);

describe('Usuarios Routes', () => {
  test('POST /usuarios/registro should work', async () => {
    const response = await request(app)
      .post('/usuarios/registro')
      .send({
        nombre: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  test('POST /usuarios/login should work', async () => {
    const response = await request(app)
      .post('/usuarios/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  test('POST /usuarios/reservar should work', async () => {
    const response = await request(app)
      .post('/usuarios/reservar')
      .send({
        habitacion_id: 1,
        fecha_inicio: '2024-01-01',
        fecha_fin: '2024-01-02'
      });
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  test('POST /usuarios/cancelar-reserva should work', async () => {
    const response = await request(app)
      .post('/usuarios/cancelar-reserva')
      .send({ reserva_id: 1 });
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  test('GET /usuarios/mis-reservas/:usuario_id should work', async () => {
    const response = await request(app).get('/usuarios/mis-reservas/1');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  test('GET /usuarios/tipos-habitacion should work', async () => {
    const response = await request(app).get('/usuarios/tipos-habitacion');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  test('GET /usuarios/habitaciones-disponibles should work', async () => {
    const response = await request(app)
      .get('/usuarios/habitaciones-disponibles')
      .query({
        fecha_inicio: '2024-01-01',
        fecha_fin: '2024-01-02'
      });
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
