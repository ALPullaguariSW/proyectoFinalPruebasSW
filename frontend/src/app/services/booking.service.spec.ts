import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BookingService } from './booking.service';

describe('BookingService', () => {
  let service: BookingService;
  let httpMock: HttpTestingController;
  // Para CI/CD y producción, usar Render
  const API_BASE_URL = 'https://proyectofinalpruebassw.onrender.com';

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

  describe('setToken', () => {
    it('should set token', () => {
      const token = 'test-token';
      service.setToken(token);
      // Test passes if no error is thrown
      expect(true).toBe(true);
    });
  });

  describe('obtenerTiposHabitacion', () => {
    it('should get room types successfully', () => {
      const mockTypes = ['Simple', 'Doble', 'Suite'];

      service.obtenerTiposHabitacion().subscribe(types => {
        expect(types).toEqual(mockTypes);
      });

      const req = httpMock.expectOne(`${API_BASE_URL}/api/tipos-habitacion`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTypes);
    });

    it('should handle error when getting room types', () => {
      const mockError = {
        mensaje: 'Error al obtener tipos',
        claseMensaje: 'error'
      };

      service.obtenerTiposHabitacion().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.error.mensaje).toBe('Error al obtener tipos');
        }
      });

      const req = httpMock.expectOne(`${API_BASE_URL}/api/tipos-habitacion`);
      req.flush(mockError, { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('buscarHabitacionesDisponibles', () => {
    it('should search available rooms successfully', () => {
      const searchParams = {
        fecha_inicio: '2024-01-01',
        fecha_fin: '2024-01-02',
        tipo_habitacion: 'Simple'
      };
      const mockResponse = {
        habitaciones: [
          { id: 1, numero: '101', tipo: 'Simple', precio: 100, descripcion: '', servicios: '', imagen: '', disponible: true },
          { id: 2, numero: '102', tipo: 'Simple', precio: 100, descripcion: '', servicios: '', imagen: '', disponible: true }
        ]
      };

      service.buscarHabitacionesDisponibles(
        searchParams.fecha_inicio,
        searchParams.fecha_fin,
        searchParams.tipo_habitacion
      ).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(req => 
        req.url === `${API_BASE_URL}/api/habitaciones-disponibles` &&
        req.method === 'GET'
      );
      expect(req.request.params.get('fecha_inicio')).toBe(searchParams.fecha_inicio);
      expect(req.request.params.get('fecha_fin')).toBe(searchParams.fecha_fin);
      expect(req.request.params.get('tipo_habitacion')).toBe(searchParams.tipo_habitacion);
      req.flush(mockResponse);
    });
  });

  describe('realizarReserva', () => {
    it('should make reservation successfully', () => {
      const usuarioId = 1;
      const habitacionId = 1;
      const fechaInicio = '2024-01-01';
      const fechaFin = '2024-01-02';
      const mockResponse = {
        mensaje: 'Reserva realizada exitosamente',
        claseMensaje: 'success'
      };

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
  });

  describe('obtenerMisReservas', () => {
    it('should get user reservations successfully', () => {
      const userId = 1;
      const mockReservations = [
        { id: 1, habitacion: '101', fecha_inicio: '2024-01-01', fecha_fin: '2024-01-02' }
      ];

      service.obtenerMisReservas(userId).subscribe(reservations => {
        expect(reservations).toEqual(mockReservations);
      });

      const req = httpMock.expectOne(`${API_BASE_URL}/api/mis-reservas/${userId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockReservations);
    });
  });

  describe('cancelarReserva', () => {
    it('should cancel reservation successfully', () => {
      const reservaId = 1;
      const usuarioId = 1;
      const mockResponse = {
        mensaje: 'Reserva cancelada exitosamente',
        claseMensaje: 'success'
      };

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
  });

  it('should have correct API base URL', () => {
    expect(service['apiUrl']).toBe(`${API_BASE_URL}/api`);
  });
});
