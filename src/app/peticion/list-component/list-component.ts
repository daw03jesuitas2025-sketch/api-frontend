import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, inject, OnInit, signal } from '@angular/core';
import { PeticionService } from '../../services/peticion-service';
import { AuthService } from '../../services/auth-service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Categoria, Peticion } from '../../models/peticion';
import { CategoriasService } from '../../services/categorias-service';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-list-component',
  imports: [DatePipe, RouterLink, FormsModule],
  templateUrl: './list-component.html',
  styleUrl: './list-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListComponent implements OnInit {

  readonly API_URL = "http://localhost:8000/storage/"

  peticionService = inject(PeticionService);
  router = inject(Router)

  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private categoriaService = inject(CategoriasService);
  private cdr = inject(ChangeDetectorRef)

  peticiones = signal<Peticion[]>([])
  categorias = signal<Categoria[]>([])

  totalResultados = computed(() => this.peticiones().length);

  esPropioPropietario(peticion: Peticion): boolean {
    const currentUserId = this.authService.currentUser()?.id;
    return peticion.user_id === currentUserId;
  }

  public cargando: boolean = true;

  ngOnInit(): void {
    this.getCategories()
    this.getPeticiones()
  }

  getPeticiones() {
    this.route.queryParams.subscribe(params => {

      if (this.peticiones().length === 0) {
        this.cargando = true
        this.cdr.markForCheck(); // ✅ IMPORTANTE
      }

      this.peticionService.fetchPeticiones().subscribe({
        next: (data) => {
          this.peticiones.set(data);
          this.cargando = false;

          this.cdr.markForCheck(); // ✅ IMPORTANTE
        },
        error: (err) => {
          console.error('Error al cargar peticiones:', err);
          this.cargando = false;

          this.cdr.markForCheck(); // ✅ IMPORTANTE
        }
      });
    });
  }

  getCategories() {
    this.categoriaService.fetchCategorias().subscribe({
      next: res => {
        this.categorias.set(res.data);
        this.cdr.markForCheck(); // ✅ IMPORTANTE
      },
      error: err => {
        console.log(err);
        this.cdr.markForCheck(); // ✅ IMPORTANTE
      }
    })
  }

  delete(id: number) {
    if (confirm('¿Seguro?')) {
      this.peticionService.delete(id).subscribe({
        error: (err) => {
          alert('No puedes borrar esto (quizás no eres el dueño)');
          this.cdr.markForCheck(); // ✅ IMPORTANTE
        },
        next: () => {
          const nuevasPeticiones = this.peticiones().filter(p => p.id !== id);
          this.peticiones.set(nuevasPeticiones);

          this.cdr.markForCheck(); // ✅ IMPORTANTE
        }
      });
    }
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

}
