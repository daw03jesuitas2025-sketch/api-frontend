import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Categoria } from '../models/peticion';

@Injectable({
  providedIn: 'root'
})
export class CategoriasService {

  constructor(private http: HttpClient) { }

  readonly API_URL = "http://localhost:8000/api/categorias"

  fetchCategorias(): Observable<{ data: Categoria[] }> {
    return this.http.get<{ data: Categoria[] }>(this.API_URL);
  }

}
