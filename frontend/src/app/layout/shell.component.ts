import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header class="topbar">
      <div class="brand">
        <span class="dot"></span>
        <span>Lavandería</span>
      </div>

      <nav>
        <a routerLink="/home" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
          Inicio
        </a>
        <a routerLink="/services" routerLinkActive="active">Servicios</a>
        <a routerLink="/my-orders" routerLinkActive="active">Mis órdenes</a>

        @if (isAdmin()) {
          <a routerLink="/admin/services" routerLinkActive="active">Admin · Servicios</a>
          <a routerLink="/admin/orders" routerLinkActive="active">Admin · Órdenes</a>
        }
      </nav>

      <div class="user">
        <span class="username">
          {{ auth.username() }} <small>({{ auth.role() }})</small>
        </span>
        <button class="secondary" (click)="logout()">Salir</button>
      </div>
    </header>

    <main class="container">
      <router-outlet />
    </main>
  `,
  styles: [`
    .topbar {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      padding: 0.85rem 1.5rem;
      background: #fff;
      border-bottom: 1px solid var(--border);
      flex-wrap: wrap;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 700;
      color: var(--primary);
      font-size: 1.05rem;
    }
    .brand .dot {
      width: 14px; height: 14px;
      border-radius: 999px;
      background: var(--primary);
    }
    nav {
      display: flex;
      gap: 0.25rem;
      flex-wrap: wrap;
      flex: 1;
    }
    nav a {
      padding: 0.45rem 0.85rem;
      border-radius: 6px;
      color: var(--text);
      font-size: 0.9rem;
    }
    nav a.active { background: #eff6ff; color: var(--primary); }
    nav a:hover { background: #f1f5f9; text-decoration: none; }

    .user {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 0.9rem;
    }
    .username { color: var(--muted); }
  `]
})
export class ShellComponent {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly isAdmin = computed(() => this.auth.role() === 'ADMIN');

  protected logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
