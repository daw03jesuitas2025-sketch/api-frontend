import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-register-component',
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './register-component.html',
  styleUrl: './register-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {

  formData = {
    name: '',
    email: '',
    password: '',
  };

  errorMessage = signal('');
  successMessage = signal('');
  isLoading = signal(false);

  constructor(
    private auth: AuthService,
    private router: Router
  ) { }

  register() {
    this.errorMessage.set('');
    this.successMessage.set('');
    this.isLoading.set(true);

    this.auth.register(this.formData).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set('¡Cuenta creada exitosamente! Redirigiendo al login...');

        // Esperar 2 segundos antes de redirigir
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        console.error('REGISTER ERROR', err);
        this.isLoading.set(false);

        if (err.status === 409 || err.status === 422) {
          this.errorMessage.set('Este correo electrónico ya está registrado.');
        } else if (err.status === 400) {
          this.errorMessage.set('Por favor, verifica que todos los campos sean válidos.');
        } else {
          this.errorMessage.set('Ocurrió un error al registrarse. Inténtalo luego.');
        }
      },
    });
  }

}
