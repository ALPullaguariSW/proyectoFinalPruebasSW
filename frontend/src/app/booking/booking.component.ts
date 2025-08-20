import { Component, OnInit } from '@angular/core';
import { BookingService, Habitacion } from '../services/booking.service';
import { AuthService } from '../services/auth.service'; // Para obtener usuario
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; 
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  imports: [FormsModule,CommonModule,FooterComponent,HeaderComponent],
  standalone: true,
  styleUrls: ['./booking.component.css']
})
export class BookingComponent implements OnInit {
  tiposHabitacion: string[] = [];
  fecha_inicio = '';
  fecha_fin = '';
  tipo_seleccionado = '';
  habitacionesDisponibles: Habitacion[] = [];
  habitacionSeleccionada: number | null = null;
  mensaje = '';
  claseMensaje = '';
  habitacionDetalle: Habitacion | null = null;
  mostrarModal: boolean = false;

  usuarioId: number | null = null;
  token: string | null = null; // <-- Nuevo: guarda el token

  constructor(
    private bookingService: BookingService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Suscríbete a los cambios de usuario y token
    this.authService.usuario$.subscribe(usuario => {
      this.usuarioId = usuario?.id ? +usuario.id : null;
      this.token = this.authService.getToken();
      this.bookingService.setToken(this.token);
    });
    this.bookingService.obtenerTiposHabitacion().subscribe(tipos => this.tiposHabitacion = tipos);
  }
  abrirModal(hab: Habitacion) {
  this.habitacionDetalle = hab;
  this.mostrarModal = true;
}

cerrarModal() {
  this.habitacionDetalle = null;
  this.mostrarModal = false;
}

  consultarDisponibilidad() {
    this.mensaje = '';
    this.claseMensaje = '';

    if (!this.fecha_inicio || !this.fecha_fin) {
      this.mensaje = 'Por favor, seleccione las fechas de entrada y salida.';
      this.claseMensaje = 'error';
      return;
    }
    if (this.fecha_fin <= this.fecha_inicio) {
      this.mensaje = 'La fecha de salida debe ser posterior a la fecha de entrada.';
      this.claseMensaje = 'error';
      return;
    }

    this.bookingService.buscarHabitacionesDisponibles(this.fecha_inicio, this.fecha_fin, this.tipo_seleccionado).subscribe({
  next: res => {
    this.habitacionesDisponibles = res.habitaciones;
    if (res.habitaciones.length === 0) {
      this.mensaje = 'No hay habitaciones disponibles con esos filtros.';
      this.claseMensaje = 'info';
    }
  },
  error: () => {
    this.mensaje = 'Error al buscar habitaciones disponibles.';
    this.claseMensaje = 'error';
  }
});
  }

  reservar() {
    if (!this.habitacionSeleccionada) {
      this.mensaje = 'Debe seleccionar una habitación para reservar.';
      this.claseMensaje = 'error';
      return;
    }
    if (!this.usuarioId) {
      this.router.navigate(['/login']);
      return;
    }

    this.bookingService.realizarReserva(this.usuarioId, this.habitacionSeleccionada, this.fecha_inicio, this.fecha_fin).subscribe({
  next: () => {
    this.mensaje = '¡Reserva registrada con éxito!';
    this.claseMensaje = 'success';
    this.habitacionSeleccionada = null;
    this.consultarDisponibilidad();
  },
  error: () => {
    this.mensaje = 'Error al realizar la reserva. Intente nuevamente.';
    this.claseMensaje = 'error';
  }
});
  }
}
