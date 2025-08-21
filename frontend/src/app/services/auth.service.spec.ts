import { TestBed } from '@angular/core/testing';
import { AuthService, Usuario } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
    // Limpiar localStorage antes de cada test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login user and store in localStorage', () => {
    const mockUser: Usuario = {
      id: '1',
      nombre: 'Test User',
      rol: 'usuario'
    };
    const mockToken = 'test-token';

    service.login(mockUser, mockToken);

    const storedUser = JSON.parse(localStorage.getItem('usuario') || '{}');
    const storedToken = localStorage.getItem('token');

    expect(storedUser).toEqual(mockUser);
    expect(storedToken).toBe(mockToken);
  });

  it('should login user without token', () => {
    const mockUser: Usuario = {
      id: '1',
      nombre: 'Test User',
      rol: 'usuario'
    };

    service.login(mockUser);

    const storedUser = JSON.parse(localStorage.getItem('usuario') || '{}');
    const storedToken = localStorage.getItem('token');

    expect(storedUser).toEqual(mockUser);
    expect(storedToken).toBeNull();
  });

  it('should logout user and clear localStorage', () => {
    // Primero hacer login
    const mockUser: Usuario = {
      id: '1',
      nombre: 'Test User',
      rol: 'usuario'
    };
    service.login(mockUser, 'test-token');

    // Luego hacer logout
    service.logout();

    expect(localStorage.getItem('usuario')).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('should get current user', () => {
    const mockUser: Usuario = {
      id: '1',
      nombre: 'Test User',
      rol: 'usuario'
    };

    service.login(mockUser);
    const currentUser = service.getUsuario();

    expect(currentUser).toEqual(mockUser);
  });

  it('should get stored token', () => {
    const mockToken = 'test-token';
    localStorage.setItem('token', mockToken);

    const token = service.getToken();

    expect(token).toBe(mockToken);
  });

  it('should return null for non-existent token', () => {
    const token = service.getToken();

    expect(token).toBeNull();
  });

  it('should load user from localStorage on initialization', () => {
    const mockUser: Usuario = {
      id: '1',
      nombre: 'Test User',
      rol: 'usuario'
    };
    localStorage.setItem('usuario', JSON.stringify(mockUser));

    // Crear nueva instancia del servicio
    const newService = TestBed.inject(AuthService);
    const currentUser = newService.getUsuario();

    expect(currentUser).toEqual(mockUser);
  });

  it('should emit user changes through observable', (done) => {
    const mockUser: Usuario = {
      id: '1',
      nombre: 'Test User',
      rol: 'usuario'
    };

    service.usuario$.subscribe(user => {
      if (user) {
        expect(user).toEqual(mockUser);
        done();
      }
    });

    service.login(mockUser);
  });

  it('should emit null on logout through observable', (done) => {
    const mockUser: Usuario = {
      id: '1',
      nombre: 'Test User',
      rol: 'usuario'
    };

    service.login(mockUser);

    service.usuario$.subscribe(user => {
      if (user === null) {
        done();
      }
    });

    service.logout();
  });
});
