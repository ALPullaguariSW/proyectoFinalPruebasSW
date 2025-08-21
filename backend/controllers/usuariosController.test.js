const usuariosController = require('./usuariosController');

// Mock de bcrypt y jwt
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

// Mock del módulo de base de datos
jest.mock('../config/db', () => ({
  query: jest.fn()
}));

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

describe('UsuariosController', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
  });

  describe('registroUsuario', () => {
    it('should register a new user successfully', async () => {
      mockReq.body = {
        nombre: 'Juan Pérez',
        correo: 'juan@test.com',
        contrasena: 'Test123!',
        confirm_contrasena: 'Test123!'
      };

      db.query.mockResolvedValueOnce({ rows: [] }); // No existe el correo
      db.query.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // Usuario creado

      await usuariosController.registroUsuario(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        mensaje: '¡Registro exitoso! Ya puedes iniciar sesión.',
        claseMensaje: 'success'
      });
    });

    it('should handle database error in registroUsuario', async () => {
      mockReq.body = {
        nombre: 'Juan Pérez',
        correo: 'juan@test.com',
        contrasena: 'Test123!',
        confirm_contrasena: 'Test123!'
      };

      db.query.mockResolvedValueOnce({ rows: [] }); // No existe el correo
      db.query.mockRejectedValueOnce(new Error('Database error')); // Error al crear

      await usuariosController.registroUsuario(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        mensaje: 'Error del sistema. Intente más tarde.',
        claseMensaje: 'error'
      });
    });

    it('should handle validation error in registroUsuario', async () => {
      mockReq.body = {
        nombre: 'Juan Pérez',
        correo: 'juan@test.com',
        contrasena: 'Test123!',
        confirm_contrasena: 'Different123!' // Contraseñas diferentes
      };

      await usuariosController.registroUsuario(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        mensaje: 'Las contraseñas no coinciden.',
        claseMensaje: 'error'
      });
    });

    it('should handle validation error for missing fields', async () => {
      mockReq.body = {
        nombre: 'Juan Pérez',
        correo: 'juan@test.com'
        // Faltan contrasena y confirm_contrasena
      };

      await usuariosController.registroUsuario(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        mensaje: 'Todos los campos son obligatorios.',
        claseMensaje: 'error'
      });
    });

    it('should handle validation error for invalid email format', async () => {
      mockReq.body = {
        nombre: 'Juan Pérez',
        correo: 'invalid-email',
        contrasena: 'Test123!',
        confirm_contrasena: 'Test123!'
      };

      await usuariosController.registroUsuario(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        mensaje: 'El formato del correo electrónico no es válido.',
        claseMensaje: 'error'
      });
    });

    it('should handle validation error for short password', async () => {
      mockReq.body = {
        nombre: 'Juan Pérez',
        correo: 'juan@test.com',
        contrasena: '123',
        confirm_contrasena: '123'
      };

      await usuariosController.registroUsuario(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        mensaje: 'La contraseña debe tener al menos 5 caracteres.',
        claseMensaje: 'error'
      });
    });

    it('should handle validation error for password without lowercase', async () => {
      mockReq.body = {
        nombre: 'Juan Pérez',
        correo: 'juan@test.com',
        contrasena: 'TEST123!',
        confirm_contrasena: 'TEST123!'
      };

      await usuariosController.registroUsuario(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        mensaje: 'La contraseña debe contener al menos una letra minúscula.',
        claseMensaje: 'error'
      });
    });

    it('should handle validation error for password without special char', async () => {
      mockReq.body = {
        nombre: 'Juan Pérez',
        correo: 'juan@test.com',
        contrasena: 'Test123',
        confirm_contrasena: 'Test123'
      };

      await usuariosController.registroUsuario(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        mensaje: 'La contraseña debe contener al menos un carácter especial.',
        claseMensaje: 'error'
      });
    });

    it('should handle validation error for existing email', async () => {
      mockReq.body = {
        nombre: 'Juan Pérez',
        correo: 'juan@test.com',
        contrasena: 'Test123!',
        confirm_contrasena: 'Test123!'
      };

      db.query.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // Correo ya existe

      await usuariosController.registroUsuario(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        mensaje: 'El correo electrónico ya está registrado.',
        claseMensaje: 'error'
      });
    });
  });

  describe('loginUsuario', () => {
    it('should handle database error in loginUsuario', async () => {
      mockReq.body = {
        correo: 'test@test.com',
        contrasena: 'Test123!'
      };

      db.query.mockRejectedValueOnce(new Error('Database error')); // Error de BD

      await usuariosController.loginUsuario(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        mensaje: 'Error del sistema. Intente más tarde.',
        claseMensaje: 'error'
      });
    });

    it('should handle missing fields in loginUsuario', async () => {
      const mockData = {
        correo: 'test@test.com'
        // Missing contrasena
      };

      mockReq.body = mockData;

      await usuariosController.loginUsuario(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        mensaje: 'Por favor, complete todos los campos.',
        claseMensaje: 'error'
      });
    });
  });

  describe('reservarHabitacion', () => {
    it('should handle missing dates in reservarHabitacion', async () => {
      mockReq.body = {
        usuario_id: 1,
        accion: 'consultar'
        // Faltan fecha_inicio y fecha_fin
      };

      await usuariosController.reservarHabitacion(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        mensaje: 'Las fechas de entrada y salida son requeridas.',
        claseMensaje: 'error'
      });
    });

    it('should handle invalid dates in reservarHabitacion', async () => {
      mockReq.body = {
        usuario_id: 1,
        fecha_inicio: '2024-01-17',
        fecha_fin: '2024-01-15',
        accion: 'consultar'
      };

      await usuariosController.reservarHabitacion(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        mensaje: 'La fecha de salida debe ser posterior a la fecha de entrada.',
        claseMensaje: 'error'
      });
    });

    it('should handle missing habitacion_id in reservarHabitacion', async () => {
      mockReq.body = {
        usuario_id: 1,
        fecha_inicio: '2024-01-15',
        fecha_fin: '2024-01-17',
        accion: 'reservar'
        // Falta habitacion_id
      };

      await usuariosController.reservarHabitacion(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        mensaje: 'Debes seleccionar una habitación disponible para reservar.',
        claseMensaje: 'error'
      });
    });

    it('should handle invalid action in reservarHabitacion', async () => {
      mockReq.body = {
        usuario_id: 1,
        fecha_inicio: '2024-01-15',
        fecha_fin: '2024-01-17',
        accion: 'invalid_action'
      };

      await usuariosController.reservarHabitacion(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        mensaje: 'Acción no válida.',
        claseMensaje: 'error'
      });
    });

    it('should handle database error in reservarHabitacion consultar', async () => {
      mockReq.body = {
        fecha_inicio: '2024-01-15',
        fecha_fin: '2024-01-17',
        accion: 'consultar'
      };

      db.query.mockRejectedValueOnce(new Error('Database error')); // Error de BD

      await usuariosController.reservarHabitacion(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        mensaje: 'Error al buscar habitaciones. Intente más tarde.',
        claseMensaje: 'error'
      });
    });

    it('should handle database error in reservarHabitacion reservar', async () => {
      const mockData = {
        usuario_id: 1,
        fecha_inicio: '2024-01-15',
        fecha_fin: '2024-01-17',
        habitacion_id: 1,
        accion: 'reservar'
      };

      mockReq.body = mockData;
      db.query.mockResolvedValueOnce({ rows: [] }); // No conflicts
      db.query.mockRejectedValueOnce(new Error('Database error')); // Insert fails

      await usuariosController.reservarHabitacion(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        mensaje: 'Error al registrar la reserva. Por favor, inténtelo de nuevo.',
        claseMensaje: 'error'
      });
    });
  });

  describe('cancelarReserva', () => {
    it('should cancel reservation successfully', async () => {
      mockReq.body = {
        reserva_id: 1,
        usuario_id: 1
      };

      db.query.mockResolvedValueOnce({ rowCount: 1 }); // Reserva encontrada y eliminada

      await usuariosController.cancelarReserva(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        mensaje: 'Reserva cancelada exitosamente.',
        claseMensaje: 'success'
      });
    });

    it('should return error when reservation not found', async () => {
      mockReq.body = {
        reserva_id: 999,
        usuario_id: 1
      };

      db.query.mockResolvedValueOnce({ rowCount: 0 }); // Reserva no encontrada

      await usuariosController.cancelarReserva(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        mensaje: 'Reserva no encontrada o no pertenece al usuario.',
        claseMensaje: 'error'
      });
    });

    it('should handle database error in cancelarReserva', async () => {
      mockReq.body = {
        reserva_id: 1,
        usuario_id: 1
      };

      db.query.mockRejectedValueOnce(new Error('Database error')); // Error de BD

      await usuariosController.cancelarReserva(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        mensaje: 'Error al cancelar la reserva. Intente más tarde.',
        claseMensaje: 'error'
      });
    });

    it('should return error when missing data in cancelarReserva', async () => {
      mockReq.body = {
        reserva_id: 1
        // Falta usuario_id
      };

      await usuariosController.cancelarReserva(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        mensaje: 'Faltan datos para cancelar la reserva.',
        claseMensaje: 'error'
      });
    });

    it('should return error when missing reserva_id in cancelarReserva', async () => {
      mockReq.body = {
        usuario_id: 1
        // Falta reserva_id
      };

      await usuariosController.cancelarReserva(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        mensaje: 'Faltan datos para cancelar la reserva.',
        claseMensaje: 'error'
      });
    });
  });

  describe('misReservas', () => {
    it('should return user reservations', async () => {
      mockReq.params = { usuario_id: '1' };

      const mockReservas = [
        {
          id: 1,
          fecha_inicio: '2024-01-15',
          fecha_fin: '2024-01-17',
          habitacion_tipo: 'Individual',
          habitacion_numero: '101',
          habitacion_precio: 50.00
        }
      ];

      db.query.mockResolvedValueOnce({ rows: mockReservas });

      await usuariosController.misReservas(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({ reservas: mockReservas });
    });

    it('should return error when usuario_id is missing', async () => {
      mockReq.params = {};

      await usuariosController.misReservas(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        mensaje: 'Falta el ID de usuario.',
        claseMensaje: 'error'
      });
    });

    it('should handle database error in misReservas', async () => {
      mockReq.params = { usuario_id: '1' };

      db.query.mockRejectedValueOnce(new Error('Database error')); // Error de BD

      await usuariosController.misReservas(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        mensaje: 'Error al obtener las reservas. Intente más tarde.',
        claseMensaje: 'error'
      });
    });
  });

  describe('obtenerTiposHabitacion', () => {
    it('should return room types', async () => {
      const mockTipos = [
        { id: 1, nombre: 'Individual', descripcion: 'Habitación individual', precio: 50.00, capacidad: 2 },
        { id: 2, nombre: 'Doble', descripcion: 'Habitación doble', precio: 75.00, capacidad: 2 }
      ];

      db.query.mockResolvedValueOnce({ rows: mockTipos });

      await usuariosController.obtenerTiposHabitacion(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(mockTipos);
    });

    it('should handle database error in obtenerTiposHabitacion', async () => {
      db.query.mockRejectedValueOnce(new Error('Database error'));

      await usuariosController.obtenerTiposHabitacion(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        mensaje: 'Error al obtener tipos de habitación.'
      });
    });
  });

  describe('obtenerHabitacionesDisponibles', () => {
    it('should return available rooms', async () => {
      mockReq.query = {
        fecha_inicio: '2024-01-15',
        fecha_fin: '2024-01-17'
      };

      const mockHabitaciones = [
        { 
          id: 1, 
          numero: '101', 
          estado: 'disponible',
          tipo: 'Individual', 
          descripcion: 'Habitación individual',
          precio: 50.00,
          capacidad: 2,
          disponible: true 
        }
      ];

      db.query.mockResolvedValueOnce({ rows: mockHabitaciones });

      await usuariosController.obtenerHabitacionesDisponibles(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({ habitaciones: mockHabitaciones });
    });

    it('should return error for missing dates', async () => {
      mockReq.query = {
        fecha_fin: '2024-01-17'
      };

      await usuariosController.obtenerHabitacionesDisponibles(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        mensaje: 'Las fechas de entrada y salida son requeridas.',
        claseMensaje: 'error'
      });
    });

    it('should return error for invalid dates', async () => {
      mockReq.query = {
        fecha_inicio: '2024-01-17',
        fecha_fin: '2024-01-15'
      };

      await usuariosController.obtenerHabitacionesDisponibles(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        mensaje: 'La fecha de salida debe ser posterior a la fecha de entrada.',
        claseMensaje: 'error'
      });
    });

    it('should handle database error in obtenerHabitacionesDisponibles', async () => {
      mockReq.query = {
        fecha_inicio: '2024-01-15',
        fecha_fin: '2024-01-17'
      };

      db.query.mockRejectedValueOnce(new Error('Database error'));

      await usuariosController.obtenerHabitacionesDisponibles(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        mensaje: 'Error al buscar habitaciones. Intente más tarde.',
        claseMensaje: 'error'
      });
    });
  });
});
