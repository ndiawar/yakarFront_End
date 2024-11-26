import { Component, ViewChildren, QueryList, AfterViewInit, ElementRef, ChangeDetectorRef, Renderer2, HostListener } from '@angular/core';
import { SocketService } from '../../services/socket.service';
import { UserService } from '../../services/user.service';
import { HttpClient } from '@angular/common/http';
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
export class LoginComponent implements AfterViewInit {

  maxAttempts: number = 3; // Nombre maximum de tentatives autorisées
  attemptsLeft: number = this.maxAttempts; // Compteur de tentatives restantes
  isCodeTabDisabled: boolean = false; // Pour griser l'onglet "Code Secret"

  isCodeDisabled: boolean = false; // Désactive les champs si les tentatives sont épuisées



  // Données utilisateur
  code: string[] = new Array(4).fill(''); // Tableau pour stocker les 4 chiffres du code secret
  codeDisplay: string[] = new Array(4).fill(''); // Tableau pour stocker l'affichage, avec * ou le chiffre
  @ViewChildren('codeInput') codeInputs!: QueryList<ElementRef>;
  email: string = '';
  password: string = '';

  activeTab: 'email' | 'code' = 'email'; // Gérer l'onglet actif

  showErrorModal: boolean = false;
  errorMessage: string = '';

  showSuccessModal: boolean = false;

  constructor(private router: Router, private authService: AuthService, private userService: UserService, private socketService: SocketService, private cdr: ChangeDetectorRef, private renderer: Renderer2,private el: ElementRef) {}

  ngOnInit(): void {
    // Écouter l'événement 'codeReceived' depuis le serveur
    this.socketService.onMessage('codeReceived').subscribe((digit: string) => {
      this.updateCodeFields(digit);
    });
  }

  ngAfterViewInit() {
    // Focus sur le premier champ à l'initialisation
    this.setFocusOnNextEmptyField();
  }

  firstDigitPressed: boolean = false;

  updateCodeFields(digit: string): void {
    if (this.isCodeTabDisabled) {
      alert('Veuillez saisir votre email et votre mot de passe avant de continuer.');
      return; // Bloque toute autre interaction
    }

    if (this.isCodeDisabled) {
      return; // Ne rien faire si les champs sont désactivés
    }

    this.toggleTab(); // Basculer entre les onglets
    if (digit === 'D') {
      this.deleteLastDigit(); // Effacer le dernier chiffre si 'D' est pressé
    } else if (!['A', 'B', 'C', '*', '#'].includes(digit)) {
      for (let i = 0; i < this.code.length; i++) {
        if (this.code[i] === '') {
          this.code[i] = digit;
          this.codeDisplay[i] = digit;
          this.cdr.detectChanges();
          this.setFocusOnNextEmptyField();

          setTimeout(() => {
            this.codeDisplay[i] = '*';
            this.cdr.detectChanges();
          }, 20);

          // Si tous les champs sont remplis, validez automatiquement
          if (this.code.every((char) => char !== '')) {
            this.onSubmitCodeSecret();
          }
          break;
        }
      }
    }
  }

  toggleTab(): void {
    this.activeTab = 'code';
    const tabButtonId = 'code-tab';
    const tabButton = document.querySelector<HTMLButtonElement>(`#${tabButtonId}`);
    tabButton?.click();

    setTimeout(() => {
      this.updateCodeFieldsOnTabSwitch();
    }, 100);
  }

  updateCodeFieldsOnTabSwitch(): void {
    if (this.code && this.code.length > 0) {
      // Mettre à jour les champs de code secret ou effectuer d'autres opérations
    }
  }

  deleteLastDigit(): void {
    for (let i = this.code.length - 1; i >= 0; i--) {
      if (this.code[i] !== '') {
        this.code[i] = '';
        this.codeDisplay[i] = '';
        this.cdr.detectChanges();
        this.setFocusOnNextEmptyField();
        break;
      }
    }
  }

  setFocusOnNextEmptyField(): void {
    for (let i = 0; i < this.code.length; i++) {
      if (this.code[i] === '') {
        setTimeout(() => {
          this.codeInputs.toArray()[i]?.nativeElement.focus();
        });
        return;
      }
    }
  }


  handleInput(event: Event, index: number): void {
    const inputElement = event.target as HTMLInputElement;

    if (this.isCodeTabDisabled) {
      alert('Nombre de tentatives atteint. Veuillez saisir votre email et votre mot de passe.');
    }

    if (!/^\d$/.test(inputElement.value)) {
      inputElement.value = ''; // Efface toute entrée invalide
      this.code[index] = '';   // Réinitialise la valeur dans le tableau
      this.codeDisplay[index] = ''; // Réinitialise l'affichage
      this.cdr.detectChanges();
    } else {
      this.code[index] = inputElement.value;
      this.codeDisplay[index] = inputElement.value; // Affiche temporairement le chiffre

      // Masquer le chiffre par une étoile après un délai
      setTimeout(() => {
        this.codeDisplay[index] = '*';
        this.cdr.detectChanges();
      }, 100);
    }
  }

