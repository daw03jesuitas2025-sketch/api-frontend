import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  // Señal que guarda el texto que el usuario escribe en el buscador
  searchTerm = signal<string>('');

  updateSearch(value: string) {
    this.searchTerm.set(value);
  }
}