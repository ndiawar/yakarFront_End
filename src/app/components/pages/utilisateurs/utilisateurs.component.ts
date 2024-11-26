import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { UserApiService } from '../../../services/user-api.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
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
    _id: '', // Should be provided or assigned later
    name: '',
    email: '',
    telephone: '',
    adresse: '',
    photo: '', // Optional
    status: false, // Default value, can be updated
    authentication: {
      secretCode: '' // Dummy value, replace when needed
    },
    roles: [], // Can be set based on the user's roles
    createdAt: new Date(), // Set to current date, adjust as necessary
    date_modification: null // Null or date as applicable
  };
  
  

  @ViewChild('registerModal') registerModal!: ElementRef;
  @ViewChild('updateModal') updateModal: any;  // Déclarez la référence du modal

  newUser = {
    name: '',
    email: '',
    telephone: '',
    adresse: '',
    photo: '', // Doit être une chaîne
    password: ''
  };
  

  photoFile: File | null = null; // Stockage temporaire du fichier photo
  photoPreview: string | null = null; // Prévisualisation de l'image
  isSubmitting = false;

  constructor(
    private userApiService: UserApiService,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchUsers();
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
        this.errorMessage =
          error.message || 'Une erreur est survenue lors de la récupération des utilisateurs.';
        this.users = [];
      })
      .finally(() => {
        this.isLoading = false;
      });
  }
  
  // Mise à jour de la pagination
  updatePagination(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.currentPage = Math.min(
      this.currentPage,
      Math.ceil(this.users.length / this.pageSize)
    );
    this.paginatedUsers = this.filteredUsers().slice(startIndex, endIndex);
  }

  // Filtrage des utilisateurs
  /* filteredUsers(): User[] {
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
  } */
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
  
      // Génération de la prévisualisation et conversion en base64
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.photoPreview = e.target.result; // Pour affichage dans le formulaire
        this.newUser.photo = e.target.result; // Conversion en base64 pour l'envoi
      };
      reader.readAsDataURL(file);
    }
  }
  

// Méthode d'inscription d'un utilisateur
registerNewUser(): void {
  this.isSubmitting = true;

  // Préparer les données utilisateur
  const user = {
    name: this.newUser.name.trim(),
    email: this.newUser.email.trim(),
    telephone: this.newUser.telephone.trim(),
    adresse: this.newUser.adresse.trim(),
    password: this.newUser.password,
    photo: this.newUser.photo,
  };

  // Valider les données avant d'envoyer la requête
  if (!this.validateUserInput(user)) {
    this.isSubmitting = false; // Réactiver le formulaire si validation échoue
    return;
  }

  // Appel au service pour inscrire l'utilisateur
  this.userApiService
    .registerUser(user)
    .then((data) => {
      console.log('Utilisateur inscrit avec succès:', data);

      // Ajouter l'utilisateur localement et mettre à jour la pagination
      this.users.push(data.user);
      this.updatePagination();

      // Fermer le modal, réinitialiser le formulaire et nettoyer les erreurs
      this.closeModal();
      this.resetNewUserForm();
      this.errorMessage = null;
    })
    .catch((error) => {
      console.error('Erreur lors de l’inscription:', error.message);
      this.errorMessage = error.message; // Afficher l'erreur utilisateur
    })
    .finally(() => {
      this.isSubmitting = false; // Réactiver le formulaire après la réponse
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

  return true; // Validation réussie
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
    // Appeler le service pour basculer le rôle de l'utilisateur
    this.userApiService
      .toggleUserRole(user._id) // Appel au backend
      .then((response) => {
        const updatedUser = response.user; // Récupère l'utilisateur mis à jour depuis le backend
        user.roles = updatedUser.roles; // Met à jour les rôles localement
        console.log(`Rôle mis à jour : ${updatedUser.roles}`);
      })
      .catch((error) => {
        console.error('Erreur lors du basculement du rôle :', error);
        alert('Une erreur est survenue lors de la mise à jour du rôle.');
      });
  }
  onDeleteUser(userId: string): void {
    if (confirm('Êtes-vous sûr de vouloir désactiver cet utilisateur ?')) {
      // Appel du service pour désactiver l'utilisateur
      this.userApiService
        .disableUser(userId)
        .then((response) => {
          const updatedUser = response.user; // Récupère l'utilisateur mis à jour
          // Mettre à jour l'utilisateur dans la liste locale
          const index = this.users.findIndex((user) => user._id === userId);
          if (index !== -1) {
            this.users[index].status = updatedUser.status; // Met à jour le statut
          }
          console.log('Utilisateur désactivé avec succès.');
        })
        .catch((error) => {
          console.error('Erreur lors de la désactivation de l\'utilisateur :', error);
          alert('Une erreur est survenue lors de la désactivation de l\'utilisateur.');
        });
    }
  }
  
  deleteUser(userId: string): void {
    this.users = this.users.filter((user) => user._id !== userId);
  }
// Ouvrir le modal d'édition d'un utilisateur
editUser(user: User): void {
  this.userToEdit = { ...user };  // Copie des données de l'utilisateur
  console.log('User to edit:', this.userToEdit); // Debug pour vérifier l'objet utilisateur
  this.cdr.detectChanges();  // Force la détection des changements si nécessaire
  this.openModalUpdate();  // Ouvrir le modal de mise à jour
}

// Soumettre la mise à jour d'un utilisateur
/* updateUser(): void {
  if (this.userToEdit) {
    this.isLoading = true;
    this.errorMessage = null;

    // Mise à jour de l'utilisateur
    this.userApiService
      .updateUser(this.userToEdit._id, this.userToEdit)
      .then((updatedUser) => {
        // Mise à jour de l'utilisateur dans la liste
        this.users = this.users.map(u =>
          u._id === updatedUser._id ? updatedUser : u
        );
        this.closeModalUpdate();  // Ferme le modal après la mise à jour
      })
      .catch((error) => {
        console.error('Erreur lors de la mise à jour de l\'utilisateur:', error.message);
        this.errorMessage = error.message || 'Une erreur est survenue lors de la mise à jour de l\'utilisateur.';
      })
      .finally(() => {
        this.isLoading = false;
      });
  }
} */
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
        this.errorMessage = 'Cet identifiant existe deja';
      } else {
        console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
        this.errorMessage = 'Une erreur est survenue lors de la mise à jour de l\'utilisateur.';
      }
      
    });
}


// Ouvrir le modal de mise à jour
openModalUpdate(): void {
  this.modalService.open(this.updateModal, { ariaLabelledBy: 'modal-basic-title' });
}

// Fermer le modal
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

   // Fonction appelée à chaque changement dans le champ de recherche


   onSearch(): void {
    if (this.searchTerm.trim().length > 0) {
      // Requête de recherche des utilisateurs
      this.userApiService
        .searchUsers(this.searchTerm)
        .then((users) => {
          this.users = users;  // Mettez à jour la liste des utilisateurs filtrés
          this.updatePagination(); // Mettez à jour la pagination
        })
        .catch((error) => {
          this.errorMessage = error.message;  // Gérer l'erreur
        });
    } else {
      // Si le champ de recherche est vide, récupérer tous les utilisateurs actifs
      this.fetchUsers();
    }
  }
  
  // Mise à jour de la pagination
  
  // Filtrage des utilisateurs basé sur le terme de recherche
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

