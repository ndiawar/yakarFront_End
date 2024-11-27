import { Component, OnInit, AfterViewInit } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
<<<<<<< HEAD
import { FormsModule } from '@angular/forms';
=======
import { Chart } from 'chart.js/auto';
import { CapteurDataService } from '../../../../services/capteur-data.service';

interface CapteurData {
  date: string;
  heure: string;
  temperature: number | null;
  humidite: number | null;
}
>>>>>>> 9a03d3563b287ab2ab31d596ae1ff3dfec406093

@Component({
  selector: 'app-analyse',
  standalone: true,
<<<<<<< HEAD
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
=======
  imports: [HttpClientModule, FormsModule, CommonModule],
  templateUrl: './analyse.component.html',
  styleUrls: ['./analyse.component.css'],
})
export class AnalyseComponent implements OnInit {
  selectedYear: number = new Date().getFullYear();
  selectedMonth: number = new Date().getMonth() + 1;
  selectedWeek: number = 1;
  capteurDataList: any[] = [];
  groupedData: { date: string; heure: string; temperature: number | null; humidite: number | null }[] = [];
  page: number = 1;
  limit: number = 5;

  chart: any;

  constructor(private http: HttpClient, private capteurDataService: CapteurDataService) {}

  ngOnInit(): void {
    this.loadData();
    this.updateChart(); // On met à jour le graphique lors du chargement du composant
  }

  ngAfterViewInit(): void {
    // Cette fonction garantit que le DOM est prêt avant de tenter d'accéder à l'élément canvas
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      this.createChart([], []); // Initialisation vide avant la récupération des données
    }
  }

  // Fonction pour mettre à jour le graphique avec les sélections de l'utilisateur
  updateChart(): void {
    const payload = {
      year: this.selectedYear,
      month: this.selectedMonth,
      week: this.selectedWeek,
    };

    // Requête API pour récupérer les données de la semaine
    this.http
      .post('http://localhost:5001/api/capteurs/weekly-average', payload)
      .subscribe({
        next: (data: any) => {
          console.log('Données de l\'API :', data);  // Debugging des données
          const avgTemperatures = data.avgTemperatures || [];
          const avgHumidites = data.avgHumidites || [];
          // Création du graphique avec les données récupérées
          if (typeof window !== 'undefined' && typeof document !== 'undefined') {
            this.createChart(avgTemperatures, avgHumidites);
          }
        },
        error: (err) => {
          console.error('Erreur lors de la récupération des données :', err);
        },
      });
>>>>>>> 9a03d3563b287ab2ab31d596ae1ff3dfec406093
  }
loadWeeklyAverage(): void {
  this.loading = true;

<<<<<<< HEAD
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

=======
  // Fonction pour créer et afficher le graphique avec Chart.js
  createChart(avgTemperatures: number[], avgHumidites: number[]): void {
    // Si un graphique existe déjà, on le détruit pour éviter les doublons
>>>>>>> 9a03d3563b287ab2ab31d596ae1ff3dfec406093
    if (this.chart) {
      this.chart.destroy();  // Détruire le graphique existant avant de le recréer
    }

<<<<<<< HEAD
    // Créer le graphique avec les nouvelles données
=======
    // Récupération de l'élément canvas dans le DOM
    const ctx = document.getElementById('chartCanvas') as HTMLCanvasElement;

    // Création du graphique avec les températures et humidités moyennes
>>>>>>> 9a03d3563b287ab2ab31d596ae1ff3dfec406093
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'], // Jours de la semaine
        datasets: [
          {
            label: 'Température moyenne (°C)',
            data: avgTemperatures,
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 2,
            fill: false,
          },
          {
            label: 'Humidité moyenne (%)',
            data: avgHumidites,
            borderColor: '#12692b',
            backgroundColor: 'rgba(18, 105, 43, 0.5)',
            borderWidth: 2,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
<<<<<<< HEAD
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
=======
        scales: {
          y: {
>>>>>>> 9a03d3563b287ab2ab31d596ae1ff3dfec406093
            beginAtZero: true,
          },
        },
      },
    });
  }

<<<<<<< HEAD
  // Méthode pour générer la description des données
  getDescription(data: any): string {
    if (data.type === 'humidite') {
      return `Magasin est humide ${data.value}% à ${data.time}`;
    } else {
      return `Température du magasin est de ${data.value}°C à ${data.time}`;
=======
  // Charger les données avec pagination
  loadData() {
    this.capteurDataService.getCapteurDatas(this.page, this.limit).subscribe(
      (response: { data: CapteurData[] }) => {
        this.capteurDataList = response.data;
        this.groupByDateAndHour();
      },
      (error) => {
        console.error('Erreur lors du chargement des données:', error);
      }
    );
  }

  groupByDateAndHour() {
    const grouped: { [key: string]: { date: string; heure: string; temperature: number | null; humidite: number | null } } = {};
    this.capteurDataList.forEach((item: CapteurData) => {
      const key = `${item.date}-${item.heure}`;
      if (!grouped[key]) {
        grouped[key] = { date: item.date, heure: item.heure, temperature: null, humidite: null };
      }
      if (item.temperature !== null) grouped[key].temperature = item.temperature;
      if (item.humidite !== null) grouped[key].humidite = item.humidite;
    });

    this.groupedData = Object.values(grouped)
      .filter((entry) => entry.temperature !== null && entry.humidite !== null)
      .sort((a, b) => {
        if (a.date > b.date) return -1;
        if (a.date < b.date) return 1;
        return a.heure > b.heure ? -1 : 1;
      });
  }

  previousPage() {
    if (this.page > 1) {
      this.page--;
      this.loadData();
>>>>>>> 9a03d3563b287ab2ab31d596ae1ff3dfec406093
    }
  }

  nextPage() {
    this.page++;
    this.loadData();
  }
}
