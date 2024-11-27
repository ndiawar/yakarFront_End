import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { ApplicationRef } from '@angular/core';
import { first } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private socket: Socket;

  constructor(private appRef: ApplicationRef) {
    // Initialisation du socket sans connexion immédiate
    this.socket = io('http://localhost:5001', { autoConnect: false });

    // Attendre que l'application soit stable avant de connecter le WebSocket
    this.appRef.isStable
      .pipe(first((isStable) => isStable))
      .subscribe(() => {
        this.socket.connect(); // Connexion du socket après la stabilité
      });
  }

  // Méthode pour envoyer un message via WebSocket
  sendMessage(event: string, message: any): void {
    if (this.socket.connected) {
      this.socket.emit(event, message);
    } else {
      console.error('Socket n\'est pas connecté');
    }
  }

  // Méthode pour écouter un message spécifique
  onMessage(event: string): Observable<any> {
    return new Observable((observer) => {
      this.socket.on(event, (data) => {
        observer.next(data);
      });
    });
  }

  // Méthode pour se déconnecter du socket
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}