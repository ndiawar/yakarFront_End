import { Injectable } from '@angular/core';
import axios from '../config/axios-config'; // Import de l'instance Axios configurée
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private user: any = null;  // Déclaration de la propriété user
  private loggedIn: boolean = false;
  private isAdminUser: boolean = false;

  // Méthode pour vérifier si l'email existe
  checkEmailExistence(email: string): Promise<any> {
    return axios.post('/auth/check-email', { email });
  }

  // Méthode de connexion
  login(email?: string, password?: string, secretCode?: string): Observable<any> {
    const loginData: any = {};

    if (email && password) {
      loginData.email = email;
      loginData.password = password;
    } else if (secretCode) {
      loginData.secretCode = secretCode;
    } else {
      return from(Promise.reject('Veuillez fournir un email/mot de passe ou un code secret.'));
    }

    const promise = axios.post('/auth/login', loginData)
      .then(response => {
        this.user = response.data.user;
        this.loggedIn = true;
        this.isAdminUser = this.user.role === 'admin';
        return this.user;
      })
      .catch(error => {
        if (error.response) {
          throw error.response.data;
        } else if (error.request) {
          throw new Error('Aucune réponse du serveur');
        } else {
          throw new Error('Erreur dans la configuration de la requête');
        }
      });

    return from(promise); // Conversion de la *Promise* en `Observable`
  }

  // Méthode de déconnexion
  logout(): Promise<any> {
    return axios.post('/auth/logout') // Appelle l'endpoint de déconnexion
      .then(() => {
        this.user = null;             // Réinitialiser l'utilisateur localement
        this.loggedIn = false;        // Mettre à jour le statut de connexion
        this.isAdminUser = false;     // Réinitialiser le statut admin
      })
      .catch(error => {
        if (error.response) {
          throw error.response.data;
        } else if (error.request) {
          throw new Error('Aucune réponse du serveur lors de la déconnexion');
        } else {
          throw new Error('Erreur dans la configuration de la requête de déconnexion');
        }
      });
  }

  // Vérifie si l'utilisateur est connecté
  isLoggedIn(): boolean {
    return this.loggedIn;
  }

  // Vérifie si l'utilisateur est un admin
  isAdmin(): boolean {
    return this.isAdminUser;
  }

  // Récupère les informations de l'utilisateur connecté
  getUser(): any {
    return this.user;
  }
}
