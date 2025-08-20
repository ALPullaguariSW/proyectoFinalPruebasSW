import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../services/booking.service'; // Ajusta según ruta real
import { formatDate } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminHeaderComponent } from '../admin-header/admin-header.component';
import {FooterComponent} from '../../footer/footer.component';
import { AuthService } from '../../services/auth.service'; // Importa AuthService

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  standalone: true,
  imports: [CommonModule, RouterLink,AdminHeaderComponent,FooterComponent],
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  totalUsuarios: number = 0;
  totalReservas: number = 0;
  totalHabitaciones: number = 0;

  proximasReservas: any[] = [];

  constructor(
    private bookingService: BookingService,
    private authService: AuthService // Añade AuthService
  ) {}

  ngOnInit(): void {
    // Obtén el token y pásalo al BookingService
    const token = this.authService.getToken();
    this.bookingService.setToken(token);

    this.cargarEstadisticas();
    this.cargarProximasReservas();
  }

  cargarEstadisticas() {
  this.bookingService.obtenerEstadisticasAdmin().subscribe({
    next: (stats) => {
      console.log('Estadísticas:', stats);
      this.totalUsuarios = stats.total_usuarios;
      this.totalReservas = stats.total_reservas;
      this.totalHabitaciones = stats.total_habitaciones;
    },
    error: (err) => {
      console.error('Error al obtener estadísticas:', err);
    }
  });
}

  cargarProximasReservas() {
    this.bookingService.obtenerProximasReservas().subscribe({
      next: (res) => {
        console.log('Próximas reservas:', res);
        this.proximasReservas = res.reservas;
      },
      error: () => {
        // manejar error (opcional)
      }
    });
  }

  formatearFecha(fecha: string): string {
    return formatDate(fecha, 'dd/MM/yyyy', 'en-EC');
  }
}
