import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AxiosResponse } from 'axios';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'], // styleUrls doit être au pluriel
})
export class LoginComponent {
  // Données utilisateur
  code: string[] = ['', '', '', ''];
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  
  constructor(private router: Router, private authService: AuthService) {}

  // Validation des champs
  isEmailValid: boolean = false;
  isPasswordValid: boolean = false;
  emailTouched: boolean = false;
  passwordTouched: boolean = false;
  emailExists: boolean = false;

  emailErrorMessage: string = '';
  passwordErrorMessage: string = '';

  // Pour afficher/masquer le mot de passe
  isPasswordVisible: boolean = false;

  // Validation du code secret
  isCodeValid: boolean = false;

  // Toggle visibilité du mot de passe
  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  // Validation de l'email
  validateEmail(): void {
    this.emailTouched = true;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    this.isEmailValid = emailRegex.test(this.email.trim());

    if (this.isEmailValid) {
      this.authService.checkEmailExistence(this.email).then(
        (response: AxiosResponse) => {
          this.emailExists = response.data?.exists ?? false;
          this.emailErrorMessage = this.emailExists
            ? ''
            : 'Utilisateur introuvable.';
        },
        () => {
          this.emailExists = false;
          this.emailErrorMessage = 'Erreur lors de la vérification de l\'email.';
        }
      );
    } else {
      this.emailExists = false;
      this.emailErrorMessage = 'Veuillez entrer une adresse email valide.';
    }
  }

  // Validation du mot de passe
  validatePassword(): void {
    this.passwordTouched = true;
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_\-+=<>?])[A-Za-z\d!@#$%^&*()_\-+=<>?]{8,}$/;
    this.isPasswordValid = passwordRegex.test(this.password);

    this.passwordErrorMessage = this.isPasswordValid
      ? ''
      : 'Le mot de passe doit comporter au moins 8 caractères, une majuscule et un caractère spécial.';
  }

  // Gestion des saisies pour le code secret
  onInput(event: Event, nextInput: HTMLElement | null): void {
    const target = event.target as HTMLInputElement;
    const index = Array.from(target.parentElement!.children).indexOf(target);
    this.code[index] = target.value;
  
    // Si un chiffre est saisi et un champ suivant existe, on lui donne le focus
    if (target.value.length === 1 && nextInput) {
      nextInput.focus();
    }
  
    // Vérifier si le code est valide
    this.isCodeValid = this.code.every((digit) => digit !== '');
    if (this.isCodeValid) {
      this.onCodeSubmit();
    }
  }
  
  // Connexion avec email et mot de passe
  onEmailSubmit(): void {
    this.validateEmail();

    if (this.isEmailValid && this.emailExists) {
      this.validatePassword();

      if (this.isPasswordValid) {
        this.authService
          .login(this.email.trim().toLowerCase(), this.password)
          .then((user) => this.handleLoginSuccess(user))
          .catch((error) => this.handleLoginError(error));
      } else {
        this.passwordErrorMessage = 'Mot de passe incorrect.';
      }
    } else {
      this.errorMessage = 'Veuillez corriger les erreurs avant de soumettre.';
    }
  }

  // Connexion avec code secret
  onCodeSubmit(): void {
    const secretCode = this.code.join('');

    this.authService
      .login(undefined, undefined, secretCode)
      .then((user) => this.handleLoginSuccess(user))
      .catch((error) => this.handleLoginError(error));
  }

  // Empêche la saisie de tout autre caractère que des chiffres
  allowOnlyNumbers(event: KeyboardEvent): void {
    const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab'];
    if (!/^\d$/.test(event.key) && !allowedKeys.includes(event.key)) {
      event.preventDefault();
    }
  }

  // Gérer le succès de la connexion
  private handleLoginSuccess(user: any): void {
    if (user.status) {
      switch (user.role) {
        case 'admin':
          this.router.navigate(['/admin']);
          break;
        case 'user':
          this.router.navigate(['/user']);
          break;
        case 'moderator':
          this.router.navigate(['/moderator']);
          break;
        default:
          this.errorMessage = 'Rôle utilisateur non reconnu.';
      }
    } else {
      this.errorMessage = 'Compte désactivé. Veuillez contacter l\'administration.';
    }
  }

  // Gérer les erreurs de connexion
  private handleLoginError(error: any): void {
    if (error.message?.includes('Mot de passe incorrect')) {
      this.passwordErrorMessage = 'Mot de passe incorrect.';
    } else if (error.message?.includes('Utilisateur non trouvé')) {
      this.errorMessage = 'Utilisateur introuvable.';
    } else {
      this.errorMessage = error.message || 'Erreur de connexion.';
    }
  }
}
