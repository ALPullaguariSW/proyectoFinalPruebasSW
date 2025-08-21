const adminController = require('./adminController');

// Mock de la base de datos
const mockPool = {
  query: jest.fn()
};

// Mock del módulo de base de datos
jest.mock('../config/db', () => ({
  query: jest.fn()
}));

// Importar después del mock
const db = require('../config/db');

describe('AdminController', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
  });

  describe('getStats', () => {
    it('should return statistics successfully', async () => {
      const mockStats = {
        usuarios: [{ total_usuarios: '5' }],
        reservas: [{ total_reservas: '10' }],
        habitaciones: [{ total_habitaciones: '8' }]
      };

      db.query
        .mockResolvedValueOnce({ rows: mockStats.usuarios })
        .mockResolvedValueOnce({ rows: mockStats.reservas })
        .mockResolvedValueOnce({ rows: mockStats.habitaciones });

      await adminController.getStats(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        total_usuarios: '5',
        total_reservas: '10',
        total_habitaciones: '8'
      });
    });

    it('should handle database error', async () => {
      db.query.mockRejectedValueOnce(new Error('DB Error'));

      await adminController.getStats(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        mensaje: 'Error al obtener estadísticas.'
      });
    });
  });

  describe('getProximasReservas', () => {
    it('should return upcoming reservations', async () => {
      const mockReservas = [{
        id: 1,
        fecha_inicio: '2024-01-15',
        usuario: 'Juan Pérez',
        habitacion: '101'
      }];

      db.query.mockResolvedValueOnce({ rows: mockReservas });

      await adminController.getProximasReservas(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({ reservas: mockReservas });
    });
  });

  describe('listarReservas', () => {
    it('should return all reservations', async () => {
      const mockReservas = [{
        id: 1,
        fecha_inicio: '2024-01-15',
        usuario: 'Juan Pérez',
        habitacion_tipo: 'Individual'
      }];

      db.query.mockResolvedValueOnce({ rows: mockReservas });

      await adminController.listarReservas(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({ reservas: mockReservas });
    });
  });

  describe('cancelarReservaAdmin', () => {
    it('should cancel reservation successfully', async () => {
      mockReq.body = { reserva_id: 1 };
      db.query.mockResolvedValueOnce({ rowCount: 1 });

      await adminController.cancelarReservaAdmin(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        mensaje: 'Reserva cancelada correctamente.'
      });
    });

    it('should return error when reservation not found', async () => {
      mockReq.body = { reserva_id: 999 };
      db.query.mockResolvedValueOnce({ rowCount: 0 });

      await adminController.cancelarReservaAdmin(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        mensaje: 'Reserva no encontrada.'
      });
    });

    it('should return error when reserva_id is missing', async () => {
      mockReq.body = {};

      await adminController.cancelarReservaAdmin(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        mensaje: 'Falta el ID de la reserva.'
      });
    });
  });

  describe('listarHabitaciones', () => {
    it('should return all rooms', async () => {
      const mockHabitaciones = [
        { id: 1, numero: '101', tipo: 'Individual' },
        { id: 2, numero: '102', tipo: 'Doble' }
      ];

      db.query.mockResolvedValueOnce({ rows: mockHabitaciones });

      await adminController.listarHabitaciones(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({ habitaciones: mockHabitaciones });
    });
  });

  describe('crearHabitacion', () => {
    it('should create room successfully', async () => {
      mockReq.body = {
        numero: '101',
        tipo: 'Individual',
        precio: 100
      };

      db.query.mockResolvedValueOnce();

      await adminController.crearHabitacion(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        mensaje: 'Habitación creada correctamente.'
      });
    });

    it('should return error when required fields are missing', async () => {
      mockReq.body = { numero: '101' };

      await adminController.crearHabitacion(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        mensaje: 'El número, tipo y precio son obligatorios.'
      });
    });
  });

  describe('editarHabitacion', () => {
    it('should update room successfully', async () => {
      mockReq.params = { id: 1 };
      mockReq.body = {
        numero: '101',
        tipo: 'Individual',
        precio: 120
      };

      db.query.mockResolvedValueOnce();

      await adminController.editarHabitacion(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        mensaje: 'Habitación actualizada correctamente.'
      });
    });
  });

  describe('eliminarHabitacion', () => {
    it('should delete room successfully', async () => {
      mockReq.params = { id: 1 };
      db.query.mockResolvedValueOnce({ rowCount: 1 });

      await adminController.eliminarHabitacion(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        mensaje: 'Habitación eliminada correctamente.'
      });
    });

    it('should return error when room not found', async () => {
      mockReq.params = { id: 999 };
      db.query.mockResolvedValueOnce({ rowCount: 0 });

      await adminController.eliminarHabitacion(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        mensaje: 'Habitación no encontrada.'
      });
    });
  });

  describe('disponibilidadHabitaciones', () => {
    it('should return available rooms', async () => {
      mockReq.query = {
        fecha_inicio: '2024-01-15',
        fecha_fin: '2024-01-17'
      };

      const mockHabitaciones = [
        { id: 1, numero: '101', tipo: 'Individual' }
      ];

      db.query.mockResolvedValueOnce({ rows: mockHabitaciones });

      await adminController.disponibilidadHabitaciones(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({ habitaciones: mockHabitaciones });
    });

    it('should return error for invalid dates', async () => {
      mockReq.query = {
        fecha_inicio: '2024-01-17',
        fecha_fin: '2024-01-15'
      };

      await adminController.disponibilidadHabitaciones(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        mensaje: 'Fechas inválidas.'
      });
    });
  });
});
