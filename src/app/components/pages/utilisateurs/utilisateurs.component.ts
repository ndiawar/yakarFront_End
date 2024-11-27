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
    this.loadUsers();
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
        this.loadUsers();
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

  // registerNewUser(): void {
  //   this.isSubmitting = true;

  //   const user = {
  //     name: this.newUser.name.trim(),
  //     email: this.newUser.email.trim(),
  //     telephone: this.newUser.telephone.trim(),
  //     adresse: this.newUser.adresse.trim(),
  //     password: this.newUser.password,
  //     photo: this.newUser.photo,
  //   };

  //   if (!this.validateUserInput(user)) {
  //     this.isSubmitting = false;
  //     return;
  //   }

  //   this.userApiService
  //     .registerUser(user)
  //     .then((data) => {
  //       console.log('Utilisateur inscrit avec succès:', data);
  //       this.fetchUsers();
  //       this.users.push(data.user);
  //       this.updatePagination();
  //       this.closeModal();
  //       this.resetNewUserForm();
  //       this.errorMessage = null;
  //     })
  //     .catch((error) => {
  //       console.error('Erreur lors de l’inscription:', error.message);
  //       this.errorMessage = error.message;
  //     })
  //     .finally(() => {
  //       this.isSubmitting = false;
  //     });
  // }
  registerNewUser(): void {
    this.isSubmitting = true;
  
    // Validation des champs obligatoires
    if (!this.newUser.name.trim() || !this.newUser.email.trim() || !this.newUser.telephone.trim() || !this.newUser.adresse.trim()) {
      this.isSubmitting = false;
      console.error('Veuillez remplir tous les champs obligatoires.');
      return;
    }
  
    // Préparation de l'objet utilisateur, en assurant que les champs sont toujours des chaînes non vides
    const userToRegister: { 
      name: string; 
      email: string; 
      password: string; 
      telephone: string; 
      adresse: string; 
      photo?: string; 
      status: boolean; 
      roles: string[];
    } = {
      name: this.newUser.name?.trim() || '',  // Garantir que 'name' est une chaîne
      email: this.newUser.email?.trim() || '',  // Garantir que 'email' est une chaîne
      password: this.newUser.password,  // Le mot de passe est obligatoire
      telephone: this.newUser.telephone?.trim() || '',  // Garantir que 'telephone' est une chaîne
      adresse: this.newUser.adresse?.trim() || '',  // Garantir que 'adresse' est une chaîne
      photo: this.newUser.photo || '',  // Si 'photo' est undefined, utiliser une chaîne vide
      status: true,  // Utilisateur actif par défaut
      roles: ['user'],  // Le rôle par défaut
    };
  
    // Appeler le service pour enregistrer l'utilisateur
    this.userApiService
      .registerUser(userToRegister)  // On envoie l'objet complet
      .then((data) => {
        console.log('Utilisateur inscrit avec succès:', data);
  
        // Ajouter localement
        this.users.push(data.user);
        this.updatePagination();
  
        // Réinitialiser le formulaire
        this.closeModal();
        this.loadUsers();
        this.resetNewUserForm();
        this.errorMessage = null;
      })
      .catch((error) => {
        console.error('Erreur lors de l’inscription:', error.message);
        this.errorMessage = error.message;
      })
      .finally(() => {
        this.isSubmitting = false;
        this.loadUsers();
      });
  }
  
  
getErrorMessage(control: any, fieldName: string): string {
  if (control.errors?.required) {
    return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} est obligatoire.`;
  }
  if (control.errors?.minlength) {
    return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} doit contenir au moins ${control.errors.minlength.requiredLength} caractères.`;
  }
  if (control.errors?.email) {
    return `Veuillez saisir une adresse e-mail valide.`;
  }
  return '';
}


  validateUserInput(user: {
    name: string;
    email: string;
    password?: string; // Rend le champ optionnel
    telephone: string;
    adresse: string;
}): boolean {
    this.errorMessage = '';

    // Vérification des champs obligatoires sauf `password`
    if (!user.name || !user.email || !user.telephone || !user.adresse) {
        this.errorMessage = 'Les champs nom, email, téléphone et adresse sont obligatoires.';
        return false;
    }

    // Vérification de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email)) {
        this.errorMessage = 'L\'adresse email saisie est invalide.';
        return false;
    }

    // Vérification du téléphone
    const phoneRegex = /^(70|75|76|77|78)[0-9]{7}$/;
    if (!phoneRegex.test(user.telephone)) {
        this.errorMessage = 'Le numéro de téléphone doit commencer par 70, 75, 76, 77 ou 78 et contenir 9 chiffres.';
        return false;
    }

    // Si `password` est fourni, vérifier sa robustesse
    if (user.password) {
        if (user.password.length < 8) {
            this.errorMessage = 'Le mot de passe doit contenir au moins 8 caractères.';
            return false;
        }
        if (!/[A-Z]/.test(user.password)) {
            this.errorMessage = 'Le mot de passe doit inclure au moins une lettre majuscule.';
            return false;
        }
        if (!/\d/.test(user.password)) {
            this.errorMessage = 'Le mot de passe doit inclure au moins un chiffre.';
            return false;
        }
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(user.password)) {
            this.errorMessage = 'Le mot de passe doit inclure au moins un caractère spécial.';
            return false;
        }
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
    this.loadUsers();
  }

  onToggleUserRole(user: any): void {
    this.userApiService
      .toggleUserRole(user._id)
      .then((response) => {
        const updatedUser = response.user;
        user.roles = updatedUser.roles;
        console.log(`Rôle mis à jour : ${updatedUser.roles}`);
        this.loadUsers();
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
    this.fetchUsers();
  }
  editUser(user: User): void {
    if (!user) {
      console.error('Aucun utilisateur sélectionné pour la modification.');
      return;
    }
  
    // Faire une copie indépendante des données de l'utilisateur
    this.userToEdit = { ...user };
    console.log('User to edit:', this.userToEdit); // Vérification en mode debug
  
    // Mise à jour du détecteur de changements (nécessaire dans certains cas)
    this.cdr.detectChanges();
  
    // Ouvrir le modal d'édition
    this.openModalUpdate();
  }
  onDeleteUser(userId: string): void {
    this.userApiService
      .disableUser(userId)
      .then((response) => {
        const updatedUser = response.user;
        const user = this.users.find((u) => u._id === userId);
        if (user) {
          user.status = updatedUser.status;
        }
        console.log('Utilisateur désactivé avec succès.');
        this.updatePagination(); // Mettre à jour la pagination après modification locale
      })
      .catch((error) => {
        console.error('Erreur lors de la désactivation de l\'utilisateur :', error);
        alert('Une erreur est survenue lors de la désactivation de l\'utilisateur.');
      });
  }
  

  // updateUser(): void {
  //   this.userApiService
  //     .updateUser(this.userToEdit._id, this.userToEdit)
  //     .then(() => {
  //       this.users = this.users.map((user) =>
  //         user._id === this.userToEdit._id ? { ...this.userToEdit } : user
  //       );
  //       this.closeModal();
  //     })
  //     .catch((error) => {
  //       if (error.status === 400) {
  //         this.errorMessage = 'Cet identifiant existe déjà';
  //       } else {
  //         console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
  //         this.errorMessage = 'Une erreur est survenue lors de la mise à jour de l\'utilisateur.';
  //       }
  //     });
  // }
  updateUser(): void {
    if (!this.userToEdit) {
      console.error('Aucun utilisateur à mettre à jour.');
      return;
    }
  
    this.errorMessage = null;
  
    // Validation des données de l'utilisateur
    const userToValidate = {
      name: this.userToEdit.name.trim(),
      email: this.userToEdit.email.trim(),
      telephone: this.userToEdit.telephone.trim(),
      adresse: this.userToEdit.adresse.trim(),
    };
  
    if (!this.validateUserInput(userToValidate)) {
      console.error('Erreur de validation:', this.errorMessage);
      return;
    }
  
    // Préparation de l'objet utilisateur à mettre à jour
    const userToUpdate: Partial<User> = {
      name: this.userToEdit.name.trim(),
      email: this.userToEdit.email.trim(),
      telephone: this.userToEdit.telephone.trim(),
      adresse: this.userToEdit.adresse.trim(),
      status: this.userToEdit.status,
      roles: this.userToEdit.roles,
    };
  
    this.isLoading = true;
  
    // Appeler l'API pour mettre à jour l'utilisateur
    this.userApiService
      .updateUser(this.userToEdit._id, userToUpdate)
      .then((updatedUser) => {
        console.log('Utilisateur mis à jour avec succès:', updatedUser);
  
        // Mettre à jour la liste locale des utilisateurs
        this.users = this.users.map((user) =>
          user._id === updatedUser._id ? updatedUser : user
        );
  
        // Fermer le modal et réinitialiser l'état
        this.closeModalUpdate();
        this.loadUsers();
      })
      .catch((error) => {
        console.error('Erreur lors de la mise à jour:', error.message);
        this.errorMessage = error.message || 'Une erreur est survenue.';
      })
      .finally(() => {
        this.isLoading = false;
        this.loadUsers();
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