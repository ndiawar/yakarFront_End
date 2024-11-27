import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { MenuComponent } from './components/menu/menu.component';
import { CommonModule } from '@angular/common'; // Ajout du CommonModule pour *ngIf
import { HttpClientModule } from '@angular/common/http';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    MenuComponent,
    HttpClientModule,
    CommonModule, // Nécessaire pour utiliser *ngIf
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'yakarFront';
  showLayout = true; // Contrôle l'affichage des composants globaux

  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Normalisez l'URL pour éviter les conflits (redirections, query params)
        const cleanUrl = event.urlAfterRedirects.split('?')[0];
        const noLayoutRoutes = ['/', '/login', '/register']; // Routes sans layout
        this.showLayout = !noLayoutRoutes.includes(cleanUrl);
      }
    });
  }

}
