import { Injectable } from '@angular/core';
import axios from '../config/axios-config'; // Import de l'instance Axios configurée

@Injectable({
  providedIn: 'root',
})
export class UserApiService {
   // Recherche des utilisateurs par nom, email et statut actif
   async searchUsers(searchTerm: string): Promise<any[]> {
    try {
      // Validation des paramètres
      if (!searchTerm || searchTerm.trim().length === 0) {
        throw new Error('Le terme de recherche ne peut pas être vide.');
      }
  
      // Appel à l'API avec les paramètres de recherche
      const { data } = await axios.get('/users/search', {
        params: {
          search: searchTerm.trim(), // Nettoyer les espaces inutiles
          // Vous pouvez aussi spécifier ici que la recherche porte sur l'email
          field: 'email', // Ajoutez un champ 'field' si nécessaire pour filtrer sur l'email
        },
      });
  
      // Vérification explicite des données
      if (!data || !data.users || !Array.isArray(data.users)) {
        throw new Error('Structure de données inattendue. Aucun utilisateur trouvé.');
      }
  
      return data.users;
    } catch (error) {
      // Gestion des erreurs spécifiques à Axios
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 'Erreur réseau Axios';
        console.error('Erreur Axios:', error.response?.data || error.message);
        throw new Error(errorMessage);
      }
  
      // Gestion des autres erreurs
      console.error('Erreur inconnue:', error);
      throw new Error('Une erreur imprévue est survenue lors de la recherche.');
    }
  }
  
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

      // Gestion des différents codes de statut renvoyés par le backend
      if (statusCode) {
        switch (statusCode) {
          case 400:
            // Pour chaque erreur spécifique 400, renvoyez un message détaillé
            if (serverMessage?.includes('Tous les champs obligatoires')) {
              throw new Error('Veuillez remplir tous les champs obligatoires.');
            }
            if (serverMessage?.includes('Email invalide')) {
              throw new Error('L\'email saisi est invalide. Veuillez corriger.');
            }
            if (serverMessage?.includes('Téléphone invalide')) {
              throw new Error(
                'Le numéro de téléphone doit commencer par 70, 75, 76, 77 ou 78 et contenir 9 chiffres.'
              );
            }
            if (serverMessage?.includes('mot de passe doit contenir')) {
              throw new Error(
                'Le mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial.'
              );
            }
            if (serverMessage?.includes('Un utilisateur avec cet email ou ce téléphone existe déjà')) {
              throw new Error('Un compte avec cet email ou numéro de téléphone existe déjà.');
            }
            throw new Error(serverMessage || 'Données invalides.');
          case 403:
            throw new Error('Accès refusé. Veuillez vérifier vos autorisations.');
          case 500:
            throw new Error(
              serverMessage || 'Erreur interne du serveur. Veuillez réessayer plus tard.'
            );
          default:
            throw new Error(serverMessage || 'Une erreur inattendue est survenue.');
        }
      } else {
        throw new Error(
          'Erreur de communication avec le serveur. Veuillez vérifier votre connexion internet.'
        );
      }
    }

    // Gestion des erreurs générales non Axios
    console.error('Erreur non-gérée :', error);
    throw new Error('Une erreur imprévue est survenue. Veuillez réessayer plus tard.');
  }
}


// Service Angular : mettre à jour un utilisateur
async updateUser(id: string, userData: any): Promise<any> {
    try {
      const response = await axios.put(`/users/users/${id}`, userData);
  
      // Vérification explicite du statut de la réponse
      if (response.status === 200) {
        console.log('Utilisateur mis à jour avec succès :', response.data);
        return response.data; // Renvoie les données mises à jour
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
              if (serverMessage?.includes('email est déjà utilisé')) {
                throw new Error('L\'email fourni est déjà utilisé par un autre utilisateur.');
              }
              if (serverMessage?.includes('numéro de téléphone est déjà utilisé')) {
                throw new Error('Le numéro de téléphone fourni est déjà utilisé.');
              }
              if (serverMessage?.includes('code secret est déjà utilisé')) {
                throw new Error('Le code secret fourni est déjà utilisé.');
              }
              throw new Error(serverMessage || 'Les données fournies sont invalides.');
            case 403:
              throw new Error('Accès refusé. Veuillez vérifier vos autorisations.');
            case 404:
              throw new Error('Utilisateur introuvable. Veuillez vérifier l\'identifiant.');
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



// Désactiver un utilisateur
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
