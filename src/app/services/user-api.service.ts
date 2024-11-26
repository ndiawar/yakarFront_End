import { Injectable } from '@angular/core';
import axios from '../config/axios-config'; // Import de l'instance Axios configurée

@Injectable({
  providedIn: 'root',
})
export class UserApiService {
  // Récupérer tous les utilisateurs
// Service Angular avec un paramètre pour récupérer les utilisateurs actifs
async fetchUsers(activeOnly: boolean = true): Promise<any[]> {
  try {
    const { data } = await axios.get(`/users/users?active=${activeOnly}`); // Envoie un paramètre à l'API
    if (!data || !data.users) {
      throw new Error('Aucun utilisateur trouvé.');
    }
    return data.users;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Erreur Axios:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Erreur réseau Axios');
    } else {
      console.error('Erreur inconnue:', error);
      throw new Error('Erreur inconnue');
    }
  }
}

// Inscription d'un utilisateur
// Service d'inscription d'un utilisateur avec gestion des erreurs adaptées au backend

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
    if (response.status === 201) {
      console.log('Utilisateur inscrit avec succès :', response.data);
      return response.data; // Renvoie les données utilisateur et le message
    } else {
      throw new Error(`Erreur inattendue : statut ${response.status}`);
    }
  } catch (error) {
    // Gestion spécifique des erreurs Axios
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status;
      const serverMessage = error.response?.data?.message;

      if (statusCode) {
        switch (statusCode) {
          case 400:
            throw new Error(serverMessage || 'Données invalides. Veuillez vérifier les informations saisies.');
          case 403:
            throw new Error(serverMessage || 'Accès refusé. Veuillez vérifier vos autorisations.');
          case 500:
            throw new Error(serverMessage || 'Erreur interne du serveur. Veuillez réessayer plus tard.');
          default:
            throw new Error(serverMessage || 'Une erreur inattendue est survenue.');
        }
      } else {
        throw new Error('Erreur de communication avec le serveur. Veuillez vérifier votre connexion.');
      }
    }

    // Gestion des erreurs générales non Axios
    console.error('Erreur non-gérée :', error);
    throw new Error('Une erreur imprévue est survenue. Veuillez réessayer plus tard.');
  }
}

// Récupérer un utilisateur par ID
async fetchUserById(id: string): Promise<any> {
  try {
    const { data } = await axios.get(`/users/users/${id}`);
    return data.user;
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'utilisateur avec l'ID ${id}:`, error);
    throw error;
  }
}

// Mettre à jour un utilisateur
// Service Angular : mettre à jour un utilisateur
// Service Angular : mettre à jour un utilisateur
async updateUser(id: string, userData: any): Promise<any> {
  try {
    const { data } = await axios.put(`/users/users/${id}`, userData); // Envoi des données au backend
    return data;
  } catch (error: unknown) {
    // Vérifier si l'error est une instance d'Error ou a une propriété message
    if (error instanceof Error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error.message);
      throw error;
    } else {
      console.error('Erreur inconnue:', error);
      throw new Error('Erreur inconnue lors de la mise à jour.');
    }
  }
}



// Désactiver un utilisateur
async disableUser(id: string): Promise<any> {
  try {
    // Appel de l'API pour désactiver l'utilisateur
    const { data } = await axios.delete(`/users/users/${id}`);
    return data; // Renvoie les données utilisateur mises à jour
  } catch (error) {
    console.error(`Erreur lors de la désactivation de l'utilisateur avec l'ID ${id}:`, error);
    throw error;
  }
}

// Basculer le rôle d'un utilisateur
async toggleUserRole(id: string): Promise<any> {
  try {
    // Appeler l'API pour basculer le rôle
    const { data } = await axios.patch(`/users/users/${id}/role`);
    return data; // Renvoie les données utilisateur mises à jour
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du rôle pour l'utilisateur ${id}:`, error);
    throw error;
  }
}

}
