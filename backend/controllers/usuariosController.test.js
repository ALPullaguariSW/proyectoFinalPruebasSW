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
    it('should register user successfully', async () => {
      mockReq.body = {
        nombre: 'Juan Pérez',
        correo: 'juan@test.com',
        contrasena: 'test123!',
        confirm_contrasena: 'test123!'
      };

      db.query.mockResolvedValueOnce({ rows: [] });
      bcrypt.hash.mockResolvedValueOnce('hashed_password');
      db.query.mockResolvedValueOnce();

      await usuariosController.registroUsuario(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        mensaje: '¡Registro exitoso! Ya puedes iniciar sesión.',
        claseMensaje: 'success'
      });
    });

    it('should return error for invalid email format', async () => {
      mockReq.body = {
        nombre: 'Juan',
        correo: 'invalid-email',
        contrasena: 'test123!',
        confirm_contrasena: 'test123!'
      };

      await usuariosController.registroUsuario(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        mensaje: 'El formato del correo electrónico no es válido.',
        claseMensaje: 'error'
      });
    });

    it('should return error for short password', async () => {
      mockReq.body = {
        nombre: 'Juan',
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

    it('should return error for missing special character', async () => {
      mockReq.body = {
        nombre: 'Juan',
        correo: 'juan@test.com',
        contrasena: 'test123',
        confirm_contrasena: 'test123'
      };

      await usuariosController.registroUsuario(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        mensaje: 'La contraseña debe contener al menos un carácter especial.',
        claseMensaje: 'error'
      });
    });

    it('should return error when passwords do not match', async () => {
      mockReq.body = {
        nombre: 'Juan',
        correo: 'juan@test.com',
        contrasena: 'test123!',
        confirm_contrasena: 'different123!'
      };

      await usuariosController.registroUsuario(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        mensaje: 'Las contraseñas no coinciden.',
        claseMensaje: 'error'
      });
    });

    it('should return error when email already exists', async () => {
      mockReq.body = {
        nombre: 'Juan',
        correo: 'juan@test.com',
        contrasena: 'test123!',
        confirm_contrasena: 'test123!'
      };

      db.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

      await usuariosController.registroUsuario(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        mensaje: 'El correo electrónico ya está registrado.',
        claseMensaje: 'error'
      });
    });
  });

  describe('loginUsuario', () => {
    it('should login user successfully', async () => {
      mockReq.body = {
        correo: 'juan@test.com',
        contrasena: 'test123!'
      };

      const mockUser = {
        id: 1,
        nombre: 'Juan Pérez',
        contrasena: 'hashed_password',
        rol: 'usuario'
      };

      db.query.mockResolvedValueOnce({ rows: [mockUser] });
      bcrypt.compare.mockResolvedValueOnce(true);
      jwt.sign.mockReturnValueOnce('mock_token');

      await usuariosController.loginUsuario(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        mensaje: 'Login exitoso',
        claseMensaje: 'success',
        usuario: {
          id: 1,
          nombre: 'Juan Pérez',
          rol: 'usuario'
        },
        token: 'mock_token'
      });
    });

    it('should return error for invalid credentials', async () => {
      mockReq.body = {
        correo: 'juan@test.com',
        contrasena: 'wrong_password'
      };

      const mockUser = {
        id: 1,
        nombre: 'Juan Pérez',
        contrasena: 'hashed_password',
        rol: 'usuario'
      };

      db.query.mockResolvedValueOnce({ rows: [mockUser] });
      bcrypt.compare.mockResolvedValueOnce(false);

      await usuariosController.loginUsuario(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        mensaje: 'Correo o contraseña incorrecta.',
        claseMensaje: 'error'
      });
    });

    it('should return error when user not found', async () => {
      mockReq.body = {
        correo: 'nonexistent@test.com',
        contrasena: 'test123!'
      };

      db.query.mockResolvedValueOnce({ rows: [] });

      await usuariosController.loginUsuario(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        mensaje: 'Correo o contraseña incorrecta.',
        claseMensaje: 'error'
      });
    });
  });

  describe('reservarHabitacion', () => {
    it('should consult available rooms successfully', async () => {
      mockReq.body = {
        usuario_id: 1,
        fecha_inicio: '2024-01-15',
        fecha_fin: '2024-01-17',
        accion: 'consultar'
      };

      const mockHabitaciones = [
        { id: 1, tipo: 'Individual', numero: '101', disponible: true }
      ];

      db.query.mockResolvedValueOnce({ rows: mockHabitaciones });

      await usuariosController.reservarHabitacion(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({ habitaciones: mockHabitaciones });
    });

    it('should make reservation successfully', async () => {
      mockReq.body = {
        usuario_id: 1,
        fecha_inicio: '2024-01-15',
        fecha_fin: '2024-01-17',
        habitacion_id: 1,
        accion: 'reservar'
      };

      db.query.mockResolvedValueOnce({ rows: [] });
      db.query.mockResolvedValueOnce();

      await usuariosController.reservarHabitacion(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        mensaje: '¡Reserva registrada con éxito!',
        claseMensaje: 'success'
      });
    });

    it('should return error for invalid dates', async () => {
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

    it('should return error when room is already booked', async () => {
      mockReq.body = {
        usuario_id: 1,
        fecha_inicio: '2024-01-15',
        fecha_fin: '2024-01-17',
        habitacion_id: 1,
        accion: 'reservar'
      };

      db.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

      await usuariosController.reservarHabitacion(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        mensaje: 'La habitación seleccionada ya está reservada para esas fechas.',
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

      db.query.mockResolvedValueOnce({ rowCount: 1 });

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

      db.query.mockResolvedValueOnce({ rowCount: 0 });

      await usuariosController.cancelarReserva(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        mensaje: 'Reserva no encontrada o no pertenece al usuario.',
        claseMensaje: 'error'
      });
    });
  });

  describe('misReservas', () => {
    it('should return user reservations', async () => {
      mockReq.params = { usuario_id: 1 };

      const mockReservas = [
        {
          id: 1,
          fecha_inicio: '2024-01-15',
          habitacion_tipo: 'Individual',
          habitacion_numero: '101'
        }
      ];

      db.query.mockResolvedValueOnce({ rows: mockReservas });

      await usuariosController.misReservas(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({ reservas: mockReservas });
    });
  });

  describe('obtenerTiposHabitacion', () => {
    it('should return room types', async () => {
      const mockTipos = [
        { tipo: 'Individual' },
        { tipo: 'Doble' }
      ];

      db.query.mockResolvedValueOnce({ rows: mockTipos });

      await usuariosController.obtenerTiposHabitacion(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(['Individual', 'Doble']);
    });
  });

  describe('obtenerHabitacionesDisponibles', () => {
    it('should return available rooms', async () => {
      mockReq.query = {
        fecha_inicio: '2024-01-15',
        fecha_fin: '2024-01-17'
      };

      const mockHabitaciones = [
        { id: 1, tipo: 'Individual', numero: '101', disponible: true }
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
  });
});
