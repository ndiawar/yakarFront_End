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
  public loading: boolean = false;
  public errorMessage: string | null = null;
  public date: string = '2024-11-11';  // Exemple de date, tu peux la rendre dynamique

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
          // Appeler la méthode du service pour récupérer la moyenne journalière pour une date spécifique
          this.loading = true;
          const dailyAverage = await this.collecteService.getMoyenneJournaliere(this.date);

          // Si les données sont disponibles, les utiliser dans le graphique
          if (dailyAverage) {
            const { moyTemp, moyHum } = dailyAverage;  // Suppose que ces valeurs sont retournées par l'API

            // Créer le graphique avec les moyennes journalières
            this.chart = new Chart(ctx, {
              type: 'line',
              data: {
                labels: [this.date], // Affiche la date comme l'axe X
                datasets: [
                  {
                    label: 'Température Moyenne (°C)',
                    data: [moyTemp], // Température moyenne de la journée
                    borderColor: 'red',
                    backgroundColor: 'rgba(255, 0, 0, 0.2)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2,
                  },
                  {
                    label: 'Humidité Moyenne (%)',
                    data: [moyHum], // Humidité moyenne de la journée
                    borderColor: 'blue',
                    backgroundColor: 'rgba(0, 0, 255, 0.2)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2,
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
            console.error('Les données de moyenne journalière ne sont pas disponibles');
            this.errorMessage = 'Aucune donnée disponible pour la date spécifiée.';
          }
        } catch (error) {
          console.error('Erreur lors de la récupération de la moyenne journalière:', error);
          this.errorMessage = 'Erreur lors du chargement des données journalières.';
        } finally {
          this.loading = false;
        }
      } else {
        console.error('Impossible d’obtenir le contexte du canevas.');
      }
    }
  }
}
