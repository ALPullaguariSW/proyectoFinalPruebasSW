import { Component, OnInit } from '@angular/core';
import { BookingService } from '../services/booking.service';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { formatDate } from '@angular/common';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-mis-reservas',
  templateUrl: './mis-reservas.component.html',
  styleUrls: ['./mis-reservas.component.css'],
  standalone: true,
  imports: [CommonModule,FooterComponent,HeaderComponent],
})
export class MisReservasComponent implements OnInit {
  reservas: any[] = [];
  mensaje = '';
  claseMensaje = '';
  usuarioId: number | null = null;

  constructor(
    private bookingService: BookingService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const usuario = this.authService.getUsuario();
    if (usuario?.id) {
      this.usuarioId = +usuario.id;
      this.obtenerReservas();
    } else {
      this.mensaje = 'Debes iniciar sesión para ver tus reservas.';
      this.claseMensaje = 'error';
    }
  }

  obtenerReservas() {
    this.bookingService.obtenerMisReservas(this.usuarioId!).subscribe({
      next: (res) => {
        this.reservas = res.reservas;
      },
      error: () => {
        this.mensaje = 'Error al obtener tus reservas.';
        this.claseMensaje = 'error';
      }
    });
  }

  cancelarReserva(reservaId: number) {
    if (!confirm('¿Estás seguro de que quieres cancelar esta reserva? Esta acción no se puede deshacer.')) {
      return;
    }
    this.bookingService.cancelarReserva(reservaId, this.usuarioId!).subscribe({
      next: (res) => {
        this.mensaje = res.mensaje;
        this.claseMensaje = res.claseMensaje || 'success';
        this.obtenerReservas();
      },
      error: () => {
        this.mensaje = 'Error al cancelar la reserva.';
        this.claseMensaje = 'error';
      }
    });
  }

  fechaEsFutura(fechaInicio: string): boolean {
  const hoy = new Date();
  const hoyY = hoy.getFullYear();
  const hoyM = hoy.getMonth();
  const hoyD = hoy.getDate();

  const inicio = new Date(fechaInicio);
  const iniY = inicio.getFullYear();
  const iniM = inicio.getMonth();
  const iniD = inicio.getDate();

  return (
    iniY > hoyY ||
    (iniY === hoyY && iniM > hoyM) ||
    (iniY === hoyY && iniM === hoyM && iniD > hoyD)
  );
}

  formatearFecha(fecha: string): string {
    return formatDate(fecha, 'dd/MM/yyyy', 'en-EC');
  }
}
