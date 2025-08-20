import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterUserComponent } from './register-user.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('RegisterUserComponent', () => {
  let component: RegisterUserComponent;
  let fixture: ComponentFixture<RegisterUserComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['register']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, HttpClientTestingModule, RouterTestingModule],
      declarations: [RegisterUserComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterUserComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form', () => {
    expect(component.registerForm.get('nombre')?.value).toBe('');
    expect(component.registerForm.get('email')?.value).toBe('');
    expect(component.registerForm.get('password')?.value).toBe('');
    expect(component.registerForm.get('confirmPassword')?.value).toBe('');
  });

  it('should validate required fields', () => {
    const form = component.registerForm;
    expect(form.valid).toBeFalsy();
    
    form.controls['nombre'].setValue('Test User');
    form.controls['email'].setValue('test@test.com');
    form.controls['password'].setValue('password123');
    form.controls['confirmPassword'].setValue('password123');
    expect(form.valid).toBeTruthy();
  });

  it('should validate email format', () => {
    const emailControl = component.registerForm.controls['email'];
    emailControl.setValue('invalid-email');
    expect(emailControl.errors?.['email']).toBeTruthy();
    
    emailControl.setValue('valid@email.com');
    expect(emailControl.errors?.['email']).toBeFalsy();
  });

  it('should validate password confirmation', () => {
    const passwordControl = component.registerForm.controls['password'];
    const confirmPasswordControl = component.registerForm.controls['confirmPassword'];
    
    passwordControl.setValue('password123');
    confirmPasswordControl.setValue('different');
    
    expect(component.registerForm.errors?.['passwordMismatch']).toBeTruthy();
    
    confirmPasswordControl.setValue('password123');
    expect(component.registerForm.errors?.['passwordMismatch']).toBeFalsy();
  });

  it('should register successfully and navigate to login', () => {
    const mockResponse = { message: 'Usuario registrado exitosamente' };
    authService.register.and.returnValue(of(mockResponse));
    
    component.registerForm.controls['nombre'].setValue('Test User');
    component.registerForm.controls['email'].setValue('test@test.com');
    component.registerForm.controls['password'].setValue('password123');
    component.registerForm.controls['confirmPassword'].setValue('password123');
    
    component.onSubmit();
    
    expect(authService.register).toHaveBeenCalledWith({
      nombre: 'Test User',
      email: 'test@test.com',
      password: 'password123'
    });
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should handle registration error', () => {
    authService.register.and.returnValue(throwError(() => new Error('Registration failed')));
    
    component.registerForm.controls['nombre'].setValue('Test User');
    component.registerForm.controls['email'].setValue('test@test.com');
    component.registerForm.controls['password'].setValue('password123');
    component.registerForm.controls['confirmPassword'].setValue('password123');
    
    component.onSubmit();
    
    expect(component.errorMessage).toBe('Error en el registro');
  });

  it('should not submit if form is invalid', () => {
    component.onSubmit();
    expect(authService.register).not.toHaveBeenCalled();
  });
});
