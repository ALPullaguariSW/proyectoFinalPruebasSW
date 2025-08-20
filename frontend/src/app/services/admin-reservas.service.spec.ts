import { TestBed } from '@angular/core/testing';
import { AdminReservasService } from './admin-reservas.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('AdminReservasService', () => {
  let service: AdminReservasService;
  let httpMock: HttpTestingController;

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

  it('should get all bookings', () => {
    const mockBookings = [
      { id: 1, habitacionId: 1, usuarioId: 1, fechaInicio: '2024-01-01', fechaFin: '2024-01-03' },
      { id: 2, habitacionId: 2, usuarioId: 2, fechaInicio: '2024-01-05', fechaFin: '2024-01-07' }
    ];

    service.getAllReservas().subscribe(bookings => {
      expect(bookings).toEqual(mockBookings);
    });

    const req = httpMock.expectOne('/api/admin/reservas');
    expect(req.request.method).toBe('GET');
    req.flush(mockBookings);
  });

  it('should get booking by ID', () => {
    const mockBooking = { id: 1, habitacionId: 1, usuarioId: 1, fechaInicio: '2024-01-01', fechaFin: '2024-01-03' };

    service.getReservaById(1).subscribe(booking => {
      expect(booking).toEqual(mockBooking);
    });

    const req = httpMock.expectOne('/api/admin/reservas/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockBooking);
  });

  it('should update booking status', () => {
    const mockResponse = { message: 'Estado de reserva actualizado' };
    const statusUpdate = { estado: 'confirmada' };

    service.actualizarEstadoReserva(1, 'confirmada').subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('/api/admin/reservas/1/estado');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(statusUpdate);
    req.flush(mockResponse);
  });

  it('should delete booking', () => {
    const mockResponse = { message: 'Reserva eliminada exitosamente' };

    service.eliminarReserva(1).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('/api/admin/reservas/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(mockResponse);
  });

  it('should get bookings by date range', () => {
    const mockBookings = [
      { id: 1, habitacionId: 1, usuarioId: 1, fechaInicio: '2024-01-01', fechaFin: '2024-01-03' }
    ];
    const dateRange = { fechaInicio: '2024-01-01', fechaFin: '2024-01-31' };

    service.getReservasPorFecha(dateRange.fechaInicio, dateRange.fechaFin).subscribe(bookings => {
      expect(bookings).toEqual(mockBookings);
    });

    const req = httpMock.expectOne(`/api/admin/reservas/fecha?fechaInicio=${dateRange.fechaInicio}&fechaFin=${dateRange.fechaFin}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockBookings);
  });

  it('should get bookings by user', () => {
    const mockBookings = [
      { id: 1, habitacionId: 1, usuarioId: 1, fechaInicio: '2024-01-01', fechaFin: '2024-01-03' }
    ];

    service.getReservasPorUsuario(1).subscribe(bookings => {
      expect(bookings).toEqual(mockBookings);
    });

    const req = httpMock.expectOne('/api/admin/reservas/usuario/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockBookings);
  });

  it('should get booking statistics', () => {
    const mockStats = {
      totalReservas: 10,
      reservasConfirmadas: 8,
      reservasPendientes: 2,
      reservasCanceladas: 0
    };

    service.getEstadisticasReservas().subscribe(stats => {
      expect(stats).toEqual(mockStats);
    });

    const req = httpMock.expectOne('/api/admin/reservas/estadisticas');
    expect(req.request.method).toBe('GET');
    req.flush(mockStats);
  });
});
