import { Injectable } from '@angular/core';
import axios from '../config/axios-config'; // Import de l'instance Axios configurée

@Injectable({
  providedIn: 'root',
})
export class CollecteService {
  constructor() {}

  // Récupérer toutes les données
  async getAllData(): Promise<any> {
    try {
      const response = await axios.get('collecte/donnees'); // Utilisation de l'URL de base configurée
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
      throw error;
    }
  }

   // Récupérer la moyenne journalière pour une date spécifique
   async getMoyenneJournaliere(date: string): Promise<any> {
    try {
      const response = await axios.get(`/collecte/moyenne-journaliere/${date}`); // API pour la moyenne journalière
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de la moyenne journalière:', error);
      throw error;
    }
  }


  // Modifier la méthode pour accepter un paramètre startOfWeekDate
async getMoyenneHebdomadaire(startOfWeekDate: string): Promise<any> {
  try {
    // Remplacer l'URL par l'URL correcte avec la date spécifique
    const response = await axios.get(`/collecte/moyenne-hebdomadaire/${startOfWeekDate}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération de la moyenne hebdomadaire:', error);
    throw error;
  }
}


  // Récupérer une donnée par ID
  async getDataById(id: string): Promise<any> {
    try {
      const response = await axios.get(`collecte/donnees/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des données avec l'ID ${id}:`, error);
      throw error;
    }
  }
  
 // Récupérer les moyennes journalières
 async getDailyAverage(): Promise<any> {
  try {
    const response = await axios.get('collecte/donnees/daily-average');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Vérifier si l'erreur est une erreur Axios
      if (error.response?.status === 404) {
        console.warn('Aucune donnée journalière trouvée.');
        return null; // Retourner null si aucune donnée n'est disponible
      }
      console.error('Erreur lors de la récupération des moyennes journalières:', error.response?.data || error.message);
    } else {
      // Pour toute autre erreur, afficher le message générique
      console.error('Erreur inattendue:', error);
    }
    throw error; // Rejeter l'erreur pour un traitement en amont
  }
}
  // Récupérer les moyennes mensuelles
async getMonthlyAverage(): Promise<any> {
  try {
    const response = await axios.get('collecte/donnees/monthly-average');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des moyennes mensuelles:', error);
    throw error;
  }
}
  // Récupérer les données du mois en cours avec pagination
// Service CollecteService pour récupérer les données avec pagination
async getCurrentMonthData(page: number = 1, pageSize: number = 6): Promise<any> {
  try {
    const response = await axios.get(`collecte/donnees/mois-actuel?page=${page}&pageSize=${pageSize}`);
    return response.data; // La réponse doit contenir `currentMonthData`
  } catch (error) {
    console.error('Erreur lors de la récupération des données du mois en cours :', error);
    throw error;
  }
}


  // Récupérer les moyennes hebdomadaires
  async getWeeklyAverage(): Promise<any> {
    try {
      const response = await axios.get('collecte/donnees/weekly-average');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des moyennes hebdomadaires:', error);
      throw error;
    }
  }
  
  // Filtrer les données pour une semaine donnée
  async getDataForWeek(date: string): Promise<any> {
    try {
      const response = await axios.get(`collecte/donnees/week/${date}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des données pour la semaine du ${date}:`, error);
      throw error;
    }
  }

  // Démarrer la capture des données
  async startDataCapture(): Promise<any> {
    try {
      const response = await axios.post('collecte/donnees/capture');
      return response.data;
    } catch (error) {
      console.error('Erreur lors du démarrage de la capture des données:', error);
      throw error;
    }
  }
}
