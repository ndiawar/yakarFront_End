import { Component } from '@angular/core';
import { AnalyseComponent } from './analyse/analyse.component';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [AnalyseComponent],
  templateUrl: './admin-page.component.html',
  styleUrl: './admin-page.component.css'
})
export class AdminPageComponent {
  public realTimeData: any[] = [];  // Stocker les données en temps réel


// Méthode pour obtenir la valeur de température ou d'humidité en temps réel pour une heure donnée
getRealTimeValue(type: string, hour: string): string | null {
  // Filtrer les données en fonction de l'heure et du type (temperature ou humidite)
  const data = this.realTimeData.filter(
    (item) => item.heure === hour && item[type] !== undefined
  );

  // Retourner la première valeur trouvée ou null si aucune donnée correspond
  return data.length > 0 ? data[0][type].toString() : null;
}

}



