import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CollecteService } from '../../../services/collecte.service';
import { CaptureService } from '../../../services/capture.service'; // Importer le service CaptureService
import { CommonModule } from '@angular/common';
import { AnalyseComponent } from './analyse/analyse.component';

@Component({
  selector: 'app-user-page',
  standalone: true,
  imports: [AnalyseComponent, CommonModule],
  templateUrl: './user-page.component.html',
  styleUrls: ['./user-page.component.css'],
})
export class UserPageComponent implements OnInit {
  public loading: boolean = false;
  public currentMonthData: any[] = [];
  public realTimeData: any[] = [];  // Stocker les données en temps réel
  public currentPage: number = 1;
  public pageSize: number = 8; // Limiter à 8 éléments par page

  constructor(
    private collecteService: CollecteService,
    private captureService: CaptureService,  // Injecter CaptureService
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.loadCurrentMonthData(); // Charger les données du mois en cours
    this.listenToRealTimeData();  // Écouter les données en temps réel via WebSocket
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

  // Formater la description des données
  getDescription(data: any): string {
    if (data.type === 'humidite') {
      return `Magasin est humide ${data.value}% à ${data.time}`;
    } else {
      return `Température du magasin est de ${data.value}°C à ${data.time}`;
    }
  }

  // Méthode pour obtenir la valeur de température ou d'humidité en temps réel pour une heure donnée
  getRealTimeValue(type: string, hour: string): string | null {
    // Filtrer les données en fonction de l'heure et du type (temperature ou humidite)
    const data = this.realTimeData.filter(
      (item) => item.heure === hour && item[type] !== undefined
    );

    // Retourner la première valeur trouvée ou null si aucune donnée correspond
    return data.length > 0 ? data[0][type].toString() : null;
  }

  // Écouter les nouvelles données en temps réel via WebSocket
  listenToRealTimeData(): void {
    this.captureService.listenToRealTimeData().subscribe((data) => {
      // Ajouter les nouvelles données à la liste des données en temps réel
      this.realTimeData.push(data);

      // Vous pouvez trier les données par heure ou appliquer d'autres filtres si nécessaire
      this.realTimeData.sort((a, b) => a.time.localeCompare(b.time));

      // Vous pouvez également filtrer pour n'afficher que les dernières données
      // ou les données d'heures spécifiques (10:00, 14:00, 17:00)
    });
  }
}
