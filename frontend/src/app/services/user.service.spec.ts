import { TestBed } from '@angular/core/testing';
import { UserService } from './user.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
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

  it('should get user profile', () => {
    const mockUser = { id: 1, nombre: 'Test User', email: 'test@test.com', role: 'user' };

    service.getUserProfile().subscribe(user => {
      expect(user).toEqual(mockUser);
    });

    const req = httpMock.expectOne('/api/usuarios/profile');
    expect(req.request.method).toBe('GET');
    req.flush(mockUser);
  });

  it('should update user profile', () => {
    const mockUser = { nombre: 'Updated User', email: 'updated@test.com' };
    const mockResponse = { message: 'Perfil actualizado exitosamente' };

    service.updateUserProfile(mockUser).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('/api/usuarios/profile');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(mockUser);
    req.flush(mockResponse);
  });

  it('should change password', () => {
    const passwordData = { currentPassword: 'oldpass', newPassword: 'newpass' };
    const mockResponse = { message: 'Contraseña cambiada exitosamente' };

    service.changePassword(passwordData).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('/api/usuarios/change-password');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(passwordData);
    req.flush(mockResponse);
  });

  it('should get all users (admin only)', () => {
    const mockUsers = [
      { id: 1, nombre: 'User 1', email: 'user1@test.com', role: 'user' },
      { id: 2, nombre: 'User 2', email: 'user2@test.com', role: 'admin' }
    ];

    service.getAllUsers().subscribe(users => {
      expect(users).toEqual(mockUsers);
    });

    const req = httpMock.expectOne('/api/admin/usuarios');
    expect(req.request.method).toBe('GET');
    req.flush(mockUsers);
  });

  it('should get user by ID (admin only)', () => {
    const mockUser = { id: 1, nombre: 'Test User', email: 'test@test.com', role: 'user' };

    service.getUserById(1).subscribe(user => {
      expect(user).toEqual(mockUser);
    });

    const req = httpMock.expectOne('/api/admin/usuarios/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockUser);
  });

  it('should update user (admin only)', () => {
    const mockUser = { id: 1, nombre: 'Updated User', email: 'updated@test.com', role: 'admin' };
    const mockResponse = { message: 'Usuario actualizado exitosamente' };

    service.updateUser(1, mockUser).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('/api/admin/usuarios/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(mockUser);
    req.flush(mockResponse);
  });

  it('should delete user (admin only)', () => {
    const mockResponse = { message: 'Usuario eliminado exitosamente' };

    service.deleteUser(1).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('/api/admin/usuarios/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(mockResponse);
  });

  it('should get user statistics (admin only)', () => {
    const mockStats = {
      totalUsuarios: 10,
      usuariosActivos: 8,
      usuariosInactivos: 2,
      nuevosUsuariosEsteMes: 3
    };

    service.getUserStatistics().subscribe(stats => {
      expect(stats).toEqual(mockStats);
    });

    const req = httpMock.expectOne('/api/admin/usuarios/estadisticas');
    expect(req.request.method).toBe('GET');
    req.flush(mockStats);
  });
});
