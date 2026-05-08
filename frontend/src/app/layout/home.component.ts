import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="hero card">
      <h1>Hola, {{ auth.username() }} 👋</h1>
      <p class="muted">
        Bienvenido a la plataforma de lavandería.
        @if (auth.role() === 'ADMIN') {
          Tienes acceso a la gestión completa del sistema.
        } @else {
          Explora los servicios disponibles y crea una orden cuando lo necesites.
        }
      </p>
    </section>

    <section class="grid grid-2">
      <div class="card">
        <h3>Servicios</h3>
        <p class="muted">Consulta los servicios disponibles y solicita uno.</p>
        <a routerLink="/services"><button>Ver servicios</button></a>
      </div>

      <div class="card">
        <h3>Mis órdenes</h3>
        <p class="muted">Revisa el estado de tus órdenes activas.</p>
        <a routerLink="/my-orders"><button>Ver mis órdenes</button></a>
      </div>

      @if (auth.role() === 'ADMIN') {
        <div class="card">
          <h3>Gestión de servicios</h3>
          <p class="muted">Crear, editar y eliminar servicios de lavandería.</p>
          <a routerLink="/admin/services"><button>Administrar</button></a>
        </div>
        <div class="card">
          <h3>Órdenes (todas)</h3>
          <p class="muted">Ver y actualizar el estado de todas las órdenes.</p>
          <a routerLink="/admin/orders"><button>Administrar</button></a>
        </div>
      }
    </section>
  `,
  styles: [`
    h1 { font-size: 1.6rem; margin-bottom: 0.4rem; }
    h3 { margin-bottom: 0.4rem; }
    .muted { color: var(--muted); margin-bottom: 0.85rem; }
    .hero { margin-bottom: 1rem; }
  `]
})
export class HomeComponent {
  protected readonly auth = inject(AuthService);
}
