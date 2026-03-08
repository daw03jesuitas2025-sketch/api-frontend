import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PeticionService } from '../../services/peticion-service';
import { Router, RouterModule } from '@angular/router';
import { CategoriasService } from '../../services/categorias-service';
import { Categoria } from '../../models/peticion';

@Component({
  selector: 'app-create-component',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './create-component.html',
  styleUrl: './create-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateComponent implements OnInit {

  private fb = inject(FormBuilder);
  private peticionService = inject(PeticionService);
  private router = inject(Router);
  private categoriaService = inject(CategoriasService);

  loading = signal(false);
  filesToUpload: File[] = []; // array para subida múltiple
  categorias = signal<Categoria[]>([]);
  errorMessage = signal<string>('');

  ngOnInit(): void {
    this.cargarCategorias();
  }

  itemForm = this.fb.group({
    title: ['', [Validators.required]],
    description: ['', [Validators.required]],
    destinatary: ['', [Validators.required]],
    category_id: ['', [Validators.required]]
  });

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      // Convertimos el FileList a un array de JavaScript 
      this.filesToUpload = Array.from(input.files);
    }
  }

  removeFiles(): void {
    this.filesToUpload = [];
  }

  cargarCategorias(): void {
    this.categoriaService.fetchCategorias().subscribe({
      next: (res) => {
        this.categorias.set(res.data);
      },
      error: (err) => {
        console.error('Error al cargar categorías:', err);
      }
    });
  }

  onSubmit() {
    this.itemForm.markAllAsTouched();

    if (this.itemForm.invalid) {
      this.errorMessage.set('Por favor, completa todos los campos requeridos');
      return;
    }

    if (this.filesToUpload.length === 0) {
      this.errorMessage.set('Por favor, selecciona al menos una imagen');
      return;
    }

    this.loading.set(true);
    const formData = new FormData();
    
    // Mapeo de campos 
    formData.append('title', this.itemForm.value.title!);
    formData.append('description', this.itemForm.value.description!);
    formData.append('destinatary', this.itemForm.value.destinatary!);
    formData.append('category_id', this.itemForm.value.category_id!);

    // Iteramos sobre el array de archivos usando 'files[]' 
    for (let i = 0; i < this.filesToUpload.length; i++) {
      formData.append('files[]', this.filesToUpload[i], this.filesToUpload[i].name);
    }

    this.peticionService.create(formData).subscribe({
      next: () => this.router.navigate(['/mispeticiones']),
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error.message || 'Error al crear la petición');
      }
    });
  }
}