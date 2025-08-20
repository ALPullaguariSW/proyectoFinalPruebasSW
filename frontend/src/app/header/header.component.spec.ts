import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isLoggedIn', 'logout']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [HeaderComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should check authentication status on init', () => {
    authService.isLoggedIn.and.returnValue(true);
    
    component.ngOnInit();
    
    expect(authService.isLoggedIn).toHaveBeenCalled();
    expect(component.isAuthenticated).toBe(true);
  });

  it('should update authentication status when not logged in', () => {
    authService.isLoggedIn.and.returnValue(false);
    
    component.ngOnInit();
    
    expect(component.isAuthenticated).toBe(false);
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

  it('should navigate to booking', () => {
    component.irAReservar();
    
    expect(router.navigate).toHaveBeenCalledWith(['/booking']);
  });

  it('should navigate to my bookings', () => {
    component.irAMisReservas();
    
    expect(router.navigate).toHaveBeenCalledWith(['/mis-reservas']);
  });

  it('should navigate to admin dashboard if user is admin', () => {
    component.irAAdmin();
    
    expect(router.navigate).toHaveBeenCalledWith(['/admin']);
  });

  it('should navigate to login', () => {
    component.irALogin();
    
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should navigate to register', () => {
    component.irARegistro();
    
    expect(router.navigate).toHaveBeenCalledWith(['/register']);
  });

  it('should toggle mobile menu', () => {
    expect(component.mobileMenuOpen).toBe(false);
    
    component.toggleMobileMenu();
    
    expect(component.mobileMenuOpen).toBe(true);
    
    component.toggleMobileMenu();
    
    expect(component.mobileMenuOpen).toBe(false);
  });

  it('should close mobile menu', () => {
    component.mobileMenuOpen = true;
    
    component.closeMobileMenu();
    
    expect(component.mobileMenuOpen).toBe(false);
  });
});
