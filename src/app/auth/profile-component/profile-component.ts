import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { Router, RouterLink } from '@angular/router';
import { User } from '../../models/auth.model';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-component',
  imports: [RouterLink, CommonModule],
  templateUrl: './profile-component.html',
  styleUrl: './profile-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent implements OnInit {

  user$: Observable<User | null>;
  constructor(
    private auth: AuthService,
    private router: Router
  ) {
    // Enlazamos el observable del servicio directamente
    this.user$ = this.auth.user$;
  }

  ngOnInit(): void {
    // Si recargamos página en /profile, esto asegura que se pidan los datos
    this.auth.loadUserIfNeeded();
  }
  logout() {

    this.auth.logout().subscribe(() => this.router.navigate(['/login']));
  }

}
