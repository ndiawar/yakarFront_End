import { Component, OnInit, AfterViewInit } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-analyse',
  standalone: true,
  imports: [HttpClientModule, FormsModule, CommonModule],
  templateUrl: './analyse.component.html',
  styleUrls: ['./analyse.component.css'],
})
export class AnalyseComponent implements OnInit {
  selectedYear: number = new Date().getFullYear();
  selectedMonth: number = new Date().getMonth() + 1;
  selectedWeek: number = 1;

  chart: any;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
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
  }

  // Fonction pour créer et afficher le graphique avec Chart.js
  createChart(avgTemperatures: number[], avgHumidites: number[]): void {
    // Si un graphique existe déjà, on le détruit pour éviter les doublons
    if (this.chart) {
      this.chart.destroy();
    }

    // Récupération de l'élément canvas dans le DOM
    const ctx = document.getElementById('chartCanvas') as HTMLCanvasElement;

    // Création du graphique avec les températures et humidités moyennes
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
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }
}
