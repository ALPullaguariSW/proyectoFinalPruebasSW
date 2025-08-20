import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <-- Importa FormsModule
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http'; // <-- Añade HttpHeaders
import { AdminHeaderComponent } from '../admin-header/admin-header.component';
import {FooterComponent} from '../../footer/footer.component';


@Component({
  selector: 'app-admin-disponibilidad',
  standalone: true,
  imports: [CommonModule, FormsModule,AdminHeaderComponent,FooterComponent], // <-- Agrega FormsModule aquí
  templateUrl: './admin-disponibilidad.component.html',
  styleUrls: ['./admin-disponibilidad.component.css']
})
export class AdminDisponibilidadComponent {
  fecha_inicio: string = '';
  fecha_fin: string = '';
  habitaciones: any[] = [];
  mensaje: string = '';
  claseMensaje: string = '';

  constructor(private http: HttpClient) {}

  consultarDisponibilidad() {
    this.mensaje = '';
    this.claseMensaje = '';
    if (!this.fecha_inicio || !this.fecha_fin) {
      this.mensaje = 'Por favor, selecciona ambas fechas.';
      this.claseMensaje = 'message-error';
      this.habitaciones = [];
      return;
    }
    if (this.fecha_fin <= this.fecha_inicio) {
      this.mensaje = 'La fecha de salida debe ser posterior a la de entrada.';
      this.claseMensaje = 'message-error';
      this.habitaciones = [];
      return;
    }
    const params = new HttpParams()
      .set('fecha_inicio', this.fecha_inicio)
      .set('fecha_fin', this.fecha_fin);

    const token = localStorage.getItem('token');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;

    this.http.get<{ habitaciones: any[] }>(
      '/api/admin/disponibilidad',
      { params, headers }
    ).subscribe({
      next: (res) => {
        this.habitaciones = res.habitaciones || [];
        if (this.habitaciones.length === 0) {
          this.mensaje = 'No hay habitaciones disponibles en ese rango.';
          this.claseMensaje = 'message-info';
        }
      },
      error: () => {
        this.mensaje = 'Error al consultar disponibilidad.';
        this.claseMensaje = 'message-error';
        this.habitaciones = [];
      }
    });
  }
}
