import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';  // Import CommonModule to use ngIf
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-menu',
  standalone: true,  // Standalone component
  imports: [RouterLink, RouterLinkActive, CommonModule],  // Add CommonModule here
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
  isLoggedIn: boolean = false;
  isAdmin: boolean = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Check if user is logged in and if they are an admin
    this.isLoggedIn = this.authService.isLoggedIn();
    this.isAdmin = this.authService.isAdmin();
  }
}