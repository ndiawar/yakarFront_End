import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { Observable } from 'rxjs';
import { ApplicationRef } from '@angular/core';
import { first } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CaptureService {
  private socket: any;

  constructor(private appRef: ApplicationRef) {
    // Assurez-vous que l'URL de votre serveur WebSocket est correcte
    this.socket = io('http://localhost:5000', { autoConnect: false }); // Remplacez par l'URL de votre serveur

    // Attendre que l'application soit stable avant de connecter le WebSocket
    this.appRef.isStable
      .pipe(first((isStable) => isStable))
      .subscribe(() => {
        this.socket.connect(); // Connexion du socket après la stabilité
      });
  }

  // Méthode pour écouter les données en temps réel
  listenToRealTimeData(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('nouvelleDonnee', (data: any) => {
        if (data && data.date && data.heure && data.temperature !== undefined && data.humidite !== undefined) {
          observer.next(data); // Transmettre les données valides
        } else {
          console.error('Données invalides reçues:', data);
        }
      });
  
      this.socket.on('error', (error: any) => {
        observer.error(error);
      });
    });
  }
  
}
