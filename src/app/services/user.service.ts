import { config } from './../app.config.server';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { Router } from '@angular/router'; // Importez le Router
import { HttpClientModule } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import axios from '../config/axios-config'; // Importer l'instance Axios configurée
import { catchError, map } from 'rxjs/operators'; // Importation des opérateurs RxJS



@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:5001/api/auth';
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router ) {}

  registerUser(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  // Connexion avec email et mot de passe
  loginWithEmail(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login-email`, { email, password }).pipe(
      tap((response: any) => {
        if (response.user) {
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        }
      })
    );
  }

  // Connexion avec code secret
  loginWithSecretCode(secretCode: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login-secret`, { secretCode }).pipe(
      tap((response: any) => {
        if (response.user) {
          this.currentUserSubject.next(response.user);
        }
      })
    );
  }

 // Récupérer l'utilisateur actuel
 getCurrentUser(): any {
  const user = this.currentUserSubject.value;
  if (!user) {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }
  return this.currentUserSubject.value;
}
// Vérifie si l'utilisateur est connecté
isLoggedIn(): boolean {
  return !!this.getCurrentUser();
}

// Vérifie si l'utilisateur est un admin
isAdmin(): boolean {
  const user = this.getCurrentUser();
  return user && user.role === 'admin'; // Vérifie si le rôle est admin
}

// Vérifie si l'utilisateur est un user
isUser(): boolean {
  const user = this.getCurrentUser();
  return user && user.role === 'user'; // Vérifie si le rôle est user
}

// Méthode de déconnexion
logout() {
  localStorage.removeItem('currentUser');
  this.deleteAllCookies();
  this.currentUserSubject.next(null);
  this.router.navigate(['/login']);
}

// Supprime tous les cookies
private deleteAllCookies() {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf('=');
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
  }
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
  // Changer le mot de passe
// Fonction pour changer le mot de passe de l'utilisateur
changePassword(email: string, oldPassword: string, newPassword: string, confirmPassword: string): Observable<any> {
  if (newPassword !== confirmPassword) {
    return new Observable((observer) => {
      observer.error({ message: 'Les nouveaux mots de passe ne correspondent pas.' });
    });
  }

  const body = {
    email: email,
    oldPassword: oldPassword,
    newPassword: newPassword,
    confirmPassword: confirmPassword,
  };

  return from(
    axios.post(`${this.apiUrl}/change-password`, body)
      .then((response) => {
        console.log('Mot de passe mis à jour avec succès:', response.data);
        return response.data;
      })
  ).pipe(
    map((response) => {
      console.log('Réponse de l\'API:', response);  // Log de la réponse pour vérifier la structure
      return response;  // Retourne la réponse si tout est correct
    }),
    catchError((error) => {
      console.error('Erreur lors du changement de mot de passe:', error);
      return this.handleError(error);  // Gestion de l'erreur
    })
  );
}

  updatePhoto(userId: string, photo: File) {
    const currentUser = this.getCurrentUser();
    const formData = new FormData();
    formData.append('userId', currentUser.id);
    formData.append('photo', photo);

    return this.http.post(`${this.apiUrl}/update-photo`, formData);
  }

}
