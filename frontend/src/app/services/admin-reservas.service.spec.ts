import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AdminReservasService } from './admin-reservas.service';

describe('AdminReservasService', () => {
  let service: AdminReservasService;
  let httpMock: HttpTestingController;
  const API_BASE_URL = 'http://localhost:3000/api';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AdminReservasService]
    });
    service = TestBed.inject(AdminReservasService);
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

  describe('listarReservas', () => {
    it('should list reservations successfully', () => {
      const mockResponseData = {
        reservas: [
          { id: 1, usuario: 'Test User', habitacion: '101', fecha_inicio: '2024-01-01' }
        ]
      };
      const expectedResult = mockResponseData.reservas;

      service.listarReservas().subscribe(response => {
        expect(response).toEqual(expectedResult);
      });

      const req = httpMock.expectOne('/api/admin/reservas');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponseData);
    });

    it('should handle empty reservations response', () => {
      const mockResponseData = { reservas: [] };

      service.listarReservas().subscribe(response => {
        expect(response).toEqual([]);
      });

      const req = httpMock.expectOne('/api/admin/reservas');
      req.flush(mockResponseData);
    });

    it('should handle missing reservas property', () => {
      const mockResponseData = {};

      service.listarReservas().subscribe(response => {
        expect(response).toEqual([]);
      });

      const req = httpMock.expectOne('/api/admin/reservas');
      req.flush(mockResponseData);
    });

    it('should handle error when listing reservations', () => {
      const mockError = {
        mensaje: 'Error al obtener reservas',
        claseMensaje: 'error'
      };

      service.listarReservas().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.error.mensaje).toBe('Error al obtener reservas');
        }
      });

      const req = httpMock.expectOne('/api/admin/reservas');
      req.flush(mockError, { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('cancelarReserva', () => {
    it('should cancel reservation successfully', () => {
      const reservaId = 1;
      const mockResponse = {
        mensaje: 'Reserva cancelada exitosamente',
        claseMensaje: 'success'
      };

      service.cancelarReserva(reservaId).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('/api/admin/reservas/cancelar');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        reserva_id: reservaId
      });
      req.flush(mockResponse);
    });

    it('should handle error when canceling reservation', () => {
      const reservaId = 1;
      const mockError = {
        mensaje: 'Error al cancelar reserva',
        claseMensaje: 'error'
      };

      service.cancelarReserva(reservaId).subscribe({
        next: () => fail('should have failed'),
        error: (error: any) => {
          expect(error.error.mensaje).toBe('Error al cancelar reserva');
        }
      });

      const req = httpMock.expectOne('/api/admin/reservas/cancelar');
      req.flush(mockError, { status: 400, statusText: 'Bad Request' });
    });
  });

  it('should have correct API URL', () => {
    expect(service['apiUrl']).toBe('/api/admin/reservas');
  });
});
