import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../services/admin-service';

@Component({
  selector: 'app-admin-edit-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './admin-edit-user.html'
})
export class AdminEditUser implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);

  id = signal<number | null>(null);
  loading = signal(false);
  errorMessage = signal('');

  userForm = this.fb.group({
    name:     ['', [Validators.required]],
    email:    ['', [Validators.required, Validators.email]],
    role:     ['', [Validators.required]],
    password: ['']
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.id.set(Number(idParam));
      this.cargarDatos(this.id()!);
    }
  }

  cargarDatos(id: number) {
    this.adminService.getUserAdmin(id).subscribe({
      next: (res: any) => {
        const data = res.data ? res.data : res;
        this.userForm.patchValue({
          name:     data.name,
          email:    data.email,
          role:     data.role,
          password: ''
        });
      },
      error: (err) => console.error('Error al cargar datos del usuario', err)
    });
  }

  onSubmit() {
    if (this.userForm.invalid || !this.id()) return;
    this.loading.set(true);
    this.errorMessage.set('');

    const formValues = this.userForm.value;
    const payload: any = {
      name:  formValues.name,
      email: formValues.email,
      role:  formValues.role
    };

    if (formValues.password && formValues.password.trim() !== '') {
      payload.password = formValues.password;
    }

    this.adminService.updateUserAdmin(this.id()!, payload).subscribe({
      next: () => {
        this.router.navigate(['/admin']);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Error al guardar los cambios.');
        this.loading.set(false);
      }
    });
  }
}