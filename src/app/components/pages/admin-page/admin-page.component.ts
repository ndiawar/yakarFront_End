import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';  // Importez FormsModule
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CapteurDataService } from '../../../services/capteur-data.service';
import { AnalyseComponent } from './analyse/analyse.component';



@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [AnalyseComponent, CommonModule,FormsModule],
  templateUrl: './admin-page.component.html',
  styleUrl: './admin-page.component.css'
})
export class AdminPageComponent implements OnInit{
  fanStatus: boolean = false;
  user: any;
  currentDateTime: string = '';
  temperatureData: any[] = [];  // Pour stocker les données de température récupérées
  humiditeData: any[] = []; //
  errorMessage: string = '';
  temperature: number = 0;
  humidite: number = 0;


  constructor(private userService: UserService, private capteurDataService: CapteurDataService, private cdr: ChangeDetectorRef){}

  ngOnInit(): void {
    this.user = this.userService.getCurrentUser();
    this.updateDateTime();
    this.fetchLastDayData();

    // Récupérer les données de l'API au démarrage du composant
    this.capteurDataService.getCapteurData().subscribe((data) => {
      // Prenez le dernier enregistrement de la journée (ou un autre critère selon vos besoins)
      const latestData = data[data.length - 1]; // ou une autre logique de filtrage pour l'heure actuelle
      this.currentDateTime = `${latestData.date} ${latestData.heure}`;
      this.temperature = latestData.temperature;
      this.humidite = latestData.humidite;
    });

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

  turnOnFan() {
    this.capteurDataService.controlFan('ON').subscribe(
      response => {
        console.log('Ventilateur allumé:', response);
      },
      error => {
        console.error('Erreur lors de l\'allumage du ventilateur:', error);
      }
    );
  }

  turnOffFan() {
    this.capteurDataService.controlFan('OFF').subscribe(
      response => {
        console.log('Ventilateur éteint:', response);
      },
      error => {
        console.error('Erreur lors de l\'extinction du ventilateur:', error);
      }
    );
  }



  // Méthode appelée lors du changement d'état du switch
  onFanToggle(event: any): void {
    const action = this.fanStatus ? 'ON' : 'OFF';  // 'ON' si true, 'OFF' si false

    this.capteurDataService.controlFan(action).subscribe(
      response => {
        console.log(`Ventilateur ${action === 'ON' ? 'allumé' : 'éteint'}`, response);
      },
      error => {
        console.error('Erreur lors du contrôle du ventilateur:', error);
      }
    );
  }

}