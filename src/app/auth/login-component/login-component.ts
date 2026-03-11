import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login-component',
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './login-component.html',
  styleUrl: './login-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {

  email = '';
  password = '';
  errorMessage = '';

  private cdr = inject(ChangeDetectorRef)

  constructor(private auth: AuthService, private router: Router) { }

  login() {
    this.errorMessage = ''; 
    this.cdr.markForCheck();
    this.auth.login({ email: this.email, password: this.password })
      .subscribe({
        next: () => {
          this.router.navigate(['/peticiones']);
        },
        error: (err: HttpErrorResponse) => {
          console.error('LOGIN ERROR', err);
          if (err.status === 401) {
            this.errorMessage = 'El email o la contraseña son incorrectos.';
            this.password = ''; 
          } else {
            this.errorMessage = err.error.message
          }

          this.cdr.markForCheck();
        }
      });
  }


}

