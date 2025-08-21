import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;
  // Para CI/CD y producción, usar Render
  const API_BASE_URL = 'https://proyectofinalpruebassw.onrender.com/api';

  beforeEach(() => {
    // Mockear que estamos en GitHub Pages para que use la URL de Render
    Object.defineProperty(window, 'location', {
      value: { hostname: 'alpullaguarisw.github.io' },
      writable: true
    });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService]
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('registrar', () => {
    it('should register user successfully', () => {
      const mockUserData = {
        nombre: 'Test User',
        correo: 'test@test.com',
        contraseña: 'password123',
        confirm_contraseña: 'password123'
      };

      const mockResponse = {
        mensaje: 'Usuario registrado exitosamente',
        claseMensaje: 'success'
      };

      service.registrar(mockUserData).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${API_BASE_URL}/registro`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockUserData);
      req.flush(mockResponse);
    });

    it('should handle registration error', () => {
      const mockUserData = {
        nombre: 'Test User',
        correo: 'test@test.com',
        contraseña: 'password123',
        confirm_contraseña: 'password123'
      };

      const mockError = {
        mensaje: 'El correo ya está registrado',
        claseMensaje: 'error'
      };

      service.registrar(mockUserData).subscribe({
        next: () => fail('should have failed with error'),
        error: (error) => {
          expect(error.error.mensaje).toBe('El correo ya está registrado');
        }
      });

      const req = httpMock.expectOne(`${API_BASE_URL}/registro`);
      req.flush(mockError, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('login', () => {
    it('should login user successfully', () => {
      const mockLoginData = {
        correo: 'test@test.com',
        contrasena: 'password123'
      };

      const mockResponse = {
        mensaje: 'Login exitoso',
        claseMensaje: 'success',
        usuario: {
          id: '1',
          correo: 'test@test.com',
          nombre: 'Test User',
          rol: 'usuario'
        },
        token: 'mock-token'
      };

      service.login(mockLoginData).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${API_BASE_URL}/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockLoginData);
      req.flush(mockResponse);
    });

    it('should handle invalid credentials error', () => {
      const mockLoginData = {
        correo: 'test@test.com',
        contrasena: 'wrongpassword'
      };

      const mockError = {
        mensaje: 'Credenciales inválidas',
        claseMensaje: 'error'
      };

      service.login(mockLoginData).subscribe({
        next: () => fail('should have failed with invalid credentials'),
        error: (error) => {
          expect(error.error.mensaje).toBe('Credenciales inválidas');
        }
      });

      const req = httpMock.expectOne(`${API_BASE_URL}/login`);
      req.flush(mockError, { status: 401, statusText: 'Unauthorized' });
    });
  });

  it('should have correct API base URL', () => {
    expect(service['apiUrl']).toBe(API_BASE_URL);
  });
});