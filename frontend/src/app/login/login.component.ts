import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { UserService } from '../services/user.service'; // Asegúrate de tener este path correcto
import { AuthService } from '../services/auth.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, FooterComponent, HeaderComponent, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  correo = '';
  contrasena = '';
  mensaje = '';
  claseMensaje = '';

  constructor(
  private userService: UserService,
  private authService: AuthService, // <-- aquí
  private router: Router
) {}

  login() {
    if (!this.correo || !this.contrasena) {
      this.mensaje = 'Por favor, complete todos los campos.';
      this.claseMensaje = 'error';
      return;
    }

    this.userService.login({
      correo: this.correo,
      contrasena: this.contrasena
    }).subscribe({
      next: (res) => {
        this.mensaje = res.mensaje;
        this.claseMensaje = res.claseMensaje;
        if (res.claseMensaje === 'success') {
          // Guardar usuario y token en el AuthService y en el localStorage
          this.authService.login(res.usuario, res.token);
          localStorage.setItem('usuario', JSON.stringify(res.usuario));
          localStorage.setItem('token', res.token);
          
          this.router.navigate([res.usuario.rol === 'admin' ? '/admin/dashboard' : '/dashboard']);
        }
      },
      error: (err) => {
        this.mensaje = err.error?.mensaje || 'Error al iniciar sesión.';
        this.claseMensaje = 'error';
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']); // <-- Redirige a una ruta válida
  }
}
