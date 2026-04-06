import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminService } from '../../../services/admin-service'; // Tu servicio de admin
import { Peticion } from '../../../models/peticion';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-show-peticion',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './admin-show-peticion.html',
  styleUrl: './admin-show-peticion.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminShowPeticion implements OnInit {
  private adminService = inject(AdminService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  peticion = signal<Peticion | null>(null);
  loading = signal(true);
  readonly API_STORAGE = 'http://localhost:8000/storage/';

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarPeticion(Number(id));
    }
  }

  cargarPeticion(id: number) {
    this.adminService.getPeticionById(id).subscribe({
      next: (res: any) => {
        // Ajustamos la respuesta según como la mande tu Laravel
        this.peticion.set(res.data ? res.data : res);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading admin petition', err);
        this.loading.set(false);
      }
    });
  }

  // Método para eliminar desde el panel de admin
  deleteAdmin() {
    const pet = this.peticion();
    if (!pet?.id) return;
    if (confirm('¿ESTÁ SEGURO? Como administrador eliminará esta petición permanentemente.')) {
      this.adminService.deletePeticionAdmin(pet.id).subscribe(() => {
        this.router.navigate(['/admin']);
      });
    }
  }
}