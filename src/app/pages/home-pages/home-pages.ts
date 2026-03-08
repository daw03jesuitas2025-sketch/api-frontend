import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { PeticionService } from '../../services/peticion-service';
import { CategoriasService } from '../../services/categorias-service';
import { Router, RouterLink } from '@angular/router';
import { Categoria, Peticion } from '../../models/peticion';

@Component({
  selector: 'app-home-pages',
  imports: [RouterLink],
  templateUrl: './home-pages.html',
  styleUrl: './home-pages.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePages implements OnInit {

  private peticionService = inject(PeticionService);
  private categoriaService = inject(CategoriasService);
  private router = inject(Router);

  readonly API_URL = "http://localhost:8000/storage/";

  peticiones = signal<Peticion[]>([]);
  categorias = signal<Categoria[]>([]);
  categoriaSeleccionada = signal<number | null>(null);
  cargando = signal<boolean>(true);

  peticionesFiltradas = computed(() => {
    const catId = this.categoriaSeleccionada();
    if (!catId) {
      return this.peticiones().slice(0, 8);
    }
    return this.peticiones()
      .filter(p => p.category_id === catId)
      .slice(0, 8);
  });

  ngOnInit(): void {
    this.cargarCategorias();
    this.cargarPeticiones();
  }

  cargarPeticiones(): void {
    this.cargando.set(true);
    this.peticionService.fetchPeticiones().subscribe({
      next: (data) => {
        this.peticiones.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar peticiones:', err);
        this.cargando.set(false);
      }
    });
  }

  cargarCategorias(): void {
    this.categoriaService.fetchCategorias().subscribe({
      next: (res) => {
        this.categorias.set(res.data);
      },
      error: (err) => console.error('Error al cargar categorías:', err)
    });
  }

  filtrarPorCategoria(categoriaId: number | null): void {
    this.categoriaSeleccionada.set(categoriaId);
  }

  getImagenUrl(peticion: Peticion): string {
    if (peticion?.files?.[0]?.file_path) {
      return `${this.API_URL}${peticion.files[0].file_path}`;
    }
    return 'assets/no-image.png';
  }

}
