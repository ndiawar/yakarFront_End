import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [CommonModule, NgbPaginationModule, FormsModule],
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.css'],
})
export class LogsComponent {
  logs = [
    { _id: 1, date: new Date('2024-11-17'), heure: '12:30', action: 'Connexion réussie', id_users: 101 },
    { _id: 2, date: new Date('2024-11-16'), heure: '14:15', action: 'Déconnexion', id_users: 102 },
    { _id: 3, date: new Date('2024-11-16'), heure: '10:45', action: 'Modification profil', id_users: 101 },
    { _id: 4, date: new Date('2024-11-15'), heure: '08:20', action: 'Connexion échouée', id_users: 103 },
    { _id: 5, date: new Date('2024-11-15'), heure: '16:00', action: 'Suppression compte', id_users: 104 },
  ];

  currentPage = 1;
  pageSize = 5;
  paginatedLogs = [...this.logs];
  searchTerm = '';
  sortKey = '';
  sortOrder: 'asc' | 'desc' = 'asc';

  constructor() {
    this.updatePagination();
  }

  updatePagination(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedLogs = this.filteredLogs().slice(startIndex, endIndex);
  }

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

  filteredLogs() {
    return this.logs.filter((log) =>
      log.action.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}
