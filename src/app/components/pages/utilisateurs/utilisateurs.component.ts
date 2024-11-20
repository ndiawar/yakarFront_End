import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms'; // Ajoutez ceci !

@Component({
  selector: 'app-utilisateurs',
  standalone: true,
  imports: [CommonModule, NgbPaginationModule, FormsModule], // Ajoutez FormsModule ici !
  templateUrl: './utilisateurs.component.html',
  styleUrls: ['./utilisateurs.component.css'],
})
export class UtilisateursComponent {
  // Vos propriétés et méthodes restent identiques
  users = [
    { name: 'Nithya Menon', email: 'example@gmail.com', address: 'Bangalore', phone: '774567852', role: 'Utilisateur', image: 'https://via.placeholder.com/40' },
    { name: 'Meera Gonzalez', email: 'example@gmail.com', address: 'Toronto', phone: '774567852', role: 'Utilisateur', image: 'https://via.placeholder.com/40' },
    { name: 'Nithya Menon', email: 'example@gmail.com', address: 'Bangalore', phone: '774567852', role: 'Utilisateur', image: 'https://via.placeholder.com/40' },
    { name: 'Meera Gonzalez', email: 'example@gmail.com', address: 'Toronto', phone: '774567852', role: 'Utilisateur' , image: 'https://via.placeholder.com/40' },
    { name: 'Karthik Subramanian', email: 'example@gmail.com', address: 'Coimbatore', phone: '774567852', role: 'Utilisateur', image: 'https://via.placeholder.com/40' },
    { name: 'Mithra B', email: 'example@gmail.com', address: 'Vancouver', phone: '774567852', role: 'Utilisateur', image: 'https://via.placeholder.com/40' },
    { name: 'Jagathesh Narayanan', email: 'example@gmail.com', address: 'Coimbatore', phone: '774567852', role: 'Utilisateur', image: 'https://via.placeholder.com/40' },
    { name: 'Steve Rogers', email: 'example@gmail.com', address: 'Toronto', phone: '774567852', role: 'Utilisateur', image: 'https://via.placeholder.com/40' },
    { name: 'Richard Hendricks', email: 'example@gmail.com', address: 'Palo Alto', phone: '774567852', role: 'Utilisateur', image: 'https://via.placeholder.com/40' },
    { name: 'Monica Patel', email: 'example@gmail.com', address: 'Bangalore', phone: '774567852', role: 'Utilisateur', image: 'https://via.placeholder.com/40' },
  ];

  currentPage = 1;
  pageSize = 5;
  paginatedUsers = [...this.users];
  searchTerm = '';
  selectedRole = '';
  sortKey = '';
  sortOrder: 'asc' | 'desc' = 'asc';

  constructor() {
    this.updatePagination();
  }

  updatePagination(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedUsers = this.filteredUsers().slice(startIndex, endIndex);
  }

  sortTable(key: string): void {
    if (this.sortKey === key) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortOrder = 'asc';
    }

    this.users.sort((a, b) => {
      const aValue = (a as any)[key];
      const bValue = (b as any)[key];

      if (aValue < bValue) return this.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    this.updatePagination();
  }

  get uniqueRoles(): string[] {
    return [...new Set(this.users.map((user) => user.role))];
  }

  filteredUsers() {
    return this.users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.address.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesRole = this.selectedRole ? user.role === this.selectedRole : true;

      return matchesSearch && matchesRole;
    });
  }
}
