import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('access_token'); // Miramos el disco directamente

  if (!token) {
    console.log('Guard: No hay token en el disco, redirigiendo...');
    router.navigate(['/login']);
    return false;
  }
  
  return true; // Si hay token, entra sí o sí. Ya se encargará el Interceptor de echarlo si el token no vale.
};