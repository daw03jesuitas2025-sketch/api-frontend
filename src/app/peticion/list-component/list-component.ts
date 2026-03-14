import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, inject, OnInit, signal } from '@angular/core';
import { PeticionService } from '../../services/peticion-service';
import { AuthService } from '../../services/auth-service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Categoria, Peticion } from '../../models/peticion';
import { CategoriasService } from '../../services/categorias-service';
import { DatePipe, SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchService } from '../../services/search.service';


@Component({
  selector: 'app-list-component',
  standalone: true,
  imports: [DatePipe, RouterLink, FormsModule, SlicePipe],
  templateUrl: './list-component.html',
  styleUrl: './list-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListComponent implements OnInit {
  readonly API_URL = "http://localhost:8000/storage/";

  private peticionService = inject(PeticionService);
  private authService = inject(AuthService);
  private categoriaService = inject(CategoriasService);
  private cdr = inject(ChangeDetectorRef);
  private searchService = inject(SearchService);

  // Datos originales del servidor
  peticiones = signal<Peticion[]>([]);
  categorias = signal<Categoria[]>([]);
  public cargando: boolean = true;

  // Señales para los filtros vinculadas al HTML 
  filtroFirma = signal<string>('todas');
  filtroCategoria = signal<string>('todas');

  // Lógica de filtrado 
  // computed para actualizar los datos sin necesidad de recargar la página
  peticionesFiltradas = computed(() => {
    let resultado = this.peticiones();
    const busqueda = this.searchService.searchTerm().toLowerCase(); // Obtener el texto del navbar
    
    // Filtro por Título
    if (busqueda) {
      resultado = resultado.filter(p => 
        p.title.toLowerCase().includes(busqueda)
      );
    }

    // Filtro por Estado de Firmas 
    if (this.filtroFirma() === 'con_firmas') {
      resultado = resultado.filter(p => (p.signeds ?? 0) > 0);
    } else if (this.filtroFirma() === 'sin_firmas') {
      resultado = resultado.filter(p => (p.signeds ?? 0) === 0);
    }

    // Filtro por Categoría 
    if (this.filtroCategoria() !== 'todas') {
      resultado = resultado.filter(p => p.category_id === Number(this.filtroCategoria()));
    }
    return resultado;
  });

  // Contador de resultados dinámico 
  totalResultados = computed(() => this.peticionesFiltradas().length);

  ngOnInit(): void {
    this.getCategories();
    this.getPeticiones();
  }

  getPeticiones() {
    this.cargando = true;
    this.peticionService.fetchPeticiones().subscribe({
      next: (data) => {
        this.peticiones.set(data);
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al cargar peticiones:', err);
        this.cargando = false;
        this.cdr.markForCheck();
      }
    });
  }

  getCategories() {
    this.categoriaService.fetchCategorias().subscribe({
      next: res => {
        this.categorias.set(res.data);
        this.cdr.markForCheck();
      }
    });
  }

  esPropioPropietario(peticion: Peticion): boolean {
    return peticion.user_id === this.authService.currentUser()?.id;
  }

  delete(id: number) {
    if (confirm('¿Seguro que deseas eliminar esta petición?')) {
      this.peticionService.delete(id).subscribe({
        next: () => {
          this.peticiones.set(this.peticiones().filter(p => p.id !== id));
          this.cdr.markForCheck();
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