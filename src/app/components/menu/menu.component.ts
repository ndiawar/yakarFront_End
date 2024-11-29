import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service'; // Assurez-vous d'importer le service UserService

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
  isLoggedIn: boolean = false;
  isAdmin: boolean = false;
  isUser: boolean = false;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    // Vérification si l'utilisateur est connecté et son rôle
    this.isLoggedIn = this.userService.isLoggedIn();
    this.isAdmin = this.userService.isAdmin();
    this.isUser = this.userService.isUser();
  }

  // Méthode pour vérifier si l'utilisateur est autorisé à accéder à un certain lien
  canAccessAdmin(): boolean {
    return this.isAdmin;
  }

  canAccessUser(): boolean {
    return this.isUser;
  }
}
