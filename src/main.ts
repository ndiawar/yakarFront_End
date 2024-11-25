import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component'; // Importer le composant principal
import { routes } from './app/app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';
import { NgxEchartsModule, NGX_ECHARTS_CONFIG } from 'ngx-echarts';



const config = {
  // Configuration par défaut de ECharts
  echarts: {
    // Par exemple, vous pouvez spécifier des options par défaut pour le graphique
    theme: 'dark',
    // Vous pouvez aussi configurer des options comme le chargement de la bibliothèque ECharts ici
  }
};

// Initialisation de l'application avec le routage
bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideRouter(routes), provideAnimationsAsync(), // Fournir la configuration des routes ici
    { provide: NGX_ECHARTS_CONFIG, useValue: config }  // Ajouter le provider de configuration
  ]
})
  .catch(err => console.error(err));
