import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Chart } from 'chart.js/auto';
import { CollecteService } from '../../../../services/collecte.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-analyse',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './analyse.component.html',
  styleUrls: ['./analyse.component.css'],
})
export class AnalyseComponent implements OnInit, AfterViewInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef;
  public chart: Chart | null = null;
  public loading: boolean = false;
  public currentMonthData: any[] = [];
  public currentPage: number = 1;
  public pageSize: number = 8;
  public hasNextPage: boolean = true;
  public errorMessage: string | null = null;
  public activeFilter: string = 'daily'; // Filtre actif par défaut
  public isSSR: boolean;

  constructor(
    private collecteService: CollecteService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isSSR = !isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (!this.isSSR) {
      this.loadDailyAverage('2024-11-11'); // Exemple d'une date pour tester
      this.loadCurrentMonthData();
      this.onFilterChange();  // Charger la moyenne en fonction de la sélection (journalier par défaut)
    } else {
      console.warn('Les données ne seront pas chargées côté serveur.');
    }
  }

  ngAfterViewInit(): void {
    if (!this.isSSR) {
      console.log('Initialisation côté client.');
    } else {
      console.warn('Chart.js ne peut pas être exécuté côté serveur.');
    }
  }

  // Méthode pour charger la moyenne journalière pour une date spécifique
  async loadDailyAverage(date: string): Promise<void> {
    this.loading = true;
    try {
      const response = await this.collecteService.getMoyenneJournaliere(date);
      if (response?.moyTemp && response?.moyHum) {
        this.errorMessage = null;
        const labels = [date];  // La date comme étiquette sur l'axe des X
        const avgTemperature = [response.moyTemp]; // Température moyenne de la journée
        const avgHumidite = [response.moyHum]; // Humidité moyenne de la journée

        // Mettre à jour le graphique avec ces données
        this.updateChart(labels, avgTemperature, avgHumidite);
      } else {
        this.errorMessage = 'Aucune donnée disponible pour la journée sélectionnée.';
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la moyenne journalière:', error);
      this.errorMessage = 'Erreur lors du chargement des données journalières.';
    } finally {
      this.loading = false;
    }
  }
loadWeeklyAverage(): void {
  this.loading = true;

  // Exemple de date pour la semaine du 11 novembre 2024
  const startOfWeekDate = '2024-11-11';

  // Appel de la méthode du service avec l'argument startOfWeekDate
  this.collecteService.getMoyenneHebdomadaire(startOfWeekDate).then(
    (data) => {
      if (data?.moyTempHebdo && data?.moyHumHebdo) {
        this.errorMessage = null;
        const labels = data.map((item: any) => item.semaine);  // Étiquettes des semaines
        const avgTemperature = data.map((item: any) => item.moyTempHebdo); // Température hebdomadaire
        const avgHumidite = data.map((item: any) => item.moyHumHebdo); // Humidité hebdomadaire

        // Mettre à jour le graphique avec ces données
        this.updateChart(labels, avgTemperature, avgHumidite);
      } else {
        this.errorMessage = 'Aucune donnée disponible pour la semaine.';
      }
    },
    (error) => {
      console.error('Erreur lors du chargement de la moyenne hebdomadaire:', error);
      this.errorMessage = 'Erreur lors du chargement des données hebdomadaires.';
    }
  ).finally(() => {
    this.loading = false;
  });
}


  // Méthode pour gérer le changement de filtre (moyenne journalière ou hebdomadaire)
  onFilterChange(): void {
    if (this.activeFilter === 'daily') {
      this.loadDailyAverage('2024-11-11'); // Exemple de date (tu pourrais mettre une date dynamique)
    } else {
      this.loadWeeklyAverage();
    }
  }

  // Méthode pour charger les données du mois en cours
  loadCurrentMonthData(): void {
    this.loading = true;
    this.collecteService.getCurrentMonthData(this.currentPage, this.pageSize).then(
      (data) => {
        this.currentMonthData = data.currentMonthData;
        this.hasNextPage = data.hasNextPage;
        this.errorMessage = null;
        this.loading = false;
      },
      (error) => {
        console.error('Erreur lors de la récupération des données du mois en cours :', error);
        this.errorMessage = 'Erreur lors de la récupération des données du mois en cours.';
        this.loading = false;
      }
    );
  }

  // Méthode pour changer de page (pagination des données)
  goToPage(page: number): void {
    if (page < 1) {
      return;
    }
    this.currentPage = page;
    this.loadCurrentMonthData();
  }

  // Méthode pour mettre à jour le graphique
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
      this.chart.destroy();  // Détruire le graphique existant avant de le recréer
    }

    // Créer le graphique avec les nouvelles données
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
            position: 'top',
          },
          tooltip: {
            enabled: true,
            callbacks: {
              label: (context) => {
                const value = context.raw as number;
                return `${context.dataset.label}: ${value.toFixed(2)}`;
              },
            },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Période',
            },
          },
          y: {
            title: {
              display: true,
              text: 'Valeurs',
            },
            beginAtZero: true,
          },
        },
      },
    });
  }

  // Méthode pour générer la description des données
  getDescription(data: any): string {
    if (data.type === 'humidite') {
      return `Magasin est humide ${data.value}% à ${data.time}`;
    } else {
      return `Température du magasin est de ${data.value}°C à ${data.time}`;
    }
  }
}
