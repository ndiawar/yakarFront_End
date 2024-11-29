import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AdminPageComponent } from './components/pages/admin-page/admin-page.component';
import { LogsComponent } from './components/pages/logs/logs.component';
import { UserPageComponent } from './components/pages/user-page/user-page.component';
import { UtilisateursComponent } from './components/pages/utilisateurs/utilisateurs.component';
import { AdminGuard } from './guards/admin.guard'; // Import du guard Admin
import { UserGuard } from './guards/user.guard'; // Import du guard User

export const routes: Routes = [
  // Page d'accueil par défaut (LoginComponent)
  { path: '', component: LoginComponent },  // Page de login par défaut

  // Pages de connexion et d'inscription
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Pages spécifiques (Admin, Utilisateurs, Logs, etc.)
  { 
    path: 'admin', 
    component: AdminPageComponent, 
    canActivate: [AdminGuard]  // Protège la route admin avec AdminGuard
  },  
  { 
    path: 'logs', 
    component: LogsComponent, 
    canActivate: [AdminGuard]  // Protège la route logs (accessible par admin uniquement)
  },
  { 
    path: 'user', 
    component: UserPageComponent, 
    canActivate: [UserGuard]  // Protège la route user avec UserGuard
  },
  { 
    path: 'utilisateurs', 
    component: UtilisateursComponent, 
    canActivate: [AdminGuard]  // Protège la route utilisateurs avec AdminGuard
  },

  // Gestion des routes non trouvées (Erreur 404)
  { path: '**', redirectTo: '' }  // Redirige vers la page d'accueil (login) si la route est incorrecte
];
