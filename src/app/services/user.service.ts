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
  private apiUrl = 'http://localhost:5001/api/auth';
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
          localStorage.setItem('currentUser', JSON.stringify(response.user));
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

  getCurrentUser(): any {
    const user = this.currentUserSubject.value;
    if (!user) {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        this.currentUserSubject.next(JSON.parse(savedUser));
      }
    }
    return this.currentUserSubject.value;
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  // Changer le mot de passe
  // Changer le mot de passe
  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    const currentUser = this.getCurrentUser();
    if (!currentUser || !currentUser.id) { // Vérifiez également si `id` est valide
      console.error('Utilisateur non connecté ou ID manquant.');
      throw new Error('Utilisateur non connecté.');
    }
    return this.http.post(`${this.apiUrl}/change-password`, {
      userId: currentUser.id,
      currentPassword,
      newPassword,
    });
  }

  updatePhoto(userId: string, photo: File) {
    const currentUser = this.getCurrentUser();
    const formData = new FormData();
    formData.append('userId', currentUser.id);
    formData.append('photo', photo);

    return this.http.post(`${this.apiUrl}/update-photo`, formData);
  }

}
