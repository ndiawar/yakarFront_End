import { Injectable } from '@angular/core';
import axios from '../config/axios-config'; // Import de l'instance Axios configurée
import { from, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UserApiService {
  // Récupérer tous les utilisateurs
  async fetchUsers(activeOnly: boolean = true): Promise<any[]> {
    try {
      const { data } = await axios.get(`/users/users?active=${activeOnly}`); // Envoie un paramètre à l'API
      if (!data || !data.users) {
        throw new Error('Aucun utilisateur trouvé.');
      }
      return data.users;
    } catch (error) {
      this.handleError(error, 'Erreur lors de la récupération des utilisateurs.');
    }
  }
  
  // Inscription d'un utilisateur
  async registerUser(user: {
    name: string;
    email: string;
    password: string;
    telephone: string;
    adresse: string;
    photo?: string;
  }): Promise<any> {
    try {
      const response = await axios.post('/users/register', user);

      // Vérification explicite du statut de la réponse
      if ([200, 201].includes(response.status)) {
        console.log('Utilisateur inscrit avec succès:', response.data);
        return response.data;
      } else {
        throw new Error(`Erreur inattendue : statut ${response.status}`);
      }
    } catch (error) {
      this.handleError(error, 'Erreur lors de l\'inscription de l\'utilisateur.');
    }
  }

  // Déconnexion
  logout(): Observable<any> {
    return from(
      axios.post('auth/logout').then(() => {
        console.log('Déconnexion réussie');
        return true; // Retourner une valeur si la déconnexion réussit
      })
    ).pipe(
      catchError(error => {
        console.error('Erreur lors de la déconnexion:', error);
        throw error;
      })
    );
  }

  // Récupérer un utilisateur par ID
  async fetchUserById(id: string): Promise<any> {
    try {
      const { data } = await axios.get(`/users/users/${id}`);
      return data.user;
    } catch (error) {
      this.handleError(error, `Erreur lors de la récupération de l'utilisateur avec l'ID ${id}.`);
    }
  }

  // Mettre à jour un utilisateur
  async updateUser(id: string, userData: any): Promise<any> {
    try {
      const { data } = await axios.put(`/users/users/${id}`, userData);
      return data;
    } catch (error) {
      this.handleError(error, `Erreur lors de la mise à jour de l'utilisateur avec l'ID ${id}.`);
    }
  }

  // Désactiver un utilisateur
  async disableUser(id: string): Promise<any> {
    try {
      const { data } = await axios.delete(`/users/users/${id}`);
      return data; // Renvoie les données utilisateur mises à jour
    } catch (error) {
      this.handleError(error, `Erreur lors de la désactivation de l'utilisateur avec l'ID ${id}.`);
    }
  }

  // Basculer le rôle d'un utilisateur
  async toggleUserRole(id: string): Promise<any> {
    try {
      const { data } = await axios.patch(`/users/users/${id}/role`);
      return data; // Renvoie les données utilisateur mises à jour
    } catch (error) {
      this.handleError(error, `Erreur lors de la mise à jour du rôle pour l'utilisateur avec l'ID ${id}.`);
    }
  }

  // Gestion centralisée des erreurs
  private handleError(error: any, customMessage: string): never {
    if (axios.isAxiosError(error)) {
      console.error('Erreur Axios:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || customMessage);
    } else {
      console.error('Erreur inconnue:', error);
      throw new Error(customMessage);
    }
  }


  
}
