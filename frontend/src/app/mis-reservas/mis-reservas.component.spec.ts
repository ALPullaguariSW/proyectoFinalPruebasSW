import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MisReservasComponent } from './mis-reservas.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BookingService } from '../services/booking.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('MisReservasComponent', () => {
  let component: MisReservasComponent;
  let fixture: ComponentFixture<MisReservasComponent>;
  let bookingService: jasmine.SpyObj<BookingService>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const bookingServiceSpy = jasmine.createSpyObj('BookingService', ['getMisReservas', 'cancelarReserva']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isLoggedIn', 'logout']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      declarations: [MisReservasComponent],
      providers: [
        { provide: BookingService, useValue: bookingServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MisReservasComponent);
    component = fixture.componentInstance;
    bookingService = TestBed.inject(BookingService) as jasmine.SpyObj<BookingService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should check authentication on init', () => {
    authService.isLoggedIn.and.returnValue(true);
    
    component.ngOnInit();
    
    expect(authService.isLoggedIn).toHaveBeenCalled();
  });

  it('should redirect to login if not authenticated', () => {
    authService.isLoggedIn.and.returnValue(false);
    
    component.ngOnInit();
    
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should load user bookings on init', () => {
    const mockBookings = [
      { id: 1, habitacionId: 1, fechaInicio: '2024-01-01', fechaFin: '2024-01-03', estado: 'confirmada' },
      { id: 2, habitacionId: 2, fechaInicio: '2024-01-05', fechaFin: '2024-01-07', estado: 'pendiente' }
    ];
    authService.isLoggedIn.and.returnValue(true);
    bookingService.getMisReservas.and.returnValue(of(mockBookings));
    
    component.ngOnInit();
    
    expect(bookingService.getMisReservas).toHaveBeenCalled();
    expect(component.reservas).toEqual(mockBookings);
  });

  it('should handle error loading bookings', () => {
    authService.isLoggedIn.and.returnValue(true);
    bookingService.getMisReservas.and.returnValue(throwError(() => new Error('Failed to load')));
    
    component.ngOnInit();
    
    expect(component.errorMessage).toBe('Error al cargar las reservas');
  });

  it('should cancel booking successfully', () => {
    const mockResponse = { message: 'Reserva cancelada exitosamente' };
    bookingService.cancelarReserva.and.returnValue(of(mockResponse));
    
    component.cancelarReserva(1);
    
    expect(bookingService.cancelarReserva).toHaveBeenCalledWith(1);
    expect(component.mensaje).toBe('Reserva cancelada exitosamente');
  });

  it('should handle error canceling booking', () => {
    bookingService.cancelarReserva.and.returnValue(throwError(() => new Error('Failed to cancel')));
    
    component.cancelarReserva(1);
    
    expect(component.errorMessage).toBe('Error al cancelar la reserva');
  });

  it('should refresh bookings after cancellation', () => {
    const mockResponse = { message: 'Reserva cancelada exitosamente' };
    const mockBookings = [{ id: 2, habitacionId: 2, fechaInicio: '2024-01-05', fechaFin: '2024-01-07' }];
    
    bookingService.cancelarReserva.and.returnValue(of(mockResponse));
    bookingService.getMisReservas.and.returnValue(of(mockBookings));
    
    component.cancelarReserva(1);
    
    expect(bookingService.getMisReservas).toHaveBeenCalled();
    expect(component.reservas).toEqual(mockBookings);
  });

  it('should format date correctly', () => {
    const date = '2024-01-01';
    const formatted = component.formatearFecha(date);
    expect(formatted).toBe('01/01/2024');
  });

  it('should calculate total nights correctly', () => {
    const fechaInicio = '2024-01-01';
    const fechaFin = '2024-01-03';
    const nights = component.calcularNoches(fechaInicio, fechaFin);
    expect(nights).toBe(2);
  });

  it('should logout and redirect to login', () => {
    component.logout();
    
    expect(authService.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should navigate to dashboard', () => {
    component.irADashboard();
    
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });
});
