import { Routes } from '@angular/router';
import { PublicLayout } from './layout/public-layout/public-layout';
import { HomePages } from './pages/home-pages/home-pages';
import { ListComponent } from './peticion/list-component/list-component';
import { ShowComponent } from './peticion/show-component/show-component';
import { CreateComponent } from './peticion/create-component/create-component';
import { authGuard } from './guards/auth-guard';
import { EditComponent } from './peticion/edit-component/edit-component';
import { LoginComponent } from './auth/login-component/login-component';
import { RegisterComponent } from './auth/register-component/register-component';
import { ProfileComponent } from './auth/profile-component/profile-component';
import { ListMine } from './peticion/list-mine/list-mine';
import { FirmadasComponent } from './peticion/firmadas-component/firmadas-component';
import { adminGuard } from './guards/admin-guard';
import { PanelComponent } from './admin/panel/panel-component/panel-component';
import { AdminEditPeticion} from './admin/peticiones/admin-edit-peticion/admin-edit-peticion';
import { AdminShowPeticion } from './admin/peticiones/admin-show-peticion/admin-show-peticion';
import { AdminEditUser } from './admin/users/admin-edit-user/admin-edit-user';
import { AdminShowUser } from './admin/users/admin-show-user/admin-show-user';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayout,
    children: [
      // --- RUTAS PÚBLICAS Y DE USUARIO ---
      { path: '', component: HomePages },
      { path: 'peticiones', component: ListComponent },
      { path: 'peticiones/editar/:id', canActivate: [authGuard], component: EditComponent },
      { path: 'peticiones/:id', component: ShowComponent },
      { path: 'mispeticiones', canActivate: [authGuard], component: ListMine },
      { path: 'misfirmas', canActivate: [authGuard], component: FirmadasComponent },
      { path: 'create', canActivate: [authGuard], component: CreateComponent },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'profile', canActivate: [authGuard], component: ProfileComponent },

      // --- SECCIÓN ADMINISTRACIÓN (Prefijo /admin) ---
      {
        path: 'admin',
        canActivate: [adminGuard],
        children: [
          // Dashboard principal
          { path: '', component: PanelComponent },

          // Gestión de Peticiones
          { path: 'peticiones', component: PanelComponent }, // Lista
          { path: 'peticiones/:id', component: AdminShowPeticion }, // Ver detalle
          { path: 'peticiones/edit/:id', component: AdminEditPeticion }, // Editar

          // Gestión de Usuarios
          { path: 'users', component: PanelComponent }, // Lista
          { path: 'users/:id', component: AdminShowUser }, // Ver detalle
          { path: 'users/edit/:id', component: AdminEditUser }, // Editar

          // Gestión de Categorías
          { path: 'categorias', component: PanelComponent }
        ]
      },

      // Redirección por defecto
      { path: '**', redirectTo: '' }
    ]
  }
];