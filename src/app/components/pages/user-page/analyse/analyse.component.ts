import { Component, AfterViewInit, ViewChild, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-analyse',
  standalone: true, // Marque le composant comme standalone
  templateUrl: './analyse.component.html',
  styleUrls: ['./analyse.component.css'],
})
export class AnalyseComponent implements AfterViewInit {
  @ViewChild('chartCanvas', { static: false }) chartCanvas!: ElementRef;

  public chart: Chart | undefined;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  ngAfterViewInit(): void {
    // Vérifie si l'exécution se fait dans le navigateur
    if (isPlatformBrowser(this.platformId)) {
      const canvas = this.chartCanvas.nativeElement as HTMLCanvasElement;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        this.chart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'Dimanche'],
            datasets: [
              {
                label: 'Humidité',
                data: [5, 10, 8, 12, 9, 13, 15],
                borderColor: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                tension: 0.4,
                borderWidth: 2,
              },
              {
                label: 'Température',
                data: [3, 7, 12, 10, 15, 18, 20],
                borderColor: 'red',
                backgroundColor: 'rgba(255, 0, 0, 0.2)',
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
        console.error('Impossible d’obtenir le contexte du canevas.');
      }
    }
  }
}
