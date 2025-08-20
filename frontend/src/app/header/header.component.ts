import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, Usuario } from '../services/auth.service';
import { Subscription } from 'rxjs';
import { OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  imports: [CommonModule, RouterModule]
})
export class HeaderComponent implements OnInit, OnDestroy {
  usuario: Usuario | null = null;
  private subscription!: Subscription;

      constructor(private authService: AuthService, private router: Router) {}


  ngOnInit() {
    this.subscription = this.authService.usuario$.subscribe(usuario => {
      this.usuario = usuario;
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  logout() {
  this.authService.logout();
  this.router.navigate(['/login']);
    }
}