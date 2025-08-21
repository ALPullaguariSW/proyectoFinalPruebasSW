const request = require('supertest');
const express = require('express');
const adminRouter = require('./admin');

// Mock the middleware and controller
jest.mock('../middleware/auth', () => (req, res, next) => {
  req.user = { id: 1, rol: 'admin' };
  next();
});

jest.mock('../controllers/adminController', () => ({
  getStats: jest.fn((req, res) => res.json({ stats: 'mock stats' })),
  getProximasReservas: jest.fn((req, res) => res.json({ reservas: [] })),
  listarReservas: jest.fn((req, res) => res.json({ reservas: [] })),
  cancelarReservaAdmin: jest.fn((req, res) => res.json({ mensaje: 'Reserva cancelada' })),
  listarHabitaciones: jest.fn((req, res) => res.json({ habitaciones: [] })),
  crearHabitacion: jest.fn((req, res) => res.json({ mensaje: 'Habitación creada' })),
  editarHabitacion: jest.fn((req, res) => res.json({ mensaje: 'Habitación editada' })),
  eliminarHabitacion: jest.fn((req, res) => res.json({ mensaje: 'Habitación eliminada' })),
  disponibilidadHabitaciones: jest.fn((req, res) => res.json({ disponibilidad: [] }))
}));

const app = express();
app.use(express.json());
app.use('/admin', adminRouter);

describe('Admin Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /admin/dashboard/stats', () => {
    it('should call getStats controller', async () => {
      const response = await request(app)
        .get('/admin/dashboard/stats')
        .expect(200);

      expect(response.body).toEqual({ stats: 'mock stats' });
    });
  });

  describe('GET /admin/dashboard/proximas-reservas', () => {
    it('should call getProximasReservas controller', async () => {
      const response = await request(app)
        .get('/admin/dashboard/proximas-reservas')
        .expect(200);

      expect(response.body).toEqual({ reservas: [] });
    });
  });

  describe('GET /admin/reservas', () => {
    it('should call listarReservas controller', async () => {
      const response = await request(app)
        .get('/admin/reservas')
        .expect(200);

      expect(response.body).toEqual({ reservas: [] });
    });
  });

  describe('POST /admin/reservas/cancelar', () => {
    it('should call cancelarReservaAdmin controller', async () => {
      const response = await request(app)
        .post('/admin/reservas/cancelar')
        .send({ reserva_id: 1 })
        .expect(200);

      expect(response.body).toEqual({ mensaje: 'Reserva cancelada' });
    });
  });

  describe('GET /admin/habitaciones', () => {
    it('should call listarHabitaciones controller', async () => {
      const response = await request(app)
        .get('/admin/habitaciones')
        .expect(200);

      expect(response.body).toEqual({ habitaciones: [] });
    });
  });

  describe('POST /admin/habitaciones', () => {
    it('should call crearHabitacion controller', async () => {
      const response = await request(app)
        .post('/admin/habitaciones')
        .send({ numero: '101', tipo: 'Individual' })
        .expect(200);

      expect(response.body).toEqual({ mensaje: 'Habitación creada' });
    });
  });

  describe('PUT /admin/habitaciones/:id', () => {
    it('should call editarHabitacion controller', async () => {
      const response = await request(app)
        .put('/admin/habitaciones/1')
        .send({ numero: '101', tipo: 'Individual' })
        .expect(200);

      expect(response.body).toEqual({ mensaje: 'Habitación editada' });
    });
  });

  describe('DELETE /admin/habitaciones/:id', () => {
    it('should call eliminarHabitacion controller', async () => {
      const response = await request(app)
        .delete('/admin/habitaciones/1')
        .expect(200);

      expect(response.body).toEqual({ mensaje: 'Habitación eliminada' });
    });
  });

  describe('GET /admin/disponibilidad', () => {
    it('should call disponibilidadHabitaciones controller', async () => {
      const response = await request(app)
        .get('/admin/disponibilidad')
        .expect(200);

      expect(response.body).toEqual({ disponibilidad: [] });
    });
  });
});
