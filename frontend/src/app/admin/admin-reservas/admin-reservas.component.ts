import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminReservasService } from '../../services/admin-reservas.service';
import { AdminHeaderComponent } from '../admin-header/admin-header.component';
import {FooterComponent} from '../../footer/footer.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-reservas',
  standalone: true,
  imports: [CommonModule,AdminHeaderComponent,FooterComponent],
  templateUrl: './admin-reservas.component.html',
  styleUrls: ['./admin-reservas.component.css'],
  providers: [AdminReservasService]
})
export class AdminReservasComponent {
  reservas: any[] = [];
  mensaje: string = '';
  claseMensaje: string = '';
  mostrarConfirmacion: boolean = false;
  reservaIdAConfirmar: number | null = null;

  constructor(
    private reservasService: AdminReservasService,
    private authService: AuthService
  ) {
    const token = this.authService.getToken();
    this.reservasService.setToken(token);
    this.cargarReservas();
  }

  cargarReservas() {
    this.reservasService.listarReservas().subscribe({
      next: (reservas: any[]) => {
        this.reservas = reservas;
        if (!reservas.length) {
          this.mensaje = 'No hay reservas para mostrar.';
          this.claseMensaje = 'message-info';
        } else {
          this.mensaje = '';
        }
      },
      error: (err) => {
        console.error('Error al cargar reservas:', err);
        this.mensaje = err.error?.mensaje || 'Error al cargar las reservas.';
        this.claseMensaje = 'message-error';
      }
    });
  }

  cancelarReserva(id: number) {
    this.reservasService.cancelarReserva(id).subscribe({
      next: (res: any) => {
        this.mensaje = res.mensaje;
        this.claseMensaje = 'message-success';
        this.cargarReservas();
      },
      error: (err: any) => {
        this.mensaje = err.error?.mensaje || 'Error al cancelar la reserva.';
        this.claseMensaje = 'message-error';
      }
    });
  }

  confirmarCancelacion(id: number) {
    this.reservaIdAConfirmar = id;
    this.mostrarConfirmacion = true;
  }

  cancelarConfirmacion() {
    this.mostrarConfirmacion = false;
    this.reservaIdAConfirmar = null;
  }

  aceptarConfirmacion() {
    if (this.reservaIdAConfirmar !== null) {
      this.cancelarReserva(this.reservaIdAConfirmar);
      this.cancelarConfirmacion();
    }
  }
}
