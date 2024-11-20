import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],  // Ajoutez CommonModule ici
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  isDarkMode = true; // Define the initial theme state (dark mode by default)

  constructor() {}

  ngOnInit(): void {
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
  

  private updateIcon(): void {
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
      // Update the icon based on the initial theme
      themeIcon.className = this.isDarkMode ? 'bi bi-moon-fill' : 'bi bi-sun-fill';
    }
  }
}
