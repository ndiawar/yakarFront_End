import { Component, AfterViewInit, ViewChild, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Chart } from 'chart.js/auto';
import { CollecteService } from '../../../../services/collecte.service';

@Component({
  selector: 'app-analyse',
  standalone: true, // Marque le composant comme standalone
  templateUrl: './analyse.component.html',
  styleUrls: ['./analyse.component.css'],
})

export class AnalyseComponent implements AfterViewInit {
  @ViewChild('chartCanvas', { static: false }) chartCanvas!: ElementRef;

  public chart: Chart | undefined;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private collecteService: CollecteService // Injection du service
  ) {}

  async ngAfterViewInit(): Promise<void> {
    // Vérifie si l'exécution se fait dans le navigateur
    if (isPlatformBrowser(this.platformId)) {
      const canvas = this.chartCanvas.nativeElement as HTMLCanvasElement;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        try {
          // Appeler la méthode du service pour récupérer la moyenne mensuelle
          const monthlyAverage = await this.collecteService.getMonthlyAverage();
          
          // Si les données sont disponibles, les utiliser dans le graphique
          if (monthlyAverage) {
            // Extraire les données de la moyenne mensuelle pour température et humidité
            const { temperatureMoyenne, humiditeMoyenne } = monthlyAverage;

            // Créer le graphique avec les moyennes mensuelles
            this.chart = new Chart(ctx, {
              type: 'line',
              data: {
                labels: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'Dimanche'],
                datasets: [
                  {
                    label: 'Humidité',
                    data: [5, 10, 8, 12, 9, 13, 15], // Remplacer avec les vraies données si disponibles
                    borderColor: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    tension: 0.4,
                    borderWidth: 2,
                  },
                  {
                    label: 'Température',
                    data: [3, 7, 12, 10, 15, 18, 20], // Remplacer avec les vraies données si disponibles
                    borderColor: 'red',
                    backgroundColor: 'rgba(255, 0, 0, 0.2)',
                    tension: 0.4,
                    borderWidth: 2,
                  },
                  // Moyenne mensuelle de l'humidité
                  {
                    label: 'Moyenne Humidité',
                    data: new Array(7).fill(humiditeMoyenne), // Répéter la moyenne sur toute la semaine
                    borderColor: 'blue',
                    backgroundColor: 'rgba(0, 0, 255, 0.2)',
                    tension: 0.4,
                    borderWidth: 2,
                    borderDash: [5, 5], // Ligne pointillée
                  },
                  // Moyenne mensuelle de la température
                  {
                    label: 'Moyenne Température',
                    data: new Array(7).fill(temperatureMoyenne), // Répéter la moyenne sur toute la semaine
                    borderColor: 'green',
                    backgroundColor: 'rgba(0, 255, 0, 0.2)',
                    tension: 0.4,
                    borderWidth: 2,
                    borderDash: [5, 5], // Ligne pointillée
                  },
                ],
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    labels: {
                      color: 'white', // Texte des légendes en blanc
                    },
                    position: 'top',
                  },
                  tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    titleColor: 'white',
                    bodyColor: 'white',
                  },
                },
                scales: {
                  x: {
                    ticks: {
                      color: 'white', // Texte des axes en blanc
                    },
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)', // Lignes de la grille
                    },
                  },
                  y: {
                    ticks: {
                      color: 'white',
                    },
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)',
                    },
                    beginAtZero: true,
                  },
                },
              },
            });
          } else {
            console.error('Les données de moyenne mensuelle ne sont pas disponibles');
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des moyennes mensuelles:', error);
        }
      } else {
        console.error('Impossible d’obtenir le contexte du canevas.');
      }
    }
  }
}
