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

export const routes: Routes = [

  {
    path: '',
    component: PublicLayout,
    children: [
      {
        path: '',
        component: HomePages
      },
      {
        path: 'peticiones',
        component: ListComponent
      },
      {
        path: 'peticiones/editar/:id',
        canActivate: [authGuard],
        component: EditComponent
      },
      {
        path: 'peticiones/:id',
        component: ShowComponent
      },
      {
        path: 'mispeticiones',
        canActivate: [authGuard],
        component: ListMine
      },
      {
        path: 'misfirmas',
        canActivate: [authGuard],
        component: FirmadasComponent
      },
      {
        path: 'create',
        canActivate: [authGuard],
        component: CreateComponent
      },
      {
        path: 'login',
        component: LoginComponent
      },
      {
        path: 'register',
        component: RegisterComponent
      },
      {
        path: 'profile',
        canActivate: [authGuard],
        component: ProfileComponent
      },
      { path: '**', redirectTo: '' }

    ]
  }

];
