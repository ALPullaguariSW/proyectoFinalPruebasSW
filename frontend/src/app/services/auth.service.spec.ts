import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login successfully', () => {
    const mockUser = { email: 'test@test.com', password: 'password' };
    const mockResponse = { token: 'fake-token', user: { id: 1, email: 'test@test.com' } };

    service.login(mockUser.email, mockUser.password).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockUser);
    req.flush(mockResponse);
  });

  it('should register successfully', () => {
    const mockUser = { email: 'test@test.com', password: 'password', nombre: 'Test User' };
    const mockResponse = { message: 'Usuario registrado exitosamente' };

    service.register(mockUser).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('/api/auth/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockUser);
    req.flush(mockResponse);
  });

  it('should logout and clear token', () => {
    spyOn(localStorage, 'removeItem');
    service.logout();
    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
  });

  it('should check if user is logged in', () => {
    spyOn(localStorage, 'getItem').and.returnValue('fake-token');
    expect(service.isLoggedIn()).toBe(true);
  });

  it('should return false when user is not logged in', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    expect(service.isLoggedIn()).toBe(false);
  });

  it('should get token from localStorage', () => {
    spyOn(localStorage, 'getItem').and.returnValue('fake-token');
    expect(service.getToken()).toBe('fake-token');
  });
});
