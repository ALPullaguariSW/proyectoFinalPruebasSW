import { TestBed } from '@angular/core/testing';
import { BookingService } from './booking.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

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

  it('should get available rooms', () => {
    const mockRooms = [
      { id: 1, numero: '101', tipo: 'Individual', precio: 50 },
      { id: 2, numero: '102', tipo: 'Doble', precio: 80 }
    ];

    service.getHabitacionesDisponibles().subscribe(rooms => {
      expect(rooms).toEqual(mockRooms);
    });

    const req = httpMock.expectOne('/api/habitaciones/disponibles');
    expect(req.request.method).toBe('GET');
    req.flush(mockRooms);
  });

  it('should create a booking', () => {
    const mockBooking = {
      habitacionId: 1,
      fechaInicio: '2024-01-01',
      fechaFin: '2024-01-03',
      usuarioId: 1
    };
    const mockResponse = { id: 1, ...mockBooking, estado: 'confirmada' };

    service.crearReserva(mockBooking).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('/api/reservas');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockBooking);
    req.flush(mockResponse);
  });

  it('should get user bookings', () => {
    const mockBookings = [
      { id: 1, habitacionId: 1, fechaInicio: '2024-01-01', fechaFin: '2024-01-03' },
      { id: 2, habitacionId: 2, fechaInicio: '2024-01-05', fechaFin: '2024-01-07' }
    ];

    service.getMisReservas().subscribe(bookings => {
      expect(bookings).toEqual(mockBookings);
    });

    const req = httpMock.expectOne('/api/reservas/mis-reservas');
    expect(req.request.method).toBe('GET');
    req.flush(mockBookings);
  });

  it('should cancel a booking', () => {
    const bookingId = 1;
    const mockResponse = { message: 'Reserva cancelada exitosamente' };

    service.cancelarReserva(bookingId).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`/api/reservas/${bookingId}/cancelar`);
    expect(req.request.method).toBe('PUT');
    req.flush(mockResponse);
  });
});
