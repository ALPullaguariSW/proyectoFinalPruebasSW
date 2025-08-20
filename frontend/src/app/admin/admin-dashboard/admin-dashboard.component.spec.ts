import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';

describe('AdminDashboardComponent', () => {
  let component: AdminDashboardComponent;
  let fixture: ComponentFixture<AdminDashboardComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isLoggedIn', 'getToken', 'logout']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      declarations: [AdminDashboardComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDashboardComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should check admin authentication on init', () => {
    authService.isLoggedIn.and.returnValue(true);
    authService.getToken.and.returnValue('fake-token');
    
    component.ngOnInit();
    
    expect(authService.isLoggedIn).toHaveBeenCalled();
    expect(authService.getToken).toHaveBeenCalled();
  });

  it('should redirect to login if not authenticated', () => {
    authService.isLoggedIn.and.returnValue(false);
    
    component.ngOnInit();
    
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should redirect to login if not admin', () => {
    authService.isLoggedIn.and.returnValue(true);
    authService.getToken.and.returnValue('fake-token');
    
    spyOn(component, 'decodeToken').and.returnValue({ role: 'user' });
    
    component.ngOnInit();
    
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should allow access if user is admin', () => {
    authService.isLoggedIn.and.returnValue(true);
    authService.getToken.and.returnValue('fake-token');
    
    spyOn(component, 'decodeToken').and.returnValue({ role: 'admin', email: 'admin@test.com' });
    
    component.ngOnInit();
    
    expect(component.usuario).toEqual({ role: 'admin', email: 'admin@test.com' });
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should navigate to admin rooms management', () => {
    component.gestionarHabitaciones();
    
    expect(router.navigate).toHaveBeenCalledWith(['/admin/habitaciones']);
  });

  it('should navigate to admin bookings management', () => {
    component.gestionarReservas();
    
    expect(router.navigate).toHaveBeenCalledWith(['/admin/reservas']);
  });

  it('should navigate to admin availability management', () => {
    component.gestionarDisponibilidad();
    
    expect(router.navigate).toHaveBeenCalledWith(['/admin/disponibilidad']);
  });

  it('should logout and redirect to login', () => {
    component.logout();
    
    expect(authService.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should handle invalid token gracefully', () => {
    authService.isLoggedIn.and.returnValue(true);
    authService.getToken.and.returnValue('invalid-token');
    
    spyOn(component, 'decodeToken').and.returnValue(null);
    
    component.ngOnInit();
    
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
