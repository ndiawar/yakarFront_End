import { Injectable } from '@angular/core';
import axios from '../config/axios-config'; // Instance Axios configurée

@Injectable({
  providedIn: 'root',
})
export class LogsApiService {
  private readonly baseUrl = 'historique'; // Base relative pour les logs

  constructor() {}

  /**
   * Récupérer tous les historiques
   */
  async getAllLogs(): Promise<any> {
    try {
      const response = await axios.get('/historique/historique');
      return response.data; // Les logs incluent maintenant le champ "userName"
    } catch (error) {
      console.error('Erreur lors de la récupération de tous les logs :', error);
      throw error;
    }
  }
  

  /**
   * Récupérer les historiques entre deux dates
   * @param startDate Date de début (format ISO)
   * @param endDate Date de fin (format ISO)
   */
  async getLogsByDateRange(startDate: string, endDate: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/date-range`, {
        params: { startDate, endDate },
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des logs par période :', error);
      throw error;
    }
  }

  /**
   * Récupérer les historiques correspondant à une action spécifique
   * @param action Action recherchée
   */
  async getLogsByAction(action: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/action`, {
        params: { action },
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des logs par action :', error);
      throw error;
    }
  }

  /**
   * Récupérer les historiques pour un utilisateur spécifique
   * @param userId ID de l'utilisateur
   */
  async getLogsByUser(userId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des logs pour un utilisateur :', error);
      throw error;
    }
  }
}
