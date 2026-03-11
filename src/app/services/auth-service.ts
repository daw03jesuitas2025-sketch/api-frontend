import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, finalize, switchMap, tap } from 'rxjs';

import { LoginResponse, User } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private api = 'http://localhost:8000/api';
  private userSubject = new BehaviorSubject<User | null>(null);
  private router = inject(Router);

  // Signal para estado de autenticación
  isLoggedIn = signal<boolean>(!!localStorage.getItem('access_token'));

  currentUser = signal<User | null>(this.getUserFromStorage());

  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  // Función auxiliar para recuperar el usuario de localStorage
  private getUserFromStorage(): User | null {
    const savedUser = localStorage.getItem('user_data');
    return savedUser ? JSON.parse(savedUser) : null;
  }

  login(credentials: { email: string; password: string }) {
    return this.http
      .post<LoginResponse>(`${this.api}/login`, credentials)
      .pipe(
        tap(res => this.storeTokens(res)),
        switchMap(() => this.getProfile())
      );
  }

  register(data: { name: string; email: string; password: string }) {
    return this.http.post(`${this.api}/register`, data);
  }

  logout() {
    return this.http.post(`${this.api}/logout`, {}).pipe(
      finalize(() => {
        this.limpiarSesionLocal();
      })
    );
  }

  getProfile() {
    return this.http
      .get<User>(`${this.api}/me`)
      .pipe(
        tap(user => {
          console.log('Usuario obtenido:', user);
          this.userSubject.next(user);
          this.currentUser.set(user);
          localStorage.setItem('user_data', JSON.stringify(user));
        })
      );
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  private storeTokens(res: LoginResponse) {
    console.log('LO QUE LLEGA DEL SERVIDOR:', res);
    localStorage.setItem('access_token', res.access_token);
    this.isLoggedIn.set(true);
  }

  limpiarSesionLocal() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');

    this.currentUser.set(null);
    this.userSubject.next(null);
    this.isLoggedIn.set(false);

    this.router.navigate(['/']);
  }

  getAccessToken() {
    return localStorage.getItem('access_token');
  }

  refreshToken() {
    return this.http.post<{ access_token: string }>(
      `${this.api}/refresh`,
      {}
    ).pipe(
      tap(res => {
        localStorage.setItem('access_token', res.access_token);
      })
    );
  }

  // ✅ MANTENIDO: Este es el método que te daba error de compilación
  loadUserIfNeeded() {
    if (this.getAccessToken() && !this.currentUser()) {
      this.getProfile().subscribe({
        error: () => this.limpiarSesionLocal()
      });
    }
  }

  private loadUserFromStorage() {
    const token = this.getAccessToken();

    if (!token) {
      this.limpiarSesionLocal();
      return;
    }

    this.getProfile().subscribe({
      next: () => {
        this.isLoggedIn.set(true);
      },
      error: () => {
        this.limpiarSesionLocal();
      }
    });
  }

}