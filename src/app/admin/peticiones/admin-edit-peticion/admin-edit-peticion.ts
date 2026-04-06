import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-edit-peticion',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './admin-edit-peticion.html',
  styleUrls: ['./admin-edit-peticion.css']
})
export class AdminEditPeticion implements OnInit {
  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  itemForm!: FormGroup;
  peticion = signal<any>(null);
  categorias = signal<any[]>([]);
  loading = signal(false);
  cargandoDatos = signal(true);
  errorMessage = signal('');

  // Gestión de imágenes nuevas
  selectedFiles: File[] = [];
  previewsNuevas = signal<string[]>([]);

  constructor() {
    this.initForm();
  }

  ngOnInit() {
    this.cargarCategorias();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarDatosPeticion(Number(id));
    }
  }

  private initForm() {
    this.itemForm = this.fb.group({
      title: ['', [Validators.required]],
      destinatary: ['', [Validators.required]],
      description: ['', [Validators.required]],
      category_id: ['', [Validators.required]],
      // IMPORTANTE: Solo usamos valores que tu BD acepta (pending/accepted)
      status: ['pending', [Validators.required]] 
    });
  }

  cargarCategorias() {
    this.adminService.getCategorias().subscribe({
      next: (cats: any[]) => this.categorias.set(cats),
      error: () => this.errorMessage.set('No se pudieron cargar las categorías')
    });
  }

  cargarDatosPeticion(id: number) {
    this.adminService.getPeticionById(id).subscribe({
      next: (res: any) => {
        const data = res.data || res;
        this.peticion.set(data);

        // Rellenar el formulario con los datos actuales de la BD
        this.itemForm.patchValue({
          title: data.title,
          destinatary: data.destinatary,
          description: data.description,
          category_id: data.category_id || data.category?.id,
          status: data.status
        });

        this.cargandoDatos.set(false);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage.set('Petición no encontrada en el sistema');
        this.cargandoDatos.set(false);
      }
    });
  }

  onFilesSelected(event: any) {
    const files = event.target.files;
    if (files) {
      for (let file of files) {
        this.selectedFiles.push(file);
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.previewsNuevas.update(prev => [...prev, e.target.result]);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  removeNewFiles() {
    this.selectedFiles = [];
    this.previewsNuevas.set([]);
  }

  onSubmit() {
    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const id = this.peticion().id;

    // Preparamos el FormData para enviar textos e imágenes
    const formData = new FormData();
    
    // Engañamos a Laravel para que acepte archivos en una actualización
    formData.append('_method', 'PUT');

    // Añadimos los campos del formulario
    formData.append('title', this.itemForm.value.title);
    formData.append('destinatary', this.itemForm.value.destinatary);
    formData.append('description', this.itemForm.value.description);
    formData.append('category_id', this.itemForm.value.category_id);
    formData.append('status', this.itemForm.value.status);

    // Añadimos las imágenes nuevas si las hay
    this.selectedFiles.forEach(file => {
      formData.append('files[]', file);
    });

    this.adminService.updatePeticionAdmin(id, formData).subscribe({
      next: () => {
        alert('Petición actualizada con éxito');
        this.router.navigate(['/admin']);
      },
      error: (err) => {
        console.error('Error en el servidor:', err);
        this.errorMessage.set('Error 500: Revisa que el estado sea "pending" o "accepted"');
        this.loading.set(false);
      }
    });
  }

  cancelar() {
    this.router.navigate(['/admin']);
  }
}