import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MemberService } from '../../services/member.service';
import { Member, MemberCreatePayload } from '../../models';
import { ConfirmDialog } from '../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-members',
  imports: [CommonModule, FormsModule, ConfirmDialog],
  templateUrl: './members.html',
  styleUrl: './members.css',
})
export class Members implements OnInit {
  members: Member[] = [];
  loading = true;
  error = '';
  searchTerm = '';
  currentPage = 1;
  totalPages = 1;
  totalMembers = 0;

  showModal = false;
  modalMode: 'add' | 'edit' = 'add';
  modalLoading = false;
  modalError = '';
  form: Partial<Member> = {};

  createUserAccount = false;
  username = '';
  password = '';
  role: 'admin' | 'receptionist' | 'member' = 'member';

  formErrors: Record<string, string> = {};

  showConfirm = false;
  deleteTargetId: number | null = null;

  constructor(private memberService: MemberService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadMembers();
  }

  loadMembers(): void {
    this.loading = true;
    this.memberService.getMembers(this.searchTerm, this.currentPage).subscribe({
      next: (response) => {
        this.members = response.data;
        this.currentPage = response.current_page;
        this.totalPages = response.last_page;
        this.totalMembers = response.total;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err.message || 'Failed to load members';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadMembers();
  }

  openAddModal(): void {
    this.modalMode = 'add';
    const today = new Date().toISOString().split('T')[0];
    this.form = { gender: 'male', join_date: today };
    this.createUserAccount = false;
    this.username = '';
    this.password = '';
    this.role = 'member';
    this.modalError = '';
    this.formErrors = {};
    this.showModal = true;
  }

  openEditModal(member: Member): void {
    this.modalMode = 'edit';
    this.form = { ...member };
    this.createUserAccount = false;
    this.username = '';
    this.password = '';
    this.role = (member.user?.role as 'admin' | 'receptionist' | 'member') || 'member';
    this.modalError = '';
    this.formErrors = {};
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.form = {};
    this.modalError = '';
    this.formErrors = {};
  }

  validate(): boolean {
    this.formErrors = {};

    if (!this.form.full_name || this.form.full_name.trim() === '') {
      this.formErrors['full_name'] = 'Full name is required';
    }

    if (!this.form.email || this.form.email.trim() === '') {
      this.formErrors['email'] = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email)) {
      this.formErrors['email'] = 'Invalid email format';
    }

    if (!this.form.phone || this.form.phone.trim() === '') {
      this.formErrors['phone'] = 'Phone is required';
    }

    if (!this.form.dob) {
      this.formErrors['dob'] = 'Date of birth is required';
    }

    if (!this.form.join_date) {
      this.formErrors['join_date'] = 'Join date is required';
    }

    if (this.createUserAccount) {
      if (!this.username || this.username.trim() === '') {
        this.formErrors['username'] = 'Username is required';
      }
      if (!this.password || this.password.length < 6) {
        this.formErrors['password'] = 'Password must be at least 6 characters';
      }
    }

    return Object.keys(this.formErrors).length === 0;
  }

  saveModal(): void {
    if (!this.validate()) {
      this.modalError = 'Please fix the errors below.';
      return;
    }

    this.modalLoading = true;
    this.modalError = '';

    if (this.modalMode === 'add') {
      const payload: MemberCreatePayload = {
        full_name: this.form.full_name!,
        gender: this.form.gender!,
        dob: this.form.dob!,
        phone: this.form.phone!,
        email: this.form.email!,
        address: this.form.address || null,
        join_date: this.form.join_date!,
      };

      if (this.createUserAccount) {
        payload.create_user_account = true;
        payload.username = this.username;
        payload.password = this.password;
        payload.role = this.role;
      }

      this.memberService.createMember(payload).subscribe({
        next: () => {
          this.modalLoading = false;
          this.closeModal();
          this.loadMembers();
        },
        error: (err) => {
          this.modalError = err.message || 'Failed to create member';
          this.modalLoading = false;
        }
      });
    } else {
      const updateData: Partial<Member> = {
        full_name: this.form.full_name,
        gender: this.form.gender,
        dob: this.form.dob,
        phone: this.form.phone,
        email: this.form.email,
        address: this.form.address,
        join_date: this.form.join_date,
      };

      this.memberService.updateMember(this.form.member_id!, updateData).subscribe({
        next: () => {
          this.modalLoading = false;
          this.closeModal();
          this.loadMembers();
        },
        error: (err) => {
          this.modalError = err.message || 'Failed to update member';
          this.modalLoading = false;
        }
      });
    }
  }

  deleteMember(id: number): void {
    this.deleteTargetId = id;
    this.showConfirm = true;
  }

  onConfirmDelete(): void {
    if (this.deleteTargetId === null) return;
    const id = this.deleteTargetId;
    this.showConfirm = false;
    this.deleteTargetId = null;
    this.memberService.deleteMember(id).subscribe({
      next: () => this.loadMembers(),
      error: (err) => { this.error = err.message || 'Failed to delete member'; }
    });
  }

  onCancelDelete(): void {
    this.showConfirm = false;
    this.deleteTargetId = null;
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadMembers();
  }

  getPages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  getGenderBadge(gender: string): string {
    return gender === 'female' ? 'badge-purple' : gender === 'male' ? 'badge-blue' : 'badge-gray';
  }
}
