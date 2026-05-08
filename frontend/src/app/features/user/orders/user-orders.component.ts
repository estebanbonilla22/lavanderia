import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';

import { Order } from '../../../core/models/order.models';
import { OrderApiService } from '../../../core/services/order.service';

@Component({
  selector: 'app-user-orders',
  standalone: true,
  imports: [CurrencyPipe, DatePipe],
  template: `
    <h2>Mis órdenes</h2>
    <p class="muted">Estas son tus órdenes de lavandería más recientes.</p>

    @if (error()) {
      <div class="alert alert-error">{{ error() }}</div>
    }

    @if (loading()) {
      <p class="empty">Cargando órdenes...</p>
    } @else if (orders().length === 0) {
      <p class="empty">Aún no has creado ninguna orden.</p>
    } @else {
      <div class="card" style="padding: 0; overflow: hidden;">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Servicio</th>
              <th>Cantidad</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            @for (o of orders(); track o.id) {
              <tr>
                <td>{{ o.id }}</td>
                <td>{{ o.serviceName }}</td>
                <td>{{ o.quantity }}</td>
                <td>{{ o.totalPrice | currency:'USD':'symbol':'1.2-2' }}</td>
                <td>
                  <span class="badge" [class]="'badge-' + o.status.toLowerCase()">
                    {{ o.status.replace('_', ' ') }}
                  </span>
                </td>
                <td>{{ o.createdAt | date:'short' }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
  styles: [`
    h2 { margin-bottom: 0.3rem; }
    .muted { color: var(--muted); margin-bottom: 1rem; }
  `]
})
export class UserOrdersComponent {
  private readonly api = inject(OrderApiService);

  protected readonly orders = signal<Order[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  constructor() {
    this.api.myOrders().subscribe({
      next: (data) => {
        this.orders.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'No se pudieron cargar las órdenes');
      }
    });
  }
}
