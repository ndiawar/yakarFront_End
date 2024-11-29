import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { LogsApiService } from '../../../services/logs-api.service';

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [CommonModule, NgbPaginationModule, FormsModule],
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.css'],
})
export class LogsComponent implements OnInit {
  logs: any[] = []; // Liste complète des logs
  paginatedLogs: any[] = []; // Logs paginés
  currentPage = 1; // Page courante
  pageSize = 15; // Nombre d'éléments par page
  searchTerm = ''; // Filtre de recherche
  sortKey = ''; // Clé de tri (date, heure, action, id_users)
  sortOrder: 'asc' | 'desc' = 'asc'; // Ordre de tri
  errorMessage = ''; // Message d'erreur (le cas échéant)

  constructor(private logsService: LogsApiService) {}

  async ngOnInit() {
    try {
      // Appel à l'API pour récupérer les logs
      this.logs = await this.logsService.getAllLogs();
      this.updatePagination(); // Mettre à jour la pagination avec les données récupérées
    } catch (error) {
      this.errorMessage = 'Impossible de récupérer les logs. Veuillez réessayer plus tard.';
      console.error(this.errorMessage, error);
    }
  }

  /**
   * Mettre à jour les logs paginés en fonction de la page actuelle et du filtre
   */
  updatePagination(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedLogs = this.filteredLogs().slice(startIndex, endIndex);
  }

  /**
   * Appliquer un tri à la table
   * @param key Clé sur laquelle trier
   */
  sortTable(key: string): void {
    if (this.sortKey === key) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortOrder = 'asc';
    }
  
    this.logs.sort((a, b) => {
      const aValue = (a as any)[key];
      const bValue = (b as any)[key];
  
      if (aValue < bValue) return this.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  
    this.updatePagination();
  }
  
  /**
   * Filtrer les logs en fonction du terme de recherche
   */
  filteredLogs(): any[] {
    return this.logs.filter((log) => {
      const term = this.searchTerm.toLowerCase();
      return (
        log.action.toLowerCase().includes(term) || 
        log.userName.toLowerCase().includes(term) // Recherche dans le nom d'utilisateur
      );
    });
  }
  
}
