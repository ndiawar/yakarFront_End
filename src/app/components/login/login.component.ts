import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  // Données utilisateur
  code: string[] = ['', '', '', ''];
  email: string = '';
  password: string = '';
  
  // Validation des champs
  isEmailValid: boolean = false;
  isPasswordValid: boolean = false;
  emailTouched: boolean = false;
  passwordTouched: boolean = false;

  // Getter pour les chiffres manquants
  get missingDigits(): number {
    return this.code.filter((digit) => !digit || digit.trim() === '').length;
  }

  // Permet de basculer la visibilité du mot de passe
  togglePasswordVisibility(): void {
    const passwordField = document.getElementById('password') as HTMLInputElement;
    passwordField.type = passwordField.type === 'password' ? 'text' : 'password';
  }

  // Validation de l'email
  validateEmail(): void {
    this.emailTouched = true;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    this.isEmailValid = emailRegex.test(this.email.trim());
  }

  // Validation du mot de passe
  validatePassword(): void {
    this.passwordTouched = true;
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_\-+=<>?])[A-Za-z\d!@#$%^&*()_\-+=<>?]{8,}$/;
    this.isPasswordValid = passwordRegex.test(this.password);
  }

  // Soumission du formulaire email/mot de passe
  onEmailSubmit(): void {
    if (this.isEmailValid && this.isPasswordValid) {
      const sanitizedEmail = this.email.trim().toLowerCase();
      alert(`Connexion réussie avec l'email : ${sanitizedEmail}`);
    } else {
      alert('Veuillez corriger les erreurs avant de soumettre le formulaire.');
    }
  }

  // Gestion des saisies pour le code secret
  onInput(event: Event, nextInput: HTMLInputElement | null): void {
    const target = event.target as HTMLInputElement;
    const index = Array.from(target.parentElement!.children).indexOf(target);
    this.code[index] = target.value;

    // Focus sur le champ suivant
    if (target.value.length === 1 && nextInput) {
      nextInput.focus();
    }

    // Soumission automatique si tous les champs sont remplis
    if (this.code.every((digit) => digit !== '')) {
      this.onSubmit();
    }
  }

  // Empêche la saisie de tout autre caractère que des chiffres
  allowOnlyNumbers(event: KeyboardEvent): void {
    const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab'];
    if (!/^\d$/.test(event.key) && !allowedKeys.includes(event.key)) {
      event.preventDefault();
    }
  }

  // Soumet le formulaire lorsque tous les champs sont remplis
  onSubmit(): void {
    alert(`Code soumis : ${this.code.join('')}`);
  }
}
