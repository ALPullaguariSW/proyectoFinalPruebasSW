import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isLoggedIn', 'getToken', 'logout']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      declarations: [DashboardComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should check authentication on init', () => {
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

  it('should logout and redirect to login', () => {
    component.logout();
    
    expect(authService.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should navigate to booking page', () => {
    component.irAReservar();
    
    expect(router.navigate).toHaveBeenCalledWith(['/booking']);
  });

  it('should navigate to my bookings page', () => {
    component.irAMisReservas();
    
    expect(router.navigate).toHaveBeenCalledWith(['/mis-reservas']);
  });

  it('should display welcome message with user info', () => {
    authService.isLoggedIn.and.returnValue(true);
    authService.getToken.and.returnValue('fake-token');
    
    // Mock JWT decode
    spyOn(component, 'decodeToken').and.returnValue({ email: 'test@test.com', nombre: 'Test User' });
    
    component.ngOnInit();
    
    expect(component.usuario).toEqual({ email: 'test@test.com', nombre: 'Test User' });
  });

  it('should handle invalid token gracefully', () => {
    authService.isLoggedIn.and.returnValue(true);
    authService.getToken.and.returnValue('invalid-token');
    
    spyOn(component, 'decodeToken').and.returnValue(null);
    
    component.ngOnInit();
    
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
