import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
}
