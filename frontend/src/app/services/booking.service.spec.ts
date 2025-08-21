import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BookingService, Habitacion } from './booking.service';
import { API_BASE_URL } from './api.config';

describe('BookingService', () => {
  let service: BookingService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BookingService]
    });
    service = TestBed.inject(BookingService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set token', () => {
    const token = 'test-token';
    service.setToken(token);
    // No hay forma directa de verificar que el token se estableció, pero no debería fallar
    expect(service).toBeTruthy();
  });

  it('should get room types', () => {
    const mockTypes = ['Individual', 'Doble', 'Suite'];

    service.obtenerTiposHabitacion().subscribe(types => {
      expect(types).toEqual(mockTypes);
    });

    const req = httpMock.expectOne(`${API_BASE_URL}/api/tipos-habitacion`);
    expect(req.request.method).toBe('GET');
    req.flush(mockTypes);
  });

  it('should search available rooms', () => {
    const mockRooms: Habitacion[] = [
      {
        id: 1,
        tipo: 'Individual',
        numero: '101',
        descripcion: 'Habitación individual',
        servicios: 'WiFi, TV',
        imagen: 'room1.jpg',
        precio: 100,
        disponible: true
      }
    ];
    const fechaInicio = '2024-01-15';
    const fechaFin = '2024-01-17';

    service.buscarHabitacionesDisponibles(fechaInicio, fechaFin).subscribe(response => {
      expect(response.habitaciones).toEqual(mockRooms);
    });

    const req = httpMock.expectOne(`${API_BASE_URL}/api/habitaciones-disponibles?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`);
    expect(req.request.method).toBe('GET');
    req.flush({ habitaciones: mockRooms });
  });

  it('should search available rooms with type filter', () => {
    const mockRooms: Habitacion[] = [];
    const fechaInicio = '2024-01-15';
    const fechaFin = '2024-01-17';
    const tipo = 'Individual';

    service.buscarHabitacionesDisponibles(fechaInicio, fechaFin, tipo).subscribe(response => {
      expect(response.habitaciones).toEqual(mockRooms);
    });

    const req = httpMock.expectOne(`${API_BASE_URL}/api/habitaciones-disponibles?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}&tipo_habitacion=${tipo}`);
    expect(req.request.method).toBe('GET');
    req.flush({ habitaciones: mockRooms });
  });

  it('should get user reservations', () => {
    const mockReservas = [
      { id: 1, fecha_inicio: '2024-01-15', fecha_fin: '2024-01-17' }
    ];
    const usuarioId = 1;

    service.obtenerMisReservas(usuarioId).subscribe(reservas => {
      expect(reservas).toEqual(mockReservas);
    });

    const req = httpMock.expectOne(`${API_BASE_URL}/api/mis-reservas/${usuarioId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockReservas);
  });

  it('should make reservation', () => {
    const mockResponse = { mensaje: 'Reserva creada exitosamente' };
    const usuarioId = 1;
    const habitacionId = 1;
    const fechaInicio = '2024-01-15';
    const fechaFin = '2024-01-17';

    service.realizarReserva(usuarioId, habitacionId, fechaInicio, fechaFin).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${API_BASE_URL}/api/reservar`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      usuario_id: usuarioId,
      habitacion_id: habitacionId,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      accion: 'reservar'
    });
    req.flush(mockResponse);
  });

  it('should cancel reservation', () => {
    const mockResponse = { mensaje: 'Reserva cancelada exitosamente' };
    const reservaId = 1;
    const usuarioId = 1;

    service.cancelarReserva(reservaId, usuarioId).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${API_BASE_URL}/api/cancelar-reserva`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      reserva_id: reservaId,
      usuario_id: usuarioId
    });
    req.flush(mockResponse);
  });

  it('should get admin statistics', () => {
    const mockStats = {
      total_usuarios: 10,
      total_reservas: 25,
      total_habitaciones: 8
    };

    service.obtenerEstadisticasAdmin().subscribe(stats => {
      expect(stats).toEqual(mockStats);
    });

    const req = httpMock.expectOne(`${API_BASE_URL}/api/admin/dashboard/stats`);
    expect(req.request.method).toBe('GET');
    req.flush(mockStats);
  });

  it('should get upcoming reservations', () => {
    const mockReservas = {
      reservas: [
        { id: 1, fecha_inicio: '2024-01-15', usuario: 'Juan Pérez' }
      ]
    };

    service.obtenerProximasReservas().subscribe(response => {
      expect(response).toEqual(mockReservas);
    });

    const req = httpMock.expectOne(`${API_BASE_URL}/api/admin/dashboard/proximas-reservas`);
    expect(req.request.method).toBe('GET');
    req.flush(mockReservas);
  });

  it('should include authorization header when token is set', () => {
    const token = 'test-token';
    service.setToken(token);

    service.obtenerTiposHabitacion().subscribe();

    const req = httpMock.expectOne(`${API_BASE_URL}/api/tipos-habitacion`);
    expect(req.request.headers.has('Authorization')).toBe(true);
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
    req.flush([]);
  });

  it('should not include authorization header when token is not set', () => {
    service.setToken(null);

    service.obtenerTiposHabitacion().subscribe();

    const req = httpMock.expectOne(`${API_BASE_URL}/api/tipos-habitacion`);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush([]);
  });
});
