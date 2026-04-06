import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../services/admin-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-panel',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './panel-component.html',
  styleUrls: ['./panel-component.css']
})
export class PanelComponent implements OnInit {
  private adminService = inject(AdminService);
  private router = inject(Router);

  // SEÑALES (SIGNALS)
  seccionActiva = signal<string>('peticiones');

  // Peticiones
  peticiones = signal<any[]>([]);
  cargando = signal<boolean>(false);

  // Usuarios
  usuarios = signal<any[]>([]);
  cargandoUsuarios = signal<boolean>(false);
  // Categorías
  categorias = signal<any[]>([]);
  cargandoCategorias = signal<boolean>(false);
  editandoCategoria = signal<any>(null);
  nuevaCategoriaName = signal<string>('');
  errorCategorias = signal<string>('');

ngOnInit() {
  const url = this.router.url;
  if (url.includes('users')) {
    this.cambiarSeccion('users');
  } else if (url.includes('categorias')) {
    this.cambiarSeccion('categorias');
  } else {
    this.cambiarSeccion('peticiones');
  }
}

cambiarSeccion(seccion: string) {
  this.seccionActiva.set(seccion);
    this.router.navigate(['/admin/' + seccion]);
  
  if (seccion === 'users') {
    this.cargarUsuarios();
  } else if (seccion === 'categorias') {
    this.cargarCategorias();
  } else {
    this.cargarDatos(); // Peticiones
  }
}
  // Carga de Peticiones 
  cargarDatos() {
    this.cargando.set(true);
    this.adminService.getPeticionesAdmin().subscribe({
      next: (res: any) => {
        this.peticiones.set(res.data ? res.data : res);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }

  // Carga de Usuarios 
  cargarUsuarios() {
    this.cargandoUsuarios.set(true);
    this.adminService.getUsersAdmin().subscribe({
      next: (res: any) => {
        this.usuarios.set(res.data ? res.data : res);
        this.cargandoUsuarios.set(false);
      },
      error: (err) => {
        console.error('Error cargando usuarios', err);
        this.cargandoUsuarios.set(false);
      }
    });
  }

  eliminarPeticion(id: number) {
    if (confirm('¿Estás seguro de eliminar esta petición?')) {
      this.adminService.deletePeticionAdmin(id).subscribe({
        next: () => {
          this.peticiones.update(list => list.filter(p => p.id !== id));
        }
      });
    }
  }

  // Función para eliminar usuarios con control de errores
  eliminarUsuario(id: number) {
    if (confirm('¿Estás seguro? Esta acción eliminará al usuario permanentemente.')) {
      this.adminService.deleteUserAdmin(id).subscribe({
        next: () => {
          this.usuarios.update(users => users.filter(u => u.id !== id));
          alert('Usuario eliminado con éxito.');
        },
        error: (err: { error: { message: any; }; }) => {
          // Si Laravel nos devuelve el error 403 por tener firmas/peticiones, lo mostramos
          if (err.error && err.error.message) {
            alert(err.error.message);
          } else {
            alert('Hubo un error al intentar eliminar el usuario.');
          }
        }
      });
    }
  }

  // categorias 
  cargarCategorias() {
    this.cargandoCategorias.set(true);
    this.adminService.getCategoriasAdmin().subscribe({
      next: (res: any) => {
        this.categorias.set(res.data ? res.data : res);
        this.cargandoCategorias.set(false);
      },
      error: () => this.cargandoCategorias.set(false)
    });
  }

  guardarCategoria() {
    const name = this.nuevaCategoriaName().trim();
    if (!name) return;
    this.errorCategorias.set('');

    const editando = this.editandoCategoria();

    if (editando) {
      this.adminService.updateCategoriaAdmin(editando.id, { name }).subscribe({
        next: (res: any) => {
          this.categorias.update(cats =>
            cats.map(c => c.id === editando.id ? res.data : c)
          );
          this.cancelarEdicion();
        },
        error: (err) => this.errorCategorias.set(err.error?.message || 'Error al actualizar.')
      });
    } else {
      this.adminService.createCategoriaAdmin({ name }).subscribe({
        next: () => {
          this.nuevaCategoriaName.set('');
          this.cargarCategorias();
        },
        error: (err) => this.errorCategorias.set(err.error?.message || 'Error al crear.')
      });
    }
  }
  editarCategoria(cat: any) {
    this.editandoCategoria.set(cat);
    this.nuevaCategoriaName.set(cat.name);
    this.errorCategorias.set('');
  }

  cancelarEdicion() {
    this.editandoCategoria.set(null);
    this.nuevaCategoriaName.set('');
    this.errorCategorias.set('');
  }

  eliminarCategoria(id: number) {
    if (confirm('¿Eliminar esta categoría? Solo es posible si no tiene peticiones.')) {
      this.adminService.deleteCategoriaAdmin(id).subscribe({
        next: () => this.categorias.update(cats => cats.filter(c => c.id !== id)),
        error: (err) => alert(err.error?.message || 'Error al eliminar.')
      });
    }
  }
}