import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Renderer2 } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  changePasswordMessage: { text: string; type: 'success' | 'error' } | null = null;

  isDarkMode = true; // Define the initial theme state (dark mode by default)
  user: any = {};
  isModalVisible: boolean = false;
  isPasswordModalVisible: boolean = false;
  changePasswordForm: FormGroup;
  passwordsMatch = true; // Pour vérifier si les mots de passe correspondent
  showNewPassword: boolean = false; // Nouvelle variable

  @ViewChild('photoInput', { static: false }) photoInput!: ElementRef<HTMLInputElement>;


  constructor(
    public userService: UserService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private renderer: Renderer2 // Use Renderer2 for DOM manipulations
  ) {
    this.loadUserData();
    this.changePasswordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9])/),
        ],
      ],
      confirmPassword: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.user = this.userService.getCurrentUser();
    const theme = localStorage.getItem('theme') || 'dark-theme';
    this.isDarkMode = theme === 'dark-theme';
    this.updateThemeClass(theme);
    this.updateIcon();
    // Vérification en temps réel des mots de passe correspondants
    this.changePasswordForm.get('confirmPassword')?.valueChanges.subscribe(() => {
      const newPassword = this.changePasswordForm.get('newPassword')?.value;
      const confirmPassword = this.changePasswordForm.get('confirmPassword')?.value;
      this.passwordsMatch = newPassword === confirmPassword;
    });
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    const theme = this.isDarkMode ? 'dark-theme' : 'light-theme';
    this.updateThemeClass(theme);
    this.updateIcon();
    localStorage.setItem('theme', theme);
  }

  private updateThemeClass(theme: string): void {
    this.renderer.removeClass(document.body, 'dark-theme');
    this.renderer.removeClass(document.body, 'light-theme');
    this.renderer.addClass(document.body, theme);
  }

  private updateIcon(): void {
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
      this.renderer.setAttribute(
        themeIcon,
        'class',
        this.isDarkMode ? 'bi bi-moon-fill theme-icon moon' : 'bi bi-sun-fill theme-icon sun'
      );
    }
  }

  loadUserData(): void {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      this.user = JSON.parse(userData);
    }
  }

  toggleModal(event: Event): void {
    event.preventDefault();
    this.isModalVisible = !this.isModalVisible;
  }

  togglePasswordModal(): void {
    this.isPasswordModalVisible = !this.isPasswordModalVisible;
  }

  onPhotoSelected(event: any): void {
  const file = event.target.files[0];
  if (file) {
    const formData = new FormData();
    formData.append('userId', this.user._id);
    formData.append('photo', file);

    console.log('FormData:', formData.get('userId'), formData.get('photo'));

    this.userService.updatePhoto(this.user._id, file).subscribe({
      next: (response: any) => {
        alert( 'Photo mise à jour avec succès.');
        this.user.photo = response.photo;
      },
      error: (err) => {
        console.error('Erreur Backend:', err.error.message);
        alert( `Erreur : ${err.error.message || 'Impossible de mettre à jour la photo.'}`);
      },
    });
  }
}

  // Soumettre le formulaire de changement de mot de passe
  onSubmit(): void {
    if (this.changePasswordForm.valid && this.passwordsMatch) {
      const { currentPassword, newPassword, confirmPassword } = this.changePasswordForm.value;
  
      // Vérifiez si l'email de l'utilisateur est présent (vous pourriez avoir à adapter cette partie)
      const email = this.user.email; // Assurez-vous que l'email est bien dans `this.user`
  
      // Appel de la méthode changePassword avec 4 arguments
      this.userService.changePassword(email, currentPassword, newPassword, confirmPassword).subscribe({
        next: () => {
          this.setChangePasswordMessage('Mot de passe changé avec succès.', 'success');
          this.closePasswordModalAndShowProfileModal();
        },
        error: (err) => {
          this.setChangePasswordMessage(
            err.error.message || 'Impossible de changer le mot de passe.',
            'error'
          );
          this.closePasswordModalAndShowProfileModal();
        },
      });
    }
  }
  

  // Méthode pour définir le message
  private setChangePasswordMessage(text: string, type: 'success' | 'error'): void {
    this.changePasswordMessage = { text, type };
    setTimeout(() => {
      this.changePasswordMessage = null;
    }, 5000); // Efface le message après 5 secondes
  }

  isInvalid(controlName: string): boolean {
    const control = this.changePasswordForm.get(controlName);
    return !!(control && control.invalid && (control.touched || control.dirty));
  }


  openFileSelector(): void {
    this.photoInput.nativeElement.click();
  }

  // Méthode pour basculer la visibilité du mot de passe
  toggleNewPasswordVisibility(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  // Ferme le modal de changement de mot de passe et ouvre celui de profil
  private closePasswordModalAndShowProfileModal(): void {
    this.isPasswordModalVisible = false; // Fermer le modal de changement de mot de passe
    setTimeout(() => {
      this.isModalVisible = true; // Afficher le modal de profil après un délai
    }, 300); // Ajuster la durée selon l'animation
  }
  logout(): void {
    this.userService.logout();
  }
}
