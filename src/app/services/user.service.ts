import { Injectable } from '@angular/core';
import axios from '../config/axios-config'; // Importer l'instance Axios configurée
import { Observable, from } from 'rxjs';
import { catchError, map } from 'rxjs/operators'; // Importation des opérateurs RxJS
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private currentUser: any;
  private currentUserSubject: BehaviorSubject<any> = new BehaviorSubject(null);
  constructor(private router: Router) {}
    
  // Fonction de redirection en fonction du rôle
  redirectToDashboard(role: string): void {
    const userRole = Array.isArray(role) ? role[0] : role;

    switch (userRole) {
      case 'admin':
        this.router.navigate(['/admin']);
        break;
      case 'user':
        this.router.navigate(['/user']);
        break;
      case 'moderator':
        this.router.navigate(['/moderator']);
        break;
      default:
        console.error('Rôle non reconnu:', userRole);
    }
  }

 // Connexion avec email et mot de passe
 loginWithEmail(email: string, password: string): Observable<any> {
  return from(
    axios.post('auth/login-email', { email, password })
      .then(response => {
        this.currentUser = response.data.user; // Enregistrer l'utilisateur connecté
        console.log('Utilisateur connecté:', this.currentUser); // Log de l'utilisateur pour vérifier
        return response.data;
      })
  ).pipe(
    map(response => {
      console.log('Réponse de l\'API:', response); // Log de la réponse pour vérifier la structure
      if (this.currentUser && this.currentUser.role && this.currentUser.role.length > 0) {
        // Appeler la fonction de redirection avec le premier rôle de l'utilisateur
        this.redirectToDashboard(this.currentUser.role);
      } else {
        throw new Error('Aucun rôle trouvé pour cet utilisateur.');
      }
      return response; // Retourner la réponse si tout est correct
    }),
    catchError(error => {
      console.error('Erreur lors de la connexion avec email:', error);
      return this.handleError(error); // Gestion de l'erreur
    })
  );
}

   // Connexion avec code secret
   loginWithSecretCode(secretCode: string): Observable<any> {
    return from(
      axios.post('auth/login', { secretCode })
        .then(response => {
          this.currentUser = response.data.user; // Enregistrer l'utilisateur connecté
          return response.data;
        })
    ).pipe(
      map(response => {
        return response; // Retourner la réponse si la connexion est réussie
      }),
      catchError(error => {
        console.error('Erreur lors de la connexion avec code secret:', error);
        return this.handleError(error); // Gestion de l'erreur
      })
    );
  }

   // Méthode pour récupérer le profil utilisateur
   getProfile(): Observable<any> {
    return from(axios.get('auth/profile')).pipe(
      map(response => {
        console.log('Profil utilisateur récupéré:', response.data);
        this.currentUser = response.data; // Mettre à jour l'utilisateur courant
        this.currentUserSubject.next(this.currentUser); // Synchroniser avec le BehaviorSubject
        return response.data; // Retourne les données du profil
      }),
      catchError(error => {
        console.error('Erreur lors de la récupération du profil utilisateur:', error);
        return this.handleError(error); // Gestion de l'erreur
      })
    );
  }



// Méthode de déconnexion
logout(): Observable<any> {
  return from(axios.post('auth/logout')).pipe(
    map(response => {
      console.log('Utilisateur déconnecté avec succès');

      // Supprimer le cookie contenant le JWT
      document.cookie = 'AUTH_COOKIE=; Max-Age=-99999999;';  // Supprimer le cookie

      // Réinitialiser l'utilisateur (si nécessaire)
      this.currentUser = null;
      this.currentUserSubject.next(null); // Mettre à jour le subject

      this.router.navigate(['/login']); // Rediriger l'utilisateur vers la page de connexion
      return response; // Retourne la réponse de déconnexion
    }),
    catchError(error => {
      console.error('Erreur lors de la déconnexion:', error);
      return this.handleError(error); // Gestion de l'erreur
    })
  );
}





  // Vérifier si l'utilisateur est connecté
  isLoggedIn(): boolean {
    return !!this.currentUser;  // Retourne true si l'utilisateur est connecté
  }
  // Récupérer l'utilisateur actuellement connecté
  getCurrentUser(): any {
    return this.currentUser;
  }

  

  // Méthode pour gérer les erreurs de manière centralisée
  private handleError(error: any): Observable<never> {
    let errorMessage = 'Une erreur est survenue';
    if (error.response) {
      // Erreur côté serveur
      errorMessage = error.response.data.message || errorMessage;
    } else if (error.message) {
      // Erreur de type client
      errorMessage = error.message;
    }
    // Retourner un Observable avec un message d'erreur
    return new Observable(observer => {
      observer.error(errorMessage);
    });
  }
}
