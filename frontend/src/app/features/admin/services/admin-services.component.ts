import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { LaundryService, LaundryServiceRequest } from '../../../core/models/laundry.models';
import { LaundryApiService } from '../../../core/services/laundry.service';

@Component({
  selector: 'app-admin-services',
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyPipe],
  template: `
    <h2>Administración de servicios</h2>
    <p class="muted">Crea, edita y elimina servicios de lavandería.</p>

    @if (error()) {
      <div class="alert alert-error">{{ error() }}</div>
    }
    @if (success()) {
      <div class="alert alert-success">{{ success() }}</div>
    }

    <div class="card" style="margin-bottom: 1rem;">
      <h3>{{ editing() ? 'Editar servicio' : 'Nuevo servicio' }}</h3>
      <form [formGroup]="form" (ngSubmit)="save()">
        <div class="grid grid-2">
          <div class="form-group">
            <label>Nombre</label>
            <input type="text" formControlName="name" />
          </div>
          <div class="form-group">
            <label>Precio</label>
            <input type="number" step="0.01" min="0" formControlName="price" />
          </div>
          <div class="form-group">
            <label>Duración (horas)</label>
            <input type="number" min="1" formControlName="durationHours" />
          </div>
          <div class="form-group">
            <label>Activo</label>
            <select formControlName="active">
              <option [ngValue]="true">Sí</option>
              <option [ngValue]="false">No</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Descripción</label>
          <textarea rows="2" formControlName="description"></textarea>
        </div>
        <div class="row">
          <button type="submit" [disabled]="form.invalid || saving()">
            {{ saving() ? 'Guardando...' : (editing() ? 'Actualizar' : 'Crear') }}
          </button>
          @if (editing()) {
            <button type="button" class="secondary" (click)="resetForm()">Cancelar</button>
          }
        </div>
      </form>
    </div>

    <div class="card" style="padding: 0; overflow: hidden;">
      @if (loading()) {
        <p class="empty">Cargando...</p>
      } @else if (services().length === 0) {
        <p class="empty">No hay servicios registrados.</p>
      } @else {
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Duración</th>
              <th>Activo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @for (s of services(); track s.id) {
              <tr>
                <td>{{ s.id }}</td>
                <td>{{ s.name }}</td>
                <td>{{ s.price | currency:'USD':'symbol':'1.2-2' }}</td>
                <td>{{ s.durationHours }} h</td>
                <td>{{ s.active ? 'Sí' : 'No' }}</td>
                <td class="row" style="justify-content: flex-end;">
                  <button class="secondary" (click)="edit(s)">Editar</button>
                  <button class="danger" (click)="remove(s)">Eliminar</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      }
    </div>
  `,
  styles: [`
    h2 { margin-bottom: 0.3rem; }
    h3 { margin-bottom: 0.6rem; }
    .muted { color: var(--muted); margin-bottom: 1rem; }
  `]
})
export class AdminServicesComponent {
  private readonly api = inject(LaundryApiService);
  private readonly fb = inject(FormBuilder);

  protected readonly services = signal<LaundryService[]>([]);
  protected readonly editing = signal<LaundryService | null>(null);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly success = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    description: [''],
    price: [0, [Validators.required, Validators.min(0.01)]],
    durationHours: [1, [Validators.required, Validators.min(1)]],
    active: [true]
  });

  constructor() {
    this.load();
  }

  protected edit(service: LaundryService): void {
    this.editing.set(service);
    this.form.reset({
      name: service.name,
      description: service.description ?? '',
      price: Number(service.price),
      durationHours: service.durationHours,
      active: service.active
    });
  }

  protected resetForm(): void {
    this.editing.set(null);
    this.form.reset({ name: '', description: '', price: 0, durationHours: 1, active: true });
  }

  protected save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.error.set(null);
    this.success.set(null);

    const payload: LaundryServiceRequest = this.form.getRawValue();
    const editing = this.editing();
    const obs = editing ? this.api.update(editing.id, payload) : this.api.create(payload);

    obs.subscribe({
      next: () => {
        this.saving.set(false);
        this.success.set(editing ? 'Servicio actualizado' : 'Servicio creado');
        this.resetForm();
        this.load();
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err?.error?.message ?? 'No se pudo guardar el servicio');
      }
    });
  }

  protected remove(service: LaundryService): void {
    if (!confirm(`¿Eliminar el servicio "${service.name}"?`)) return;

    this.api.remove(service.id).subscribe({
      next: () => {
        this.success.set('Servicio eliminado');
        this.load();
      },
      error: (err) => this.error.set(err?.error?.message ?? 'No se pudo eliminar')
    });
  }

  private load(): void {
    this.loading.set(true);
    this.api.list(false).subscribe({
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
