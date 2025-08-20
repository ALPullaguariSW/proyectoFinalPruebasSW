import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';

export interface Habitacion {
  id: number;
  tipo: string;
  numero: string;
  descripcion: string;
  servicios: string;
  imagen: string;
  precio: number;
  disponible: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private apiUrl = `${API_BASE_URL}/api`;
  private apiUrlAdmin = `${API_BASE_URL}/api/admin`;
  private token: string | null = null;

  constructor(private http: HttpClient) {}

  setToken(token: string | null) {
    this.token = token;
  }

  private getAuthHeaders() {
    return this.token
      ? { headers: new HttpHeaders({ Authorization: `Bearer ${this.token}` }) }
      : {};
  }

  obtenerTiposHabitacion(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/tipos-habitacion`, this.getAuthHeaders());
  }

  buscarHabitacionesDisponibles(fecha_inicio: string, fecha_fin: string, tipo?: string): Observable<{ habitaciones: Habitacion[] }> {
    let params: any = { fecha_inicio, fecha_fin };
    if (tipo) {
      params.tipo_habitacion = tipo;
    }
    return this.http.get<{ habitaciones: Habitacion[] }>(`${this.apiUrl}/habitaciones-disponibles`, { ...this.getAuthHeaders(), params });
  }

  obtenerMisReservas(usuarioId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/mis-reservas/${usuarioId}`, this.getAuthHeaders());
  }

  realizarReserva(usuarioId: number, habitacionId: number, fecha_inicio: string, fecha_fin: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/reservar`,
      { usuario_id: usuarioId, habitacion_id: habitacionId, fecha_inicio, fecha_fin, accion: 'reservar' },
      this.getAuthHeaders()
    );
  }

  cancelarReserva(reservaId: number, usuarioId: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/cancelar-reserva`,
      { reserva_id: reservaId, usuario_id: usuarioId },
      this.getAuthHeaders()
    );
  }

  obtenerEstadisticasAdmin(): Observable<{ total_usuarios: number; total_reservas: number; total_habitaciones: number }> {
    return this.http.get<{ total_usuarios: number; total_reservas: number; total_habitaciones: number }>(
      `${this.apiUrlAdmin}/dashboard/stats`,
      this.getAuthHeaders()
    );
  }

  obtenerProximasReservas(): Observable<{ reservas: any[] }> {
    return this.http.get<{ reservas: any[] }>(
      `${this.apiUrlAdmin}/dashboard/proximas-reservas`,
      this.getAuthHeaders()
    );
  }
}
