import { Component, OnInit } from '@angular/core';
import { AnalyseComponent } from './analyse/analyse.component';
import { UserService } from '../../../services/user.service';
import { CapteurDataService } from '../../../services/capteur-data.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [AnalyseComponent],
  templateUrl: './admin-page.component.html',
  styleUrl: './admin-page.component.css'
})
export class AdminPageComponent implements OnInit{
  user: any;
  currentDateTime: string = '';
  temperatureData: any[] = [];  // Pour stocker les données de température récupérées
  humiditeData: any[] = []; //
  errorMessage: string = '';


  constructor(private userService: UserService, private capteurDataService: CapteurDataService, private cdr: ChangeDetectorRef){}

  ngOnInit(): void {
    this.user = this.userService.getCurrentUser();
    this.updateDateTime();
    this.fetchLastDayData();
  }

  updateDateTime(): void {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short', // Affiche le mois sous forme abrégée (e.g., "Nov")
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    };
    this.currentDateTime = new Intl.DateTimeFormat('en-US', options).format(now);
  }

  fetchLastDayData(): void {
    this.capteurDataService.getLastDayData().subscribe({
      next: (response) => {
        console.log('Réponse API :', response);  // Pour vérifier la structure des données
        this.temperatureData = response.data;

        // Affiche les heures retournées pour vérifier qu'elles sont bien formatées
        this.temperatureData.forEach((data) => {
          console.log('Heure retournée:', data.heure);
        });
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des données :', error);
        this.errorMessage = 'Impossible de récupérer les données.';
      },
    });
  }

  getTemperatureAt(heure: string): string {
    const formattedHeure = heure.slice(0, 5); // Transforme l'heure au format "HH:mm"
    console.log('Heure formatée à rechercher:', formattedHeure);  // Affiche l'heure recherchée

    const data = this.temperatureData.find((d) => {
      const formattedDataHeure = d.heure.slice(0, 5); // Formate la donnée de l'heure pour comparaison
      console.log('Comparaison entre', formattedHeure, 'et', formattedDataHeure);  // Compare les heures
      return formattedDataHeure === formattedHeure;
    });

    return data ? `${data.temperature} °C` : '...';
  }

  getHumiditeAt(heure: string): string {
    const formattedHeure = heure.slice(0, 5); // Transforme l'heure au format "HH:mm"
    console.log('Heure formatée à rechercher pour humidité:', formattedHeure);  // Affiche l'heure recherchée

    const data = this.temperatureData.find((d) => {
      const formattedDataHeure = d.heure.slice(0, 5); // Formate la donnée de l'heure pour comparaison
      console.log('Comparaison entre', formattedHeure, 'et', formattedDataHeure);  // Compare les heures
      return formattedDataHeure === formattedHeure;
    });

    return data ? `${data.humidite} %` : '...';
  }

}
