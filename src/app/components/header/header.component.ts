import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  user: any; // L'utilisateur connecté
  isDarkMode: boolean = false; // Etat du thème (mode sombre/claire)

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    this.loadUserData();
    this.isDarkMode = this.checkDarkMode(); // Vérifier le mode actuel
  }

  // Charger les données de l'utilisateur depuis le service
  loadUserData(): void {
    this.userService.getProfile().subscribe(
      (data) => {
        this.user = data; // Assurez-vous que votre service renvoie bien l'utilisateur
      },
      (error) => {
        console.error('Erreur de chargement des données utilisateur', error);
      }
    );
  }

  // Vérifier si le mode sombre est activé (en utilisant les cookies)
  checkDarkMode(): boolean {
    const theme = document.cookie.match(/theme=(dark|light)/);
    return theme ? theme[1] === 'dark' : false; // Retourne true si 'dark' ou false si 'light' ou cookie non trouvé
  }

  // Changer le thème
  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    document.cookie = `theme=${this.isDarkMode ? 'dark' : 'light'}; path=/`;
    document.body.classList.toggle('dark-mode', this.isDarkMode); // Appliquer le thème
  }

  // Méthode de déconnexion
  logout(): void {
    this.userService.logout().subscribe(
      () => {
        this.router.navigate(['/login']); // Rediriger vers la page de connexion après la déconnexion
      },
      (error) => {
        console.error('Erreur lors de la déconnexion:', error);
      }
    );
  }
}
