import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookingComponent } from './booking.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BookingService } from '../services/booking.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('BookingComponent', () => {
  let component: BookingComponent;
  let fixture: ComponentFixture<BookingComponent>;
  let bookingService: jasmine.SpyObj<BookingService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const bookingServiceSpy = jasmine.createSpyObj('BookingService', ['getHabitacionesDisponibles', 'crearReserva']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, HttpClientTestingModule, RouterTestingModule],
      declarations: [BookingComponent],
      providers: [
        { provide: BookingService, useValue: bookingServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BookingComponent);
    component = fixture.componentInstance;
    bookingService = TestBed.inject(BookingService) as jasmine.SpyObj<BookingService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form', () => {
    expect(component.bookingForm.get('habitacionId')?.value).toBe('');
    expect(component.bookingForm.get('fechaInicio')?.value).toBe('');
    expect(component.bookingForm.get('fechaFin')?.value).toBe('');
  });

  it('should load available rooms on init', () => {
    const mockRooms = [
      { id: 1, numero: '101', tipo: 'Individual', precio: 50 },
      { id: 2, numero: '102', tipo: 'Doble', precio: 80 }
    ];
    bookingService.getHabitacionesDisponibles.and.returnValue(of(mockRooms));

    component.ngOnInit();

    expect(bookingService.getHabitacionesDisponibles).toHaveBeenCalled();
    expect(component.habitaciones).toEqual(mockRooms);
  });

  it('should validate required fields', () => {
    const form = component.bookingForm;
    expect(form.valid).toBeFalsy();
    
    form.controls['habitacionId'].setValue(1);
    form.controls['fechaInicio'].setValue('2024-01-01');
    form.controls['fechaFin'].setValue('2024-01-03');
    expect(form.valid).toBeTruthy();
  });

  it('should validate date range', () => {
    const fechaInicioControl = component.bookingForm.controls['fechaInicio'];
    const fechaFinControl = component.bookingForm.controls['fechaFin'];
    
    fechaInicioControl.setValue('2024-01-03');
    fechaFinControl.setValue('2024-01-01');
    
    expect(component.bookingForm.errors?.['invalidDateRange']).toBeTruthy();
    
    fechaInicioControl.setValue('2024-01-01');
    fechaFinControl.setValue('2024-01-03');
    expect(component.bookingForm.errors?.['invalidDateRange']).toBeFalsy();
  });

  it('should create booking successfully', () => {
    const mockResponse = { id: 1, habitacionId: 1, fechaInicio: '2024-01-01', fechaFin: '2024-01-03' };
    bookingService.crearReserva.and.returnValue(of(mockResponse));
    
    component.bookingForm.controls['habitacionId'].setValue(1);
    component.bookingForm.controls['fechaInicio'].setValue('2024-01-01');
    component.bookingForm.controls['fechaFin'].setValue('2024-01-03');
    
    component.onSubmit();
    
    expect(bookingService.crearReserva).toHaveBeenCalledWith({
      habitacionId: 1,
      fechaInicio: '2024-01-01',
      fechaFin: '2024-01-03'
    });
    expect(router.navigate).toHaveBeenCalledWith(['/mis-reservas']);
  });

  it('should handle booking error', () => {
    bookingService.crearReserva.and.returnValue(throwError(() => new Error('Booking failed')));
    
    component.bookingForm.controls['habitacionId'].setValue(1);
    component.bookingForm.controls['fechaInicio'].setValue('2024-01-01');
    component.bookingForm.controls['fechaFin'].setValue('2024-01-03');
    
    component.onSubmit();
    
    expect(component.errorMessage).toBe('Error al crear la reserva');
  });

  it('should not submit if form is invalid', () => {
    component.onSubmit();
    expect(bookingService.crearReserva).not.toHaveBeenCalled();
  });

  it('should calculate total price correctly', () => {
    const mockRooms = [
      { id: 1, numero: '101', tipo: 'Individual', precio: 50 },
      { id: 2, numero: '102', tipo: 'Doble', precio: 80 }
    ];
    component.habitaciones = mockRooms;
    
    component.bookingForm.controls['habitacionId'].setValue(1);
    component.bookingForm.controls['fechaInicio'].setValue('2024-01-01');
    component.bookingForm.controls['fechaFin'].setValue('2024-01-03');
    
    const total = component.calcularPrecioTotal();
    expect(total).toBe(100); // 50 * 2 nights
  });
});
