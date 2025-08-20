import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable()
export class AdminReservasService {
  private apiUrl = '/api/admin/reservas';
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

  listarReservas(): Observable<any[]> {
    return this.http.get<{ reservas: any[] }>(this.apiUrl, { ...this.getAuthHeaders(), responseType: 'json' as const }).pipe(
      map(res => res.reservas || [])
    );
  }

  cancelarReserva(reserva_id: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/cancelar`,
      { reserva_id },
      { ...this.getAuthHeaders(), responseType: 'json' as const }
    );
  }
}


