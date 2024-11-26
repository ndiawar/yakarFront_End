import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router'; // Importez le Router
import { HttpClientModule } from '@angular/common/http';
import { tap } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:5000/api/auth';
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router ) {}

  registerUser(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  // Connexion avec email et mot de passe
  loginWithEmail(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login-email`, { email, password }).pipe(
      tap((response: any) => {
        if (response.user) {
          this.currentUserSubject.next(response.user);
        }
      })
    );
  }

  // Connexion avec code secret
  loginWithSecretCode(secretCode: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login-secret`, { secretCode }).pipe(
      tap((response: any) => {
        if (response.user) {
          this.currentUserSubject.next(response.user);
        }
      })
    );
  }

  logout() {
    // Nettoyer la session
    sessionStorage.clear();

    // Rediriger vers la page de login
    this.router.navigate(['/login']);
  }

  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }

}
