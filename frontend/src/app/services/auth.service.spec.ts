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

  it('should handle localStorage with null usuario', () => {
    localStorage.setItem('usuario', 'null');
    
    const newService = new AuthService();
    const usuario = newService.getUsuario();
    
    expect(usuario).toBeNull();
  });

  it('should handle localStorage with undefined usuario', () => {
    localStorage.setItem('usuario', 'undefined');
    
    const newService = new AuthService();
    const usuario = newService.getUsuario();
    
    expect(usuario).toBeNull();
  });

  it('should handle localStorage with empty string usuario', () => {
    localStorage.setItem('usuario', '');
    
    const newService = new AuthService();
    const usuario = newService.getUsuario();
    
    expect(usuario).toBeNull();
  });

  it('should handle localStorage with valid string but invalid JSON', () => {
    localStorage.setItem('usuario', 'not-a-json-string');
    
    const newService = new AuthService();
    const usuario = newService.getUsuario();
    
    expect(usuario).toBeNull();
  });

  it('should handle localStorage with null usuario from getItem', () => {
    // Simular que localStorage.getItem devuelve null
    spyOn(localStorage, 'getItem').and.returnValue(null);
    
    const newService = new AuthService();
    const usuario = newService.getUsuario();
    
    expect(usuario).toBeNull();
  });

  it('should handle login with undefined token', () => {
    const mockUsuario: Usuario = {
      id: '1',
      nombre: 'Test User',
      rol: 'usuario'
    };

    service.login(mockUsuario, undefined);

    expect(localStorage.getItem('usuario')).toBe(JSON.stringify(mockUsuario));
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('should handle login with token', () => {
    const mockUsuario: Usuario = {
      id: '1',
      nombre: 'Test User',
      rol: 'usuario'
    };
    const mockToken = 'test-token-123';

    service.login(mockUsuario, mockToken);

    expect(localStorage.getItem('usuario')).toBe(JSON.stringify(mockUsuario));
    expect(localStorage.getItem('token')).toBe(mockToken);
  });

  it('should handle login without token', () => {
    const mockUsuario: Usuario = {
      id: '1',
      nombre: 'Test User',
      rol: 'usuario'
    };

    service.login(mockUsuario);

    expect(localStorage.getItem('usuario')).toBe(JSON.stringify(mockUsuario));
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('should handle multiple login calls', () => {
    const mockUsuario1: Usuario = {
      id: '1',
      nombre: 'User 1',
      rol: 'usuario'
    };
    const mockUsuario2: Usuario = {
      id: '2',
      nombre: 'User 2',
      rol: 'admin'
    };

    service.login(mockUsuario1);
    service.login(mockUsuario2);

    expect(localStorage.getItem('usuario')).toBe(JSON.stringify(mockUsuario2));
  });

  it('should handle logout after multiple logins', () => {
    const mockUsuario: Usuario = {
      id: '1',
      nombre: 'Test User',
      rol: 'usuario'
    };

    service.login(mockUsuario, 'token1');
    service.login(mockUsuario, 'token2');
    service.logout();

    expect(localStorage.getItem('usuario')).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });
});