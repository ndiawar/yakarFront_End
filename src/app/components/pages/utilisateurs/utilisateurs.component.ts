import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbPaginationModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { UserApiService } from '../../../services/user-api.service';
import { ChangeDetectorRef } from '@angular/core';

// Interface User adaptée au modèle backend
interface User {
  _id: string;
  name: string;
  email: string;
  telephone: string;
  adresse: string;
  photo?: string;
  status: boolean;
  authentication: {
    secretCode: string;
  };
  roles: string[];
  createdAt: Date;
  date_modification: Date | null;
}

@Component({
  selector: 'app-utilisateurs',
  standalone: true,
  imports: [CommonModule, NgbPaginationModule, FormsModule],
  templateUrl: './utilisateurs.component.html',
  styleUrls: ['./utilisateurs.component.css'],
})
export class UtilisateursComponent implements OnInit {
  users: User[] = [];
  paginatedUsers: User[] = [];
  currentPage = 1;
  pageSize = 15;
  searchTerm = '';
  selectedRole = '';
  sortKey = '';
  sortOrder: 'asc' | 'desc' = 'asc';
  isLoading = false;
  errorMessage: string | null = null;
  userToEdit: User = {
    _id: '',
    name: '',
    email: '',
    telephone: '',
    adresse: '',
    photo: '',
    status: false,
    authentication: {
      secretCode: ''
    },
    roles: [],
    createdAt: new Date(),
    date_modification: null
  };

  newUser = {
    name: '',
    email: '',
    telephone: '',
    adresse: '',
    photo: '',
    password: ''
  };

  photoFile: File | null = null;
  photoPreview: string | null = null;
  isSubmitting = false;

  @ViewChild('registerModal') registerModal!: ElementRef;
  @ViewChild('updateModal') updateModal!: ElementRef;
  @ViewChild('confirmDeleteModal') confirmDeleteModal!: ElementRef;
  userToDelete: User | null = null;

  constructor(
    private userApiService: UserApiService,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.fetchUsers();
  }
  loadUsers(): void {
    this.isLoading = true;
    this.userApiService.fetchUsers()
      .then(users => {
        this.users = users;
        this.isLoading = false;
      })
      .catch(error => {
        this.errorMessage = 'Erreur lors du chargement des utilisateurs.';
        this.isLoading = false;
      });
  }


  openModal(): void {
    this.modalService.open(this.registerModal, { centered: true });
  }

  closeModal(): void {
    this.modalService.dismissAll();
  }

  fetchUsers(activeOnly: boolean = true): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.userApiService
      .fetchUsers(activeOnly)
      .then((users) => {
        this.users = users || [];
        this.updatePagination();
      })
      .catch((error) => {
        console.error('Erreur lors de la récupération des utilisateurs:', error.message);
        this.errorMessage = error.message || 'Une erreur est survenue lors de la récupération des utilisateurs.';
        this.users = [];
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  updatePagination(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.currentPage = Math.min(
      this.currentPage,
      Math.ceil(this.users.length / this.pageSize)
    );
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

  onPhotoSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.photoFile = file;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.photoPreview = e.target.result;
        this.newUser.photo = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  registerNewUser(): void {
    this.isSubmitting = true;

    const user = {
      name: this.newUser.name.trim(),
      email: this.newUser.email.trim(),
      telephone: this.newUser.telephone.trim(),
      adresse: this.newUser.adresse.trim(),
      password: this.newUser.password,
      photo: this.newUser.photo,
    };

    if (!this.validateUserInput(user)) {
      this.isSubmitting = false;
      return;
    }

    this.userApiService
      .registerUser(user)
      .then((data) => {
        console.log('Utilisateur inscrit avec succès:', data);
        this.users.push(data.user);
        this.updatePagination();
        this.closeModal();
        this.resetNewUserForm();
        this.errorMessage = null;
      })
      .catch((error) => {
        console.error('Erreur lors de l’inscription:', error.message);
        this.errorMessage = error.message;
      })
      .finally(() => {
        this.isSubmitting = false;
      });
  }

  validateUserInput(user: { name: string; email: string; telephone: string; adresse: string; password: string; photo?: string }): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(70|75|76|77|78)\d{7}$/;

    if (!user.name || !user.email || !user.telephone || !user.adresse || !user.password) {
      this.errorMessage = 'Tous les champs obligatoires doivent être remplis.';
      return false;
    }

    if (!emailRegex.test(user.email)) {
      this.errorMessage = 'Adresse e-mail invalide.';
      return false;
    }

    if (!phoneRegex.test(user.telephone)) {
      this.errorMessage = 'Le numéro de téléphone est invalide.';
      return false;
    }

    if (user.password.length < 8) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 8 caractères.';
      return false;
    }

    return true;
  }

  resetNewUserForm(): void {
    this.newUser = {
      name: '',
      email: '',
      password: '',
      telephone: '',
      adresse: '',
      photo: ''
    };
    this.photoFile = null;
    this.photoPreview = null;
  }

  toggleStatus(user: User): void {
    user.status = !user.status;
  }

  onToggleUserRole(user: any): void {
    this.userApiService
      .toggleUserRole(user._id)
      .then((response) => {
        const updatedUser = response.user;
        user.roles = updatedUser.roles;
        console.log(`Rôle mis à jour : ${updatedUser.roles}`);
      })
      .catch((error) => {
        console.error('Erreur lors du basculement du rôle :', error);
        alert('Une erreur est survenue lors de la mise à jour du rôle.');
      });
  }

  openConfirmDeleteModal(user: User): void {
    this.userToDelete = user;
    this.modalService.open(this.confirmDeleteModal);
  }

  closeDeleteModal(): void {
    this.modalService.dismissAll();
    this.userToDelete = null; // Réinitialiser l'utilisateur à supprimer
  }

  confirmDelete(): void {
    if (this.userToDelete) {
      this.onDeleteUser(this.userToDelete._id);
    }
    this.closeDeleteModal();
  }

  onDeleteUser(userId: string): void {
    this.userApiService
      .disableUser(userId)
      .then((response) => {
        const updatedUser = response.user;
        const index = this.users.findIndex((user) => user._id === userId);
        if (index !== -1) {
          this.users[index].status = updatedUser.status;
        }
        console.log('Utilisateur désactivé avec succès.');
      })
      .catch((error) => {
        console.error('Erreur lors de la désactivation de l\'utilisateur :', error);
        alert('Une erreur est survenue lors de la désactivation de l\'utilisateur.');
      });
  }

  editUser(user: User): void {
    this.userToEdit = { ...user };
    this.openModalUpdate();
  }

  updateUser(): void {
    this.userApiService
      .updateUser(this.userToEdit._id, this.userToEdit)
      .then(() => {
        this.users = this.users.map((user) =>
          user._id === this.userToEdit._id ? { ...this.userToEdit } : user
        );
        this.closeModal();
      })
      .catch((error) => {
        if (error.status === 400) {
          this.errorMessage = 'Cet identifiant existe déjà';
        } else {
          console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
          this.errorMessage = 'Une erreur est survenue lors de la mise à jour de l\'utilisateur.';
        }
      });
  }

  openModalUpdate(): void {
    this.modalService.open(this.updateModal, { ariaLabelledBy: 'modal-basic-title' });
  }

  closeModalUpdate(): void {
    this.modalService.dismissAll();
  }

  get uniqueRoles(): string[] {
    return [...new Set(this.users.flatMap((user) => user.roles))];
  }

  get activeUsersCount(): number {
    return this.users.filter((user) => user.status).length;
  }

  get adminUsersCount(): number {
    return this.users.filter((user) => user.roles.includes('admin')).length;
  }

  onSearch(): void {
    if (this.searchTerm.trim().length > 0) {
      this.userApiService
        .searchUsers(this.searchTerm)
        .then((users) => {
          this.users = users;
          this.updatePagination();
        })
        .catch((error) => {
          this.errorMessage = error.message;
        });
    } else {
      this.fetchUsers();
    }
  }

  filteredUsers(): User[] {
    return this.users.filter((user) => {
      const matchesSearch =
        (user.name || '').toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (user.adresse || '').toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesRole = this.selectedRole
        ? user.roles.includes(this.selectedRole)
        : true;

      return matchesSearch && matchesRole;
    });
  }
}