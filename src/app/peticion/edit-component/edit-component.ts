import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PeticionService } from '../../services/peticion-service';
import { Categoria, Peticion } from '../../models/peticion';
import { CategoriasService } from '../../services/categorias-service';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-edit-component',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './edit-component.html',
  styleUrl: './edit-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditComponent implements OnInit {

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private peticionService = inject(PeticionService);
  private categoriaService = inject(CategoriasService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  readonly API_URL = 'http://localhost:8000/storage/';

  id = signal<number | null>(null);
  loading = signal(false);
  cargandoDatos = signal(true);
  categorias = signal<Categoria[]>([]);
  peticion = signal<Peticion | null>(null);
  
  // Manejo de múltiples archivos
  filesToUpload: File[] = [];
  previewsNuevas = signal<string[]>([]);
  errorMessage = signal<string>('');

  itemForm = this.fb.group({
    title: ['', [Validators.required]],
    description: ['', [Validators.required]],
    destinatary: ['', [Validators.required]],
    category_id: ['', [Validators.required]]
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.id.set(Number(idParam));
      this.cargarCategorias();
      this.cargarDatos(this.id()!);
    } else {
      this.router.navigate(['/peticiones']);
    }
  }

  cargarCategorias(): void {
    this.categoriaService.fetchCategorias().subscribe({
      next: (res) => this.categorias.set(res.data),
      error: (err) => console.error('Error al cargar categorías:', err)
    });
  }

  cargarDatos(id: number) {
    this.cargandoDatos.set(true);
    this.peticionService.getById(id).subscribe({
      next: (res: any) => {
        const data = res.data ? res.data : res;
        this.verificarPropietario(data as Peticion);
        this.peticion.set(data as Peticion);

        this.itemForm.patchValue({
          title: data.title,
          description: data.description,
          destinatary: data.destinatary,
          category_id: String(data.category_id)
        });

        this.cargandoDatos.set(false);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage.set('Error al cargar la petición');
        this.cargandoDatos.set(false);
      }
    });
  }

  onFilesSelected(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.filesToUpload = Array.from(files);
      this.previewsNuevas.set([]);

      // Generar previews para las imágenes nuevas
      this.filesToUpload.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.previewsNuevas.update(prev => [...prev, e.target.result]);
          this.cdr.detectChanges();
        };
        reader.readAsDataURL(file);
      });
    }
  }

  removeNewFiles(): void {
    this.filesToUpload = [];
    this.previewsNuevas.set([]);
  }

  onSubmit() {
    this.itemForm.markAllAsTouched();
    if (this.itemForm.invalid || !this.id()) {
      this.errorMessage.set('Por favor, completa todos los campos requeridos');
      return;
    }

    this.loading.set(true);
    const formData = new FormData();
    formData.append('title', this.itemForm.get('title')?.value || '');
    formData.append('description', this.itemForm.get('description')?.value || '');
    formData.append('destinatary', this.itemForm.get('destinatary')?.value || '');
    formData.append('category_id', this.itemForm.get('category_id')?.value || '');
    formData.append('_method', 'PUT'); 

    // Enviar el array de archivos nuevos
    this.filesToUpload.forEach(file => {
      formData.append('files[]', file, file.name);
    });

    this.peticionService.update(this.id()!, formData).subscribe({
      next: () => {
        alert('¡Petición actualizada exitosamente!');
        this.router.navigate(['/peticiones', this.id()]);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Error al actualizar');
        this.loading.set(false);
      }
    });
  }

  cancelar(): void {
    if (confirm('¿Estás seguro? Se perderán los cambios.')) {
      this.router.navigate(['/peticiones', this.id()]);
    }
  }

  verificarPropietario(peticion: Peticion): void {
    const currentUserId = this.authService.currentUser()?.id;
    if (peticion.user_id !== currentUserId) {
      this.router.navigate(['/peticiones', peticion.id]);
    }
  }
}