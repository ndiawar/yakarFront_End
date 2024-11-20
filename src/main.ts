import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component'; // Importer le composant principal
import { routes } from './app/app.routes';

// Initialisation de l'application avec le routage
bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes) // Fournir la configuration des routes ici
  ]
})
  .catch(err => console.error(err));
