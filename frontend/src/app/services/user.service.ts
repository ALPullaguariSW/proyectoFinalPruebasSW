import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${API_BASE_URL}/api`;

  constructor(private http: HttpClient) {}

  registrar(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/registro`, data);
  }

  login(credentials: { correo: string; contrasena: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials);
  }
}
