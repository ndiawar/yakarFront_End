import { Injectable, ApplicationRef, inject } from '@angular/core';
import { io } from 'socket.io-client';
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CaptureService {
  private socket: any;

  constructor() {
    // Initialisation du socket avec autoConnect désactivé
    this.socket = io('http://localhost:3000/', { autoConnect: false });

    // Attente que l'application Angular soit stable avant de connecter le WebSocket
    inject(ApplicationRef).isStable.pipe(
      first((isStable) => isStable)
    ).subscribe(() => {
      // Connexion du socket après la stabilité de l'application
      this.socket.connect();
    });
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
