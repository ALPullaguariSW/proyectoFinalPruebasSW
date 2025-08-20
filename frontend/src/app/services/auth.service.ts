import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Usuario {
  id: string;
  nombre: string;
  rol: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private usuarioSubject = new BehaviorSubject<Usuario | null>(null);
  usuario$ = this.usuarioSubject.asObservable();

  constructor() {
    // Al iniciar el servicio, intentamos cargar el usuario de localStorage si existe
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
      this.usuarioSubject.next(JSON.parse(usuarioStr));
    }
  }

  login(usuario: Usuario, token?: string) {
    localStorage.setItem('usuario', JSON.stringify(usuario));
    if (token) {
      localStorage.setItem('token', token);
    }
    this.usuarioSubject.next(usuario);
  }

  logout() {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token'); // Elimina el token al cerrar sesión
    this.usuarioSubject.next(null);
  }

  getUsuario(): Usuario | null {
    return this.usuarioSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}