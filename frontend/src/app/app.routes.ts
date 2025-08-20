import { Routes } from '@angular/router';
import { RegisterUserComponent } from './register-user/register-user.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { BookingComponent } from './booking/booking.component'; // Asegúrate de tener este guard configurado
import { MisReservasComponent } from './mis-reservas/mis-reservas.component'; 
import {AdminDashboardComponent} from './admin/admin-dashboard/admin-dashboard.component'; // Asegúrate de tener este guard configurado
import {AdminReservasComponent} from './admin/admin-reservas/admin-reservas.component'; // Asegúrate de tener este guard configurado
import {AdminDisponibilidadComponent} from './admin/admin-disponibilidad/admin-disponibilidad.component'; // Asegúrate de tener este guard configurado
import {AdminHabitacionesComponent} from './admin/admin-habitaciones/admin-habitaciones.component'; // Asegúrate de tener este guard configurado

export const routes: Routes = [
  { path: '', redirectTo: 'register', pathMatch: 'full' },
  { path: 'register', component: RegisterUserComponent },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'booking', component: BookingComponent }, // Ruta para el componente de reservas
{ path: 'mis-reservas', component: MisReservasComponent }, // Ruta para el componente de mis reservas
{ path: 'admin/dashboard', component: AdminDashboardComponent }, // Ruta para el dashboard del administrador
{ path: 'admin/reservas', component: AdminReservasComponent }, // Ruta para el componente de reservas del administrador
{ path: 'admin/disponibilidad', component: AdminDisponibilidadComponent }, // Ruta para el componente de disponibilidad del administrador
{ path: 'admin/gestionar-habitaciones', component: AdminHabitacionesComponent }, // Ruta para el componente de gestión de habitaciones del administrador


  // Puedes agregar más rutas aquí (login, dashboard, etc.)
];
