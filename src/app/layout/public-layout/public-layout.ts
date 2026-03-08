import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './public-layout.html',
  styleUrl: './public-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicLayout {

  authService = inject(AuthService);
  router = inject(Router);

  // 🔥 Dropdown manual
  menuOpen = signal(false);

  logout() {
    this.authService.logout().subscribe(() => {
      this.menuOpen.set(false);
      this.router.navigate(['/login']);
    });
  }

  toggleMenu(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.menuOpen.update(v => !v);
  }

  closeMenu() {
    this.menuOpen.set(false);
  }

getUserInitial(): string {
  // 1. Detectamos el usuario actual desde el Signal del servicio
  const user = this.authService.currentUser();
  
  // 2. Si el sistema detecta el nombre, extrae la primera letra automáticamente
  if (user && user.name) {
    return user.name.charAt(0).toUpperCase();
  }
  
  // 3. Si aún no hay nada detectado, no devuelvas una 'U', devuelve vacío
  return ''; 
}
}
