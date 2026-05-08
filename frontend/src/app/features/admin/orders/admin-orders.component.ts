import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Order, OrderStatus } from '../../../core/models/order.models';
import { OrderApiService } from '../../../core/services/order.service';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, FormsModule],
  template: `
    <h2>Todas las órdenes</h2>
    <p class="muted">Cambia el estado de cualquier orden o elimínala.</p>

    @if (error()) {
      <div class="alert alert-error">{{ error() }}</div>
    }
    @if (success()) {
      <div class="alert alert-success">{{ success() }}</div>
    }

    @if (loading()) {
      <p class="empty">Cargando...</p>
    } @else if (orders().length === 0) {
      <p class="empty">No hay órdenes en el sistema.</p>
    } @else {
      <div class="card" style="padding: 0; overflow: hidden;">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Usuario</th>
              <th>Servicio</th>
              <th>Cant.</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @for (o of orders(); track o.id) {
              <tr>
                <td>{{ o.id }}</td>
                <td>{{ o.username }}</td>
                <td>{{ o.serviceName }}</td>
                <td>{{ o.quantity }}</td>
                <td>{{ o.totalPrice | currency:'USD':'symbol':'1.2-2' }}</td>
                <td>
                  <select [ngModel]="o.status" (ngModelChange)="changeStatus(o, $event)">
                    @for (st of statuses; track st) {
                      <option [value]="st">{{ st }}</option>
                    }
                  </select>
                </td>
                <td>{{ o.createdAt | date:'short' }}</td>
                <td><button class="danger" (click)="remove(o)">Eliminar</button></td>
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
    select { min-width: 140px; }
  `]
})
export class AdminOrdersComponent {
  private readonly api = inject(OrderApiService);

  protected readonly orders = signal<Order[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly success = signal<string | null>(null);

  protected readonly statuses: OrderStatus[] = ['PENDIENTE', 'EN_PROCESO', 'LISTO', 'ENTREGADO'];

  constructor() {
    this.load();
  }

  protected changeStatus(order: Order, status: OrderStatus): void {
    if (order.status === status) return;
    this.error.set(null);
    this.api.updateStatus(order.id, { status }).subscribe({
      next: (updated) => {
        this.orders.update((list) =>
          list.map((o) => (o.id === updated.id ? updated : o))
        );
        this.success.set(`Orden #${updated.id} actualizada a ${updated.status}`);
      },
      error: (err) => this.error.set(err?.error?.message ?? 'No se pudo actualizar el estado')
    });
  }

  protected remove(order: Order): void {
    if (!confirm(`¿Eliminar la orden #${order.id}?`)) return;
    this.api.remove(order.id).subscribe({
      next: () => {
        this.orders.update((list) => list.filter((o) => o.id !== order.id));
        this.success.set('Orden eliminada');
      },
      error: (err) => this.error.set(err?.error?.message ?? 'No se pudo eliminar')
    });
  }

  private load(): void {
    this.api.listAll().subscribe({
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
