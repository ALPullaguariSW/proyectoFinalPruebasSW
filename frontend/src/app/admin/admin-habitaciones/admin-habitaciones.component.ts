import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AdminHeaderComponent } from '../admin-header/admin-header.component';
import {FooterComponent} from '../../footer/footer.component';


@Component({
  selector: 'app-admin-habitaciones',
  standalone: true,
  imports: [CommonModule, FormsModule,AdminHeaderComponent,FooterComponent],
  templateUrl: './admin-habitaciones.component.html',
  styleUrls: ['./admin-habitaciones.component.css']
})
export class AdminHabitacionesComponent {
  habitaciones: any[] = [];
  mensaje: string = '';
  claseMensaje: string = '';
  modoEdicion: boolean = false;
  habitacionForm: any = {
    id: null,
    numero: '',
    tipo: '',
    descripcion: '',
    servicios: '',
    imagen: '',
    precio: ''
  };

  constructor(private http: HttpClient) {
    this.cargarHabitaciones();
  }

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) } : {};
  }

  cargarHabitaciones() {
    this.http.get<{ habitaciones: any[] }>('/api/admin/habitaciones', this.getAuthHeaders()).subscribe({
      next: res => {
        this.habitaciones = res.habitaciones || [];
      },
      error: () => {
        this.mensaje = 'Error al cargar habitaciones.';
        this.claseMensaje = 'message-error';
      }
    });
  }

  editarHabitacion(hab: any) {
    this.modoEdicion = true;
    this.habitacionForm = { ...hab };
  }

  limpiarFormulario() {
    this.modoEdicion = false;
    this.habitacionForm = {
      id: null,
      numero: '',
      tipo: '',
      descripcion: '',
      servicios: '',
      imagen: '',
      precio: ''
    };
  }

  guardarHabitacion() {
    if (!this.habitacionForm.numero || !this.habitacionForm.tipo || !this.habitacionForm.precio) {
      this.mensaje = 'El número, tipo y precio son obligatorios.';
      this.claseMensaje = 'message-error';
      return;
    }
    if (this.modoEdicion) {
      // Editar
      this.http.put(
        `/api/admin/habitaciones/${this.habitacionForm.id}`,
        this.habitacionForm,
        this.getAuthHeaders()
      ).subscribe({
        next: (res: any) => {
          this.mensaje = res.mensaje;
          this.claseMensaje = 'message-success';
          this.cargarHabitaciones();
          this.limpiarFormulario();
        },
        error: () => {
          this.mensaje = 'Error al actualizar la habitación.';
          this.claseMensaje = 'message-error';
        }
      });
    } else {
      // Crear
      this.http.post(
        '/api/admin/habitaciones',
        this.habitacionForm,
        this.getAuthHeaders()
      ).subscribe({
        next: (res: any) => {
          this.mensaje = res.mensaje;
          this.claseMensaje = 'message-success';
          this.cargarHabitaciones();
          this.limpiarFormulario();
        },
        error: () => {
          this.mensaje = 'Error al crear la habitación.';
          this.claseMensaje = 'message-error';
        }
      });
    }
  }

  eliminarHabitacion(id: number) {
    if (window.confirm('¿Eliminar esta habitación?')) {
      this.http.delete(
        `/api/admin/habitaciones/${id}`,
        this.getAuthHeaders()
      ).subscribe({
        next: (res: any) => {
          this.mensaje = res.mensaje;
          this.claseMensaje = 'message-success';
          this.cargarHabitaciones();
        },
        error: () => {
          this.mensaje = 'Error al eliminar la habitación.';
          this.claseMensaje = 'message-error';
        }
      });
    }
  }
}
