import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Chart } from 'chart.js/auto';
import { CollecteService } from '../../../../services/collecte.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-analyse',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './analyse.component.html',
  styleUrls: ['./analyse.component.css'],
})
export class AnalyseComponent implements OnInit, AfterViewInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef;
  public chart: Chart | null = null;
  public loading: boolean = false;
  public currentMonthData: any[] = [];
  public currentPage: number = 1;
  public pageSize: number = 8; // Limiter à 8 éléments par page
  public isSSR: boolean;

  constructor(
    private collecteService: CollecteService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Vérifie si le code est exécuté côté serveur ou navigateur
    this.isSSR = !isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    // Charger les données uniquement si on est côté navigateur
    if (!this.isSSR) {
      this.loadMonthlyAverages();
      this.loadCurrentMonthData();
    } else {
      console.warn('Les données ne seront pas chargées côté serveur.');
    }
  }

  ngAfterViewInit(): void {
    // Assurez-vous que Chart.js ne s'exécute que dans le navigateur
    if (!this.isSSR) {
      console.log('Initialisation côté client.');
    } else {
      console.warn('Chart.js ne peut pas être exécuté côté serveur.');
    }
  }

  // Charger les moyennes mensuelles
  async loadMonthlyAverages(): Promise<void> {
    this.loading = true;
    try {
      const response = await this.collecteService.getMonthlyAverage();
      if (response?.averages) {
        const labels = response.averages.map((item: any) => item._id);
        const avgTemperature = response.averages.map((item: any) => item.avgTemperature);
        const avgHumidite = response.averages.map((item: any) => item.avgHumidite);

        this.updateChart(labels, avgTemperature, avgHumidite);
      } else {
        console.warn('Aucune donnée trouvée pour les moyennes mensuelles.');
        alert('Aucune donnée disponible pour afficher les moyennes mensuelles.');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des moyennes mensuelles:', error);
    } finally {
      this.loading = false;
    }
  }

  // Charger les données du mois en cours avec pagination
  loadCurrentMonthData(): void {
    this.loading = true;
    this.collecteService.getCurrentMonthData(this.currentPage, this.pageSize).then(
      (data) => {
        this.currentMonthData = data.currentMonthData;
        this.loading = false;
      },
      (error) => {
        console.error('Erreur lors de la récupération des données du mois en cours :', error);
        this.loading = false;
      }
    );
  }

  // Gérer la pagination
  goToPage(page: number): void {
    if (page < 1) {
      return;
    }
    this.currentPage = page;
    this.loadCurrentMonthData();
  }

  // Mettre à jour le graphique avec les données
  updateChart(labels: string[], temperatureData: number[], humidityData: number[]): void {
    if (this.isSSR) {
      console.warn('Mise à jour du graphique ignorée car exécutée côté serveur.');
      return;
    }

    if (!this.chartCanvas) {
      console.error("Le canevas pour le graphique n'est pas trouvé.");
      return;
    }

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) {
      console.error("Impossible d'obtenir le contexte du canevas.");
      return;
    }

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Température Moyenne (°C)',
            data: temperatureData,
            borderColor: '#00FF47',
            backgroundColor: 'rgba(0, 255, 71, 0.5)',
            fill: true,
          },
          {
            label: 'Humidité Moyenne (%)',
            data: humidityData,
            borderColor: '#12692b',
            backgroundColor: 'rgba(18, 105, 43, 0.5)',
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
          },
          tooltip: {
            enabled: true,
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Mois',
            },
          },
          y: {
            title: {
              display: true,
              text: 'Valeur',
            },
          },
        },
      },
    });
  }

  // Formater la description des données
  getDescription(data: any): string {
    if (data.type === 'humidite') {
      return `Magasin est humide ${data.value}% à ${data.time}`;
    } else {
      return `Température du magasin est de ${data.value}°C à ${data.time}`;
    }
  }
}