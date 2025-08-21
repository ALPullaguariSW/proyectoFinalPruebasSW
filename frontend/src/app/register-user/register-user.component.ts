import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { UserService } from '../services/user.service';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-register-user',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, FooterComponent, HeaderComponent],
  templateUrl: './register-user.component.html',
  styleUrls: ['./register-user.component.css'],
  providers: [UserService] // Opcional si no está en root
})
export class RegisterUserComponent {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  mensaje = '';
  claseMensaje = '';
  loading = false;

  constructor(private userService: UserService) {}

  registrarUsuario() {
    this.loading = true;
    this.userService.registrar({
      nombre: this.name,
      correo: this.email,
      contrasena: this.password,
      confirm_contrasena: this.confirmPassword
    }).subscribe({
      next: (res: any) => {
        this.mensaje = res.mensaje;
        this.claseMensaje = res.claseMensaje;
        if (res.claseMensaje === 'success') {
          this.name = '';
          this.email = '';
          this.password = '';
          this.confirmPassword = '';
        }
        this.loading = false;
      },
      error: (err: any) => {
        this.mensaje = err.error?.mensaje || 'Error de red.';
        this.claseMensaje = err.error?.claseMensaje || 'error';
        this.loading = false;
      }
    });
  }
}
