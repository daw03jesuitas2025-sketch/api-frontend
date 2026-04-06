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

  isLoggedIn = signal<boolean>(!!localStorage.getItem('access_token'));
  currentUser = signal<User | null>(this.getUserFromStorage());
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    const token = this.getAccessToken();
    if (token) {
      this.getProfile().subscribe();
    }
  }

  private getUserFromStorage(): User | null {
    const savedUser = localStorage.getItem('user_data');
    return savedUser ? JSON.parse(savedUser) : null;
  }

  login(credentials: { email: string; password: string }) {
    return this.http
      .post<LoginResponse>(`${this.api}/login`, credentials)
      .pipe(
        tap(res => {
          console.log('LO QUE LLEGA DEL SERVIDOR:', res);
          this.storeTokens(res);
        }),
        switchMap(() => this.getProfile())
      );
  }

  register(data: any) {
    return this.http.post(`${this.api}/register`, data);
  }

  getProfile() {
    return this.http.get<User>(`${this.api}/me`).pipe(
      tap(user => {
        console.log('Usuario obtenido:', user);
        this.userSubject.next(user);
        this.currentUser.set(user);
        localStorage.setItem('user_data', JSON.stringify(user));
      })
    );
  }

  private storeTokens(res: LoginResponse) {
    localStorage.setItem('access_token', res.access_token);
    this.isLoggedIn.set(true);
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  getAccessToken() {
    return localStorage.getItem('access_token');
  }

  limpiarSesionLocal() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    this.currentUser.set(null);
    this.userSubject.next(null);
    this.isLoggedIn.set(false);
  }

  logout() {
    return this.http.post(`${this.api}/logout`, {}).pipe(
      finalize(() => {
        this.limpiarSesionLocal();
        this.router.navigate(['/login']);
      })
    );
  }

  loadUserIfNeeded() {
    if (this.getAccessToken() && !this.currentUser()) {
      this.getProfile().subscribe();
    }
  }

  refreshToken() {
    return this.http.post<{ access_token: string }>(`${this.api}/refresh`, {}).pipe(
      tap(res => localStorage.setItem('access_token', res.access_token))
    );
  }
  // Comprueba si el usuario logueado tiene el rol de administrador.
  isAdmin(): boolean {
    return (this.currentUser() as any)?.role === 'admin';
  }
}