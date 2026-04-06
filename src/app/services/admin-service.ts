import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Peticion } from '../models/peticion';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);

  // URLs para las distintas secciones del panel
  private readonly API_ADMIN_URL = 'http://localhost:8000/api/admin/peticiones';
  private readonly API_USERS_URL = 'http://localhost:8000/api/admin/users';

  // --- GESTIÓN DE PETICIONES ---

  getPeticionesAdmin(): Observable<Peticion[]> {
    return this.http.get<{ success: boolean, data: Peticion[] }>(this.API_ADMIN_URL).pipe(
      map(res => res.data)
    );
  }
  // Obtiene los datos detallados de una petición específica por su ID
  getPeticionById(id: number): Observable<any> {
    return this.http.get<any>(`${this.API_ADMIN_URL}/${id}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
  }
  // Elimina una petición de la base de datos
  deletePeticionAdmin(id: number): Observable<any> {
    return this.http.delete(`${this.API_ADMIN_URL}/${id}`);
  }

  
   // Obtiene todos los usuarios con conteo de peticiones y firmas
  
  getUsersAdmin(): Observable<any> {
    return this.http.get(this.API_USERS_URL);
  }

  /**
   * Obtiene el detalle de un usuario específico
   */
  getUserAdmin(id: number): Observable<any> {
    return this.http.get(`${this.API_USERS_URL}/${id}`);
  }

  /**
   * Actualiza los datos de un usuario (Nombre, Email, Rol, Password)
   */
  updateUserAdmin(id: number, data: any): Observable<any> {
    // Usamos PUT para enviar datos de texto plano según la arquitectura definida
    return this.http.put(`${this.API_USERS_URL}/${id}`, data);
  }

  /**
   * Elimina un usuario si no tiene peticiones o firmas
   */
  deleteUserAdmin(id: number): Observable<any> {
    return this.http.delete(`${this.API_USERS_URL}/${id}`);
  }
// Actualiza una petición (título, descripción, imagen, etc.) usando FormData
  updatePeticionAdmin(id: number, data: FormData): Observable<any> {
    return this.http.post(`${this.API_ADMIN_URL}/${id}`, data);
  }

  getCategorias(): Observable<any[]> {
    // Asegúrate de que esta URL devuelva las categorías de tu Laravel
    return this.http.get<any>('http://localhost:8000/api/categorias').pipe(
      map(res => res.data || res)
    );
  }

  // Categorias
  private readonly API_CATEGORIAS_URL = 'http://localhost:8000/api/admin/categorias';

getCategoriasAdmin(): Observable<any> {
  return this.http.get(this.API_CATEGORIAS_URL);
}



createCategoriaAdmin(data: { name: string }): Observable<any> {
  return this.http.post(this.API_CATEGORIAS_URL, data);
}

updateCategoriaAdmin(id: number, data: { name: string }): Observable<any> {
  return this.http.put(`${this.API_CATEGORIAS_URL}/${id}`, data);
}

deleteCategoriaAdmin(id: number): Observable<any> {
  return this.http.delete(`${this.API_CATEGORIAS_URL}/${id}`);
}

}