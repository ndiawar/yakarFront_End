import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CaptureService {
  private socket: any;

  constructor() {
    // Assurez-vous que l'URL de votre serveur WebSocket est correcte
    this.socket = io('http://localhost:3000'); // Remplacez par l'URL de votre serveur
  }

  // Méthode pour écouter les données en temps réel
  listenToRealTimeData(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('nouvelleDonnee', (data: any) => {
        observer.next(data); // Émettre les données reçues du serveur
      });

      // Gérer les erreurs WebSocket si nécessaire
      this.socket.on('error', (error: any) => {
        observer.error(error);
      });
    });
  }
}
