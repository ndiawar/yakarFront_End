import { isPlatformBrowser } from '@angular/common';
import { Component, AfterViewInit, ViewChild, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-analyse',
  standalone: true,
  imports: [],
  templateUrl: './analyse.component.html',
  styleUrls: ['./analyse.component.css']
})
export class AnalyseComponent implements AfterViewInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef;

  public chart: any;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Exécuter uniquement côté client
      const ctx = this.chartCanvas.nativeElement.getContext('2d');
      if (ctx) {
        this.chart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [
              {
                label: 'Température et Humidité Moyenne',
                data: [13, 22, 10, 15, 18, 23, 30],
                borderColor: 'green',
                backgroundColor: 'rgba(0, 255, 0, 0.1)',
                fill: true,
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                display: false,
              },
            },
          },
        });
      } else {
        console.error("Impossible d'obtenir le contexte du canevas.");
      }
    } else {
      console.warn("Chart.js ne peut pas être exécuté côté serveur.");
    }
  }
}
