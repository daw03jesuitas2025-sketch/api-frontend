import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service'; 

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Comprobamos si el usuario es administrador 
  if (authService.isAdmin()) {
    return true; // Acceso permitido 
  }

  // Si no es admin, lo mandamos a la página principal 
  console.warn('Acceso denegado: Se requieren permisos de administrador');
  router.navigate(['/']);
  return false; // Bloqueamos la navegación 
};