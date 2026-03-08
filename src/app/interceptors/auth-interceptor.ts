import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth-service';
import { catchError, switchMap, throwError } from 'rxjs';


// añade automáticamente el token JWT en la cabecera Authorization en todas las peticiones, si el usuario está logueado.

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {

  const auth = inject(AuthService);

  const token = auth.getAccessToken();

  // 1) Añadir token si existe
  let request = req;

  if (token) {
    request = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(request).pipe(
    catchError((err: HttpErrorResponse) => {

      // Si falla login, no intentamos refresh
      if (req.url.includes('/login') && err.status === 401) {
        return throwError(() => err);
      }

      // Si falla refresh, logout directo
      if (req.url.includes('/refresh')) {
        auth.logout().subscribe(); // limpia sesión
        return throwError(() => err);
      }

      // ✅ Si es 401 estándar, refrescar token
      if (err.status === 401) {
        return auth.refreshToken().pipe(
          switchMap((res: any) => {

            // Guardar token nuevo
            localStorage.setItem('access_token', res.access_token);

            // Reintentar request original
            const newReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${res.access_token}`
              }
            });

            return next(newReq);
          }),
          catchError((refreshErr) => {
            auth.logout().subscribe();
            return throwError(() => refreshErr);
          })
        );
      }

      return throwError(() => err);
    })
  );
};
