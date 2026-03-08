import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { PeticionService } from '../../services/peticion-service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-firmadas-component',
  imports: [RouterLink],
  templateUrl: './firmadas-component.html',
  styleUrl: './firmadas-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FirmadasComponent implements OnInit {

  readonly API_URL = "http://localhost:8000/storage/"


  peticiones = signal<any[]>([]);
  loading = signal<boolean>(true);
  errorMessage = signal<string>('');

  constructor(private peticionService: PeticionService) { }

  ngOnInit(): void {
    this.cargarMisFirmas();
  }

  cargarMisFirmas(): void {
    this.loading.set(true);
    this.peticionService.getMisFirmas().subscribe({
      next: (response) => {
        this.peticiones.set(response.data || []);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error:', error);
        this.errorMessage.set('Error al cargar las peticiones firmadas');
        this.loading.set(false);
      }
    });
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  formatearFechaRelativa(fecha: string): string {
    const date = new Date(fecha);
    const ahora = new Date();
    const dias = Math.floor((ahora.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (dias === 0) return 'Hoy';
    if (dias === 1) return 'Ayer';
    if (dias < 7) return `Hace ${dias} días`;
    if (dias < 30) return `Hace ${Math.floor(dias / 7)} semanas`;
    if (dias < 365) return `Hace ${Math.floor(dias / 30)} meses`;
    return this.formatearFecha(fecha);
  }

}
