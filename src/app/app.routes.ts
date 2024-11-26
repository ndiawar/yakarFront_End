import { Routes } from '@angular/router';

// Importation des composants
import { LoginComponent } from './components/login /login.component';
import { RegisterComponent } from './components/register/register.component';
import { AdminPageComponent } from './components/pages/admin-page/admin-page.component';
import { LogsComponent } from './components/pages/logs/logs.component';
import { UserPageComponent } from './components/pages/user-page/user-page.component';
import { UtilisateursComponent } from './components/pages/utilisateurs/utilisateurs.component';

export const routes: Routes = [
  // Page d'accueil par défaut (LoginComponent)
  { path: '', component: LoginComponent },

  // Pages de connexion et d'inscription
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Pages spécifiques (Admin, Utilisateurs, Logs, etc.)
  { path: 'admin', component: AdminPageComponent },
  { path: 'logs', component: LogsComponent },
  { path: 'user', component: UserPageComponent },
  { path: 'utilisateurs', component: UtilisateursComponent },

  // Gestion des routes non trouvées (Erreur 404)
  { path: '**', redirectTo: '' } // Redirige vers la page d'accueil si la route est incorrecte
];
