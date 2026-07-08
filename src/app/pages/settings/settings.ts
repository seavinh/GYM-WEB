import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { LanguageService, Lang } from '../../services/language.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { ConfirmDialog } from '../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-settings',
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe, ConfirmDialog],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings implements OnInit {
  profile: any = null;
  profileLoading = false;
  profileError = '';
  profileSuccess = '';
  userRole = '';

  passwordForm = { current_password: '', new_password: '', confirm_password: '' };
  passwordLoading = false;
  passwordError = '';
  passwordSuccess = '';

  notificationsEnabled = true;

  showPasswordConfirm = false;

  constructor(
    public authService: AuthService,
    public themeService: ThemeService,
    public langService: LanguageService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.userRole = this.authService.getStoredRole();
    this.loadProfile();
  }

  loadProfile(): void {
    this.profileLoading = true;
    this.authService.getProfile().subscribe({
      next: (res: any) => {
        this.profile = res.user || res;
        this.userRole = this.profile.role || '';
        this.authService.setRole(this.userRole);
        this.profileLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.profileLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  changePassword(): void {
    if (!this.passwordForm.current_password || !this.passwordForm.new_password) {
      this.passwordError = 'All fields are required.';
      return;
    }
    if (this.passwordForm.new_password !== this.passwordForm.confirm_password) {
      this.passwordError = 'New passwords do not match.';
      return;
    }
    if (this.passwordForm.new_password.length < 6) {
      this.passwordError = 'Password must be at least 6 characters.';
      return;
    }
    this.showPasswordConfirm = true;
  }

  onConfirmPassword(): void {
    this.showPasswordConfirm = false;
    this.passwordLoading = true;
    this.passwordError = '';
    this.passwordSuccess = '';

    this.authService.updatePassword({
      current_password: this.passwordForm.current_password,
      new_password: this.passwordForm.new_password
    }).subscribe({
      next: () => {
        this.passwordSuccess = 'Password changed successfully!';
        this.passwordForm = { current_password: '', new_password: '', confirm_password: '' };
        this.passwordLoading = false;
      },
      error: (err) => {
        this.passwordError = err.message || 'Failed to change password.';
        this.passwordLoading = false;
      }
    });
  }

  onCancelPassword(): void {
    this.showPasswordConfirm = false;
  }

  toggleDarkMode(): void {
    this.themeService.toggle();
  }

  onLanguageChange(lang: Lang): void {
    this.langService.setLanguage(lang);
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.authService.clearSession();
        this.router.navigate(['/login']);
      },
      error: () => {
        this.authService.clearSession();
        this.router.navigate(['/login']);
      }
    });
  }

  getInitials(): string {
    return (this.profile?.username || 'U').substring(0, 2).toUpperCase();
  }

  isAdmin(): boolean {
    return this.userRole === 'admin';
  }

  isReceptionist(): boolean {
    return this.userRole === 'receptionist';
  }

  isMember(): boolean {
    return this.userRole === 'member';
  }

  getRoleBadge(): string {
    switch (this.userRole) {
      case 'admin': return 'badge-red';
      case 'receptionist': return 'badge-blue';
      case 'member': return 'badge-green';
      default: return 'badge-gray';
    }
  }
}
