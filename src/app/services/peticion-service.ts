import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Peticion } from '../models/peticion';
import { map, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PeticionService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:8000/api/peticiones';

  #peticiones = signal<Peticion[]>([]);
  loading = signal<boolean>(false);
  allPeticiones = this.#peticiones.asReadonly();

  private getHeaders() {
    const token = localStorage.getItem('access_token'); 
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  fetchPeticiones() {
    this.loading.set(true);
    return this.http.get<{ data: Peticion[] }>(this.API_URL).pipe(
      map(res => res.data),
      tap(data => {
        this.#peticiones.set(data);
        this.loading.set(false);
      })
    );
  }

  // PÚBLICO
  getById(id: number) {
    return this.http.get<{ data: Peticion }>(`${this.API_URL}/${id}`).pipe(
      map(res => res.data)
    );
  }

  getMisPeticiones(): Observable<any> {
    return this.http.get(`http://localhost:8000/api/mispeticiones`);
  }

  getMisFirmas(): Observable<any> {
    return this.http.get(`http://localhost:8000/api/misfirmas`);
  }

  create(formData: FormData) {
    return this.http.post<{ data: Peticion }>(this.API_URL, formData).pipe(
      tap(res => {
        this.#peticiones.update(list => [res.data, ...list]);
      })
    );
  }

  update(id: number, formData: FormData) {
    formData.append('_method', 'PUT'); // [cite: 256]
    return this.http.post<{ data: Peticion }>(`${this.API_URL}/${id}`, formData).pipe(
      tap(res => {
        this.#peticiones.update(list =>
          list.map(p => p.id === id ? res.data : p)
        );
      })
    );
  }

  delete(id: number) {
    return this.http.delete(`${this.API_URL}/${id}`).pipe(
      tap(() => {
        this.#peticiones.update(list => list.filter(p => p.id !== id));
      })
    );
  }

  firmar(id: number) {
    return this.http.put<{ success: boolean; message: string }>(
      `${this.API_URL}/${id}/sign`,
      {}
    );
  }
}