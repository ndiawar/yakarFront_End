import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface CapteurData {
  date: string;
  heure: string;
  temperature: number;
  humidite: number;
}

@Injectable({
  providedIn: 'root',
})
export class CapteurDataService {
  private baseUrl = 'http://localhost:5001/api/capteurs'; // URL de votre backend

  constructor(private http: HttpClient) {}

  getWeeklyAverages(year: number, month: number, week: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/weekly-averages`, {
      params: { year: year.toString(), month: month.toString(), week: week.toString() },
    });
  }

  getLastDayData(): Observable<any> {
    return this.http.get(`${this.baseUrl}/last-day-data`);
  }

  // Méthode pour récupérer les données de température et humidité
  getCapteurData(): Observable<CapteurData[]> {
    return this.http.get<CapteurData[]>(`${this.baseUrl}/realTime`); // Changez cette route selon votre API
  }

  // Méthode pour contrôler l'état du ventilateur
  // Méthode pour contrôler le ventilateur
  controlFan(action: 'ON' | 'OFF'): Observable<any> {
    return this.http.post(`${this.baseUrl}/control-fan`, { action });
  }

  // Méthode pour récupérer les données des capteurs avec pagination
  getCapteurDatas(page: number, limit: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/data`, {
      params: { page: page.toString(), limit: limit.toString() },
    });
  }
}
