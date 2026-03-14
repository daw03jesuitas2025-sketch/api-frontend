import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject, Injector } from '@angular/core';
import { AuthService } from '../services/auth-service';
import { catchError, throwError } from 'rxjs';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. Inyectamos el Injector en lugar del AuthService directamente
  const injector = inject(Injector);
  
  // 2. Obtenemos el token manualmente del localStorage para no depender del servicio al inicio
  const token = localStorage.getItem('access_token');

  let request = req;
  if (token) {
    request = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(request).pipe(
    catchError((err: HttpErrorResponse) => {
      // 3. Si hay error, pedimos el AuthService al injector "bajo demanda"
      const auth = injector.get(AuthService);

      if (err.status === 403) {
        console.warn('Error 403 detectado. Sin permisos, pero mantenemos sesión.');
        return throwError(() => err);
      }

      if (err.status === 401) {
        console.error('Error 401 detectado.');
        auth.limpiarSesionLocal(); 
        return throwError(() => err);
      }

      return throwError(() => err);
    })
  );
};