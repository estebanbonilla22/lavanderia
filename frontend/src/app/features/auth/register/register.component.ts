import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-wrapper">
      <div class="card auth-card">
        <h2>Crear cuenta</h2>
        <p class="muted">Regístrate para empezar a usar la plataforma.</p>

        @if (error()) {
          <div class="alert alert-error">{{ error() }}</div>
        }

        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="form-group">
            <label for="username">Usuario</label>
            <input id="username" type="text" formControlName="username" autocomplete="username" />
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input id="email" type="email" formControlName="email" autocomplete="email" />
          </div>
          <div class="form-group">
            <label for="password">Contraseña (mínimo 6 caracteres)</label>
            <input id="password" type="password" formControlName="password" autocomplete="new-password" />
          </div>
          <button type="submit" [disabled]="form.invalid || loading()" style="width: 100%;">
            {{ loading() ? 'Creando...' : 'Registrarme' }}
          </button>
        </form>

        <p class="muted" style="margin-top: 1rem; text-align: center;">
          ¿Ya tienes cuenta? <a routerLink="/login">Inicia sesión</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
      background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
    }
    .auth-card { width: 100%; max-width: 420px; }
    h2 { margin-bottom: 0.4rem; }
    .muted { color: var(--muted); margin-bottom: 1rem; }
  `]
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  protected submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);

    this.auth.register(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'No se pudo crear la cuenta');
      }
    });
  }
}
