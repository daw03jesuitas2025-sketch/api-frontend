import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { Peticion } from '../../models/peticion';
import { PeticionService } from '../../services/peticion-service';
import { AuthService } from '../../services/auth-service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-list-mine',
  imports: [RouterLink],
  templateUrl: './list-mine.html',
  styleUrl: './list-mine.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListMine implements OnInit {


  readonly API_URL = "http://localhost:8000/storage/"

  peticiones = signal<Peticion[]>([]);
  loading = signal<boolean>(true);
  errorMessage = signal<string>('');

  constructor(
    private peticionService: PeticionService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarMisPeticiones();
  }

  cargarMisPeticiones(): void {
    this.loading.set(true);
    this.peticionService.getMisPeticiones().subscribe({
      next: (response) => {
        this.peticiones.set(response.data || []);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar peticiones:', error);
        this.errorMessage.set('Error al cargar tus peticiones');
        this.loading.set(false);
      }
    });
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

  eliminarPeticion(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta petición?')) {
      this.peticionService.delete(id).subscribe({
        next: () => {
          // Recargar la lista después de eliminar
          this.cargarMisPeticiones();
        },
        error: (error) => {
          console.error('Error al eliminar:', error);
          alert('Error al eliminar la petición');
        }
      });
    }
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

getImagenUrl(peticion: Peticion): string {
  if (peticion.files && peticion.files.length > 0) {
    // Obtenemos el último índice del array 
    const ultimoIndice = peticion.files.length - 1;
    const path = peticion.files[ultimoIndice].file_path;
    // Retornamos la URL completa concatenando el almacenamiento 
    return `${this.API_URL}${path}`;
  }
  return 'assets/no-image.png'; 
}



}