  onSubmitCodeSecret(): void {
    const secretCode = this.code.join('');

    if (secretCode.length === 4) {
      this.userService.loginWithSecretCode(secretCode).subscribe(
        (response) => {
          console.log('Connexion réussie:', response);
          alert('Connexion réussie !');
          setTimeout(() => {
            const { role } = response; // Extrait le rôle de l'utilisateur
            this.redirectToDashboard(role);
          }, 2000);
        },
        (error) => {
          console.error('Erreur de connexion:', error);
          this.attemptsLeft--;

          if (this.attemptsLeft <= 0) {
            this.isCodeTabDisabled = true; // Désactiver l'onglet "Code Secret"
            this.switchToEmailTab(); // Passer automatiquement à l'onglet Email
            alert('Nombre maximal de tentatives atteint. Veuillez utiliser votre email et mot de passe pour vous connecter.');
          } else {
            alert(`Code secret incorrect. Il vous reste ${this.attemptsLeft} tentative(s).`);
          }
          this.resetCodeFields(); // Réinitialise tous les champs
        }
      );
    } else {
      alert('Le code secret doit être composé de 4 chiffres.');
      this.resetCodeFields(); // Réinitialise également ici
    }
  }


  switchToEmailTab(): void {
    this.activeTab = 'email';
    const emailTabButton = document.querySelector<HTMLButtonElement>('#email-tab');
    emailTabButton?.click();
  }

  // Méthode pour gérer le clic sur le keypad après désactivation
  handleKeypadInteraction(): void {
    if (this.isCodeTabDisabled) {
      alert('Nombre de tentatives atteint. Veuillez saisir votre email et votre mot de passe.');
    }
  }

  resetCodeFields(): void {
    // Réinitialise les tableaux
    this.code.fill('');
    this.codeDisplay.fill('');

    // Forcer la réinitialisation des valeurs DOM
    this.codeInputs.forEach((input, index) => {
      input.nativeElement.value = ''; // Réinitialise la valeur dans le DOM
    });

    // Mettre à jour l'interface Angular
    this.cdr.detectChanges();

    // Place le focus sur le premier champ
    this.setFocusOnNextEmptyField();
  }


  ngOnDestroy(): void {
    this.socketService.disconnect();
  }

  getDisplayValue(index: number): string {
    return this.codeDisplay[index] || ''; // Retourne une chaîne vide si le champ est vide
  }


  get missingDigits(): number {
    return this.code.filter((digit) => !digit || digit.trim() === '').length;
  }



  // Fonction de redirection vers le dashboard approprié
 // redirectToDashboard(role: string): void {
  //  if (role === 'admin') {
  //    this.router.navigate(['/admin']);
  //  } else if (role === 'user') {
    //  this.router.navigate(['/user']);
   // } else {
  //    this.displayError('Rôle inconnu. Veuillez contacter l\'administrateur.');
  //  }
 // }


  // Méthode pour afficher une modale
  openModal(modalId: string): void {
    const modalElement = this.el.nativeElement.querySelector(`#${modalId}`);
    if (modalElement) {
      this.renderer.addClass(modalElement, 'show');
      this.renderer.setStyle(modalElement, 'display', 'block');
      this.renderer.setStyle(modalElement, 'backgroundColor', 'rgba(0, 0, 0, 0.5)');
    }
  }

  // Méthode pour fermer une modale
  closeModal(modalId: string): void {
    const modalElement = this.el.nativeElement.querySelector(`#${modalId}`);
    if (modalElement) {
      this.renderer.removeClass(modalElement, 'show');
      this.renderer.setStyle(modalElement, 'display', 'none');
      this.renderer.removeStyle(modalElement, 'backgroundColor');
    }
  }

  // Méthode pour gérer les erreurs
  displayError(message: string): void {
    this.errorMessage = message;
    this.openModal('errorModal');
  }

  // Méthode pour afficher la modale de succès
  displaySuccess(): void {
    this.openModal('successModal');
  }

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
      this.onSubmitCodeSecret();
    }
  }

  // Connexion avec email et mot de passe
  loginWithEmail(): void {
    if (this.isEmailValid && this.emailExists) {
      this.validatePassword();
  
      if (this.isPasswordValid) {
        const sanitizedEmail = this.email.trim().toLowerCase();
  
        this.userService.loginWithEmail(sanitizedEmail, this.password).subscribe({
          next: (response) => {
            const currentUser = this.userService.getCurrentUser();
            console.log('Utilisateur connecté:', currentUser);  // Afficher les données de l'utilisateur connecté
  
            // Vérification du rôle
            if (currentUser && currentUser.roles && currentUser.roles.length > 0) {
              const userRole = currentUser.roles[0];  // Prendre le premier rôle dans le tableau
              console.log('Rôle de l\'utilisateur:', userRole);
  
              // Rediriger en fonction du rôle
              this.redirectToDashboard(userRole);
            } else {
              this.errorMessage = 'Aucun rôle trouvé pour cet utilisateur.';
            }
          },
          error: (err) => {
            console.error('Erreur de connexion:', err);
            this.passwordErrorMessage = 'Mot de passe incorrect';          }
        });
      }
    }
  }
  

// Fonction de redirection en fonction du rôle
redirectToDashboard(role: string): void {
  // Vérifiez d'abord si role est un tableau et obtenez le premier élément
  const userRole = Array.isArray(role) ? role[0] : role;
  
  switch (userRole) {
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
      console.log('Rôle non reconnu:', userRole);  // Log supplémentaire pour mieux déboguer
  }
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
