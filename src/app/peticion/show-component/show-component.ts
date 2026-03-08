import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PeticionService } from '../../services/peticion-service';
import { AuthService } from '../../services/auth-service';
import { Peticion } from '../../models/peticion';

@Component({
  selector: 'app-show-component',
  imports: [RouterLink],
  templateUrl: './show-component.html',
  styleUrl: './show-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowComponent implements OnInit {

  private peticionService = inject(PeticionService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  authService = inject(AuthService);

  peticion = signal<Peticion | null>(null);
  loading = signal(true);
  currentUserId = signal<number | null>(null);
  readonly API_STORAGE = 'http://localhost:8000/storage/';

  haFirmado = signal<boolean>(false);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarPeticion(Number(id));
    }
    this.authService.user$.subscribe(user => {
      this.currentUserId.set(user ? user.id : null);
    });
    this.authService.loadUserIfNeeded();
  }

  cargarPeticion(id: number) {
    this.peticionService.getById(id).subscribe({
      next: (res: any) => {
        this.peticion.set(res.data ? res.data : res);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.router.navigate(['/peticiones']);
      }
    });
  }

  getImagenUrl(): string {
    const pet = this.peticion();
    if (pet?.files?.[0]?.file_path) {
      return `${this.API_STORAGE}${pet.files[0].file_path}`;
    }
    return 'assets/no-image.png';
  }

  delete() {
    const pet = this.peticion();
    if (!pet?.id) return;
    if (confirm('¿Eliminar petición?')) {
      this.peticionService.delete(pet.id).subscribe(() => {
        this.router.navigate(['/peticiones']);
      });
    }
  }

  esPropioPropietario(): boolean {
    const pet = this.peticion();
    const userId = this.currentUserId();
    return pet?.user_id === userId;
  }

  getEstadoClass(estado?: string): string {
    switch (estado) {
      case 'approved': return 'badge bg-success';
      case 'pending': return 'badge bg-warning text-dark';
      case 'rejected': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  }

  getEstadoTexto(estado?: string): string {
    switch (estado) {
      case 'approved': return 'Aprobada';
      case 'pending': return 'Pendiente';
      case 'rejected': return 'Rechazada';
      default: return 'Desconocido';
    }
  }

 firmarPeticion() {
  const pet = this.peticion();
  if (!pet?.id) return;

  this.peticionService.firmar(pet.id).subscribe({
    next: () => {
      const updatedPet: Peticion = {
        ...pet,
        signeds: (pet.signeds || 0) + 1,
        has_signed: true
      };
      this.peticion.set(updatedPet);
      alert('¡Gracias por firmar esta petición!');
    },
    error: (err) => {
      console.error('Error al firmar:', err);
      if (err.status === 403) {
        alert('Ya has firmado esta petición');
      } else {
        alert('No se pudo firmar la petición');
      }
    }
  });
}

firmada(): boolean {
  return this.peticion()?.has_signed || false;
}


}
