import { TestBed } from '@angular/core/testing';
import { AuthService, Usuario } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with null user', (done) => {
    service.usuario$.subscribe(usuario => {
      expect(usuario).toBeNull();
      done();
    });
  });

  it('should login user with token', (done) => {
    const mockUsuario: Usuario = {
      id: '1',
      nombre: 'Test User',
      rol: 'usuario'
    };
    const mockToken = 'test-token';

    service.login(mockUsuario, mockToken);

    service.usuario$.subscribe(usuario => {
      expect(usuario).toEqual(mockUsuario);
      expect(localStorage.getItem('usuario')).toBe(JSON.stringify(mockUsuario));
      expect(localStorage.getItem('token')).toBe(mockToken);
      done();
    });
  });

  it('should login user without token', (done) => {
    const mockUsuario: Usuario = {
      id: '1',
      nombre: 'Test User',
      rol: 'usuario'
    };

    service.login(mockUsuario);

    service.usuario$.subscribe(usuario => {
      expect(usuario).toEqual(mockUsuario);
      expect(localStorage.getItem('usuario')).toBe(JSON.stringify(mockUsuario));
      expect(localStorage.getItem('token')).toBeNull();
      done();
    });
  });

  it('should logout user', (done) => {
    const mockUsuario: Usuario = {
      id: '1',
      nombre: 'Test User',
      rol: 'usuario'
    };
    
    service.login(mockUsuario, 'test-token');
    service.logout();

    service.usuario$.subscribe(usuario => {
      expect(usuario).toBeNull();
      expect(localStorage.getItem('usuario')).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
      done();
    });
  });

  it('should get current usuario', () => {
    const mockUsuario: Usuario = {
      id: '1',
      nombre: 'Test User',
      rol: 'usuario'
    };

    service.login(mockUsuario);
    const currentUsuario = service.getUsuario();
    
    expect(currentUsuario).toEqual(mockUsuario);
  });

  it('should get current token', () => {
    localStorage.setItem('token', 'test-token');
    const currentToken = service.getToken();
    expect(currentToken).toBe('test-token');
  });

  it('should return null when no token exists', () => {
    const currentToken = service.getToken();
    expect(currentToken).toBeNull();
  });

  it('should return null when no user is logged in', () => {
    const currentUsuario = service.getUsuario();
    expect(currentUsuario).toBeNull();
  });

  it('should load user from localStorage on initialization', () => {
    const mockUsuario: Usuario = {
      id: '1',
      nombre: 'Test User',
      rol: 'usuario'
    };
    localStorage.setItem('usuario', JSON.stringify(mockUsuario));
    
    const newService = new AuthService();
    const loadedUsuario = newService.getUsuario();
    
    expect(loadedUsuario).toEqual(mockUsuario);
  });

  it('should handle malformed localStorage data gracefully', () => {
    localStorage.setItem('usuario', 'invalid-json');
    
    expect(() => {
      new AuthService();
    }).not.toThrow();
  });

  it('should handle empty localStorage', () => {
    localStorage.clear();
    
    const newService = new AuthService();
    const usuario = newService.getUsuario();
    
    expect(usuario).toBeNull();
  });
});