import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, inject, OnInit, signal, effect } from '@angular/core';
import { PeticionService } from '../../services/peticion-service';
import { AuthService } from '../../services/auth-service';
import { RouterLink } from '@angular/router';
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

  // Datos originales
  peticiones = signal<Peticion[]>([]);
  categorias = signal<Categoria[]>([]);
  public cargando: boolean = true;

  // Señales para los filtros
  filtroFirma = signal<string>('todas');
  filtroCategoria = signal<string>('todas');

  // --- 1. NUEVAS VARIABLES PARA PAGINACIÓN ---
  paginaActual = signal<number>(1); 
  itemsPorPagina = 6; 

  constructor() {
    // Resetear a página 1 cuando cambie cualquier filtro o búsqueda
    effect(() => {
      this.peticionesFiltradas();
      this.searchService.searchTerm();
      this.paginaActual.set(1);
    }, { allowSignalWrites: true });
  }

  // Lógica de filtrado (peticionesFiltradas)
  peticionesFiltradas = computed(() => {
    let resultado = this.peticiones();
    const busqueda = this.searchService.searchTerm().toLowerCase();
    
    if (busqueda) {
      resultado = resultado.filter(p => p.title.toLowerCase().includes(busqueda));
    }

    if (this.filtroFirma() === 'con_firmas') {
      resultado = resultado.filter(p => (p.signeds ?? 0) > 0);
    } else if (this.filtroFirma() === 'sin_firmas') {
      resultado = resultado.filter(p => (p.signeds ?? 0) === 0);
    }

    if (this.filtroCategoria() !== 'todas') {
      resultado = resultado.filter(p => p.category_id === Number(this.filtroCategoria()));
    }
    return resultado;
  });

  // --- 2. NUEVO COMPUTADO: TOTAL PÁGINAS ---
  totalPaginas = computed(() => {
    const totalItems = this.peticionesFiltradas().length; 
    return Math.ceil(totalItems / this.itemsPorPagina); 
  });

  // --- 3. NUEVO COMPUTADO: ARRAY RECORTADO ---
  peticionesPaginadas = computed(() => {
    const pagina = this.paginaActual(); 
    const lista = this.peticionesFiltradas(); 
    const indiceInicio = (pagina - 1) * this.itemsPorPagina; 
    const indiceFin = indiceInicio + this.itemsPorPagina; 
    
    return lista.slice(indiceInicio, indiceFin); 
  });

  totalResultados = computed(() => this.peticionesFiltradas().length);

  ngOnInit(): void {
    this.getCategories();
    this.getPeticiones();
  }

  // --- 4. MÉTODO PARA CAMBIAR DE PÁGINA ---
  irAPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas()) { 
      this.paginaActual.set(pagina); //
      window.scrollTo({ top: 0, behavior: 'smooth' }); 
    }
  }

  getPeticiones() {
    this.cargando = true;
    this.peticionService.fetchPeticiones().subscribe({
      next: (data) => {
        this.peticiones.set(data);
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: () => {
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