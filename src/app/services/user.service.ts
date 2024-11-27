import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';  // Ajoutez cet import
import { tap } from 'rxjs/operators';  // Ajoutez cet import pour l'opérateur 'tap'

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:5000/api/auth';
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser = this.currentUserSubject.asObservable();
  private jwtHelper = new JwtHelperService(); // Instance du helper JWT

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromCookie();  // Charger l'utilisateur depuis le cookie au démarrage
  }

  // Charger l'utilisateur depuis le cookie si disponible
  private loadUserFromCookie() {
    const token = this.getTokenFromCookie();
    if (token && !this.jwtHelper.isTokenExpired(token)) {
      const decodedToken = this.jwtHelper.decodeToken(token);
      this.currentUserSubject.next({
        id: decodedToken.id,
        name: decodedToken.name,  // Ajoutez le nom et le rôle ici
        roles: decodedToken.roles,
        role: decodedToken.roles[0],  // Supposons qu'il y a un rôle principal
      });
    } else {
      this.currentUserSubject.next(null);
    }
  }

  // Méthode pour récupérer le token depuis le cookie
  private getTokenFromCookie(): string | null {
    const token = document.cookie.split(';').find(cookie => cookie.trim().startsWith('AUTH_COOKIE='));
    return token ? token.split('=')[1] : null;
  }

  // Connexion avec email et mot de passe
  loginWithEmail(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login-email`, { email, password }).pipe(
      tap((response: any) => {
        if (response.token) {
          document.cookie = `AUTH_COOKIE=${response.token}; path=/;`;  // Stockage du token dans le cookie
          this.currentUserSubject.next({
            id: response.user.id,
            name: response.user.name,
            role: response.user.role,  // Rôle principal
            roles: response.user.roles
          });
        }
      })
    );
  }
  
  // Connexion avec code secret
  loginWithSecretCode(secretCode: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login-secret`, { secretCode }).pipe(
      tap((response: any) => {
        if (response.token) {
          document.cookie = `AUTH_COOKIE=${response.token}; path=/;`;
          // Mettez à jour le currentUser avec les données reçues
          this.currentUserSubject.next({
            id: response.user.id,
            name: response.user.name,
            role: response.user.role,
            roles: response.user.roles
          });
        }
      })
    );
  }

  // Déconnexion
  logout() {
    // Nettoyage des cookies
    document.cookie = 'AUTH_COOKIE=; Max-Age=0; path=/;';
    this.currentUserSubject.next(null);  // Réinitialisation de l'état utilisateur
    this.router.navigate(['/login']);
  }
  
  // Récupérer l'utilisateur actuel
  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }
}
