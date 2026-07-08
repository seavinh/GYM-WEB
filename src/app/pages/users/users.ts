import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { UserWithMember } from '../../models';
import { ConfirmDialog } from '../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-users',
  imports: [CommonModule, FormsModule, ConfirmDialog],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users implements OnInit {
  users: UserWithMember[] = [];
  loading = true;
  error = '';
  searchTerm = '';
  currentPage = 1;
  totalPages = 1;
  totalUsers = 0;
  filterRole = '';

  showModal = false;
  selectedUser: UserWithMember | null = null;
  newRole: 'admin' | 'receptionist' | 'member' = 'member';
  modalLoading = false;
  modalError = '';

  roleOptions: { value: string; label: string; badge: string }[] = [
    { value: 'admin', label: 'Admin', badge: 'badge-red' },
    { value: 'receptionist', label: 'Receptionist', badge: 'badge-blue' },
    { value: 'member', label: 'Member', badge: 'badge-green' },
  ];

  roleCounts: Record<string, number> = { admin: 0, receptionist: 0, member: 0 };

  showConfirm = false;
  deleteTargetId: number | null = null;

  constructor(private userService: UserService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getUsers(this.searchTerm, this.currentPage, this.filterRole).subscribe({
      next: (response) => {
        this.users = response.data;
        this.currentPage = response.current_page;
        this.totalPages = response.last_page;
        this.totalUsers = response.total;
        this.loading = false;
        this.updateRoleCounts();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err.message || 'Failed to load users';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  updateRoleCounts(): void {
    this.roleCounts = { admin: 0, receptionist: 0, member: 0 };
    for (const user of this.users) {
      if (this.roleCounts[user.role] !== undefined) {
        this.roleCounts[user.role]++;
      }
    }
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  onFilterRole(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  openRoleModal(user: UserWithMember): void {
    this.selectedUser = user;
    this.newRole = user.role as 'admin' | 'receptionist' | 'member';
    this.modalError = '';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedUser = null;
    this.modalError = '';
  }

  saveRole(): void {
    if (!this.selectedUser) return;

    this.modalLoading = true;
    this.modalError = '';

    this.userService.updateUserRole(this.selectedUser.user_id, this.newRole).subscribe({
      next: () => {
        this.modalLoading = false;
        this.closeModal();
        this.loadUsers();
      },
      error: (err) => {
        this.modalError = err.message || 'Failed to update role';
        this.modalLoading = false;
      }
    });
  }

  deleteUser(id: number): void {
    this.deleteTargetId = id;
    this.showConfirm = true;
  }

  onConfirmDelete(): void {
    if (this.deleteTargetId === null) return;
    const id = this.deleteTargetId;
    this.showConfirm = false;
    this.deleteTargetId = null;
    this.userService.deleteUser(id).subscribe({
      next: () => this.loadUsers(),
      error: (err) => { this.error = err.message || 'Failed to delete user'; }
    });
  }

  onCancelDelete(): void {
    this.showConfirm = false;
    this.deleteTargetId = null;
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadUsers();
  }

  getPages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  getRoleBadge(role: string): string {
    switch (role) {
      case 'admin': return 'badge-red';
      case 'receptionist': return 'badge-blue';
      case 'member': return 'badge-green';
      default: return 'badge-gray';
    }
  }

  getMemberName(user: UserWithMember): string {
    return user.member?.full_name || '-';
  }
}
