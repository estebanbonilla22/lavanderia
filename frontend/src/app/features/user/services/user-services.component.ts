import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { LaundryService } from '../../../core/models/laundry.models';
import { LaundryApiService } from '../../../core/services/laundry.service';
import { OrderApiService } from '../../../core/services/order.service';

@Component({
  selector: 'app-user-services',
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyPipe],
  template: `
    <h2>Servicios de lavandería</h2>
    <p class="muted">Consulta los servicios disponibles y crea una nueva orden.</p>

    @if (error()) {
      <div class="alert alert-error">{{ error() }}</div>
    }
    @if (success()) {
      <div class="alert alert-success">{{ success() }}</div>
    }

    @if (loading()) {
      <p class="empty">Cargando servicios...</p>
    } @else if (services().length === 0) {
      <p class="empty">No hay servicios disponibles por el momento.</p>
    } @else {
      <div class="grid grid-2">
        @for (s of services(); track s.id) {
          <div class="card">
            <h3>{{ s.name }}</h3>
            <p class="muted">{{ s.description || 'Sin descripción' }}</p>
            <div class="row" style="margin: 0.6rem 0;">
              <span class="badge badge-listo">{{ s.price | currency:'USD':'symbol':'1.2-2' }}</span>
              <span class="muted">⏱ {{ s.durationHours }} h</span>
            </div>
            <button class="secondary" (click)="select(s)">Crear orden</button>
          </div>
        }
      </div>
    }

    @if (selected(); as s) {
      <div class="card" style="margin-top: 1.5rem;">
        <h3>Crear orden — {{ s.name }}</h3>
        <form [formGroup]="form" (ngSubmit)="placeOrder()">
          <div class="form-group">
            <label>Cantidad</label>
            <input type="number" min="1" formControlName="quantity" />
          </div>
          <div class="form-group">
            <label>Notas (opcional)</label>
            <textarea rows="3" formControlName="notes"></textarea>
          </div>
          <div class="row">
            <button type="submit" [disabled]="form.invalid || placing()">
              {{ placing() ? 'Creando...' : 'Confirmar orden' }}
            </button>
            <button type="button" class="secondary" (click)="cancel()">Cancelar</button>
          </div>
        </form>
      </div>
    }
  `,
  styles: [`
    h2 { margin-bottom: 0.3rem; }
    .muted { color: var(--muted); margin-bottom: 1rem; }
    h3 { margin-bottom: 0.4rem; }
  `]
})
export class UserServicesComponent {
  private readonly api = inject(LaundryApiService);
  private readonly orders = inject(OrderApiService);
  private readonly fb = inject(FormBuilder);

  protected readonly services = signal<LaundryService[]>([]);
  protected readonly selected = signal<LaundryService | null>(null);
  protected readonly loading = signal(true);
  protected readonly placing = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly success = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    quantity: [1, [Validators.required, Validators.min(1)]],
    notes: ['']
  });

  constructor() {
    this.load();
  }

  protected select(service: LaundryService): void {
    this.selected.set(service);
    this.form.reset({ quantity: 1, notes: '' });
    this.success.set(null);
  }

  protected cancel(): void {
    this.selected.set(null);
  }

  protected placeOrder(): void {
    const service = this.selected();
    if (!service || this.form.invalid) return;
    this.placing.set(true);
    this.error.set(null);

    const { quantity, notes } = this.form.getRawValue();
    this.orders.create({ serviceId: service.id, quantity, notes }).subscribe({
      next: () => {
        this.placing.set(false);
        this.selected.set(null);
        this.success.set('Orden creada con éxito.');
      },
      error: (err) => {
        this.placing.set(false);
        this.error.set(err?.error?.message ?? 'No se pudo crear la orden');
      }
    });
  }

  private load(): void {
    this.api.list(true).subscribe({
      next: (data) => {
        this.services.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'No se pudieron cargar los servicios');
      }
    });
  }
}
