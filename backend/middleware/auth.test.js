const auth = require('./auth');

// Mock de jwt
jest.mock('jsonwebtoken');

const jwt = require('jsonwebtoken');

describe('Auth Middleware', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      headers: {},
      body: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('verificarToken', () => {
    it('should call next() when valid token is provided', () => {
      mockReq.headers.authorization = 'Bearer valid_token';
      jwt.verify.mockReturnValueOnce({ id: 1, nombre: 'Juan' });

      auth(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.usuario).toEqual({ id: 1, nombre: 'Juan' });
    });

    it('should return 401 when no token is provided', () => {
      auth(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        mensaje: 'No autorizado. Token requerido.'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when token is invalid', () => {
      mockReq.headers.authorization = 'Bearer invalid_token';
      jwt.verify.mockImplementationOnce(() => {
        throw new Error('Invalid token');
      });

      auth(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        mensaje: 'Token inválido o expirado.'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
