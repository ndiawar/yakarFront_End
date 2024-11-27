import { UserService } from '../../../../services/user.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';  // Assurez-vous que CommonModule est importé ici
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-my-account',
  standalone: true,
  imports: [CommonModule],  // Ajoutez CommonModule ici
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.css']
})
export class MyAccountComponent implements OnInit, OnDestroy {
  isDarkMode = true; // Define the initial theme state (dark mode by default)
  user: any;
  private currentUserSubscription!: Subscription;  // Utilisation de '!' pour indiquer que cette propriété sera initialisée

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.user = this.userService.getCurrentUser();
    this.currentUserSubscription = this.userService.currentUser.subscribe((user) => {
      this.user = user;
    });

    // Vérifie si le mode est déjà défini dans localStorage
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const theme = localStorage.getItem('theme') || 'dark-theme';
      this.isDarkMode = theme === 'dark-theme'; // Set initial theme based on localStorage
      document.body.classList.add(theme);
      this.updateIcon(); // Call to update the icon on initial load
    }
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode; // Toggle the theme state
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
      // Update the icon class based on the current theme
      themeIcon.className = this.isDarkMode ? 'bi bi-moon-fill theme-icon moon' : 'bi bi-sun-fill theme-icon sun';
    }

    // Toggle between dark and light themes
    document.body.classList.toggle('dark-theme', this.isDarkMode);
    document.body.classList.toggle('light-theme', !this.isDarkMode);

    // Store the selected theme in localStorage
    localStorage.setItem('theme', this.isDarkMode ? 'dark-theme' : 'light-theme');
  }

  ngOnDestroy(): void {
    if (this.currentUserSubscription) {
      this.currentUserSubscription.unsubscribe();
    }
  }

  private updateIcon(): void {
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
      // Update the icon based on the initial theme
      themeIcon.className = this.isDarkMode ? 'bi bi-moon-fill' : 'bi bi-sun-fill';
    }
  }

  // Méthode pour déconnecter l'utilisateur
  logout(): void {
    this.userService.logout();  // On appelle la méthode logout du UserService
  }
}
