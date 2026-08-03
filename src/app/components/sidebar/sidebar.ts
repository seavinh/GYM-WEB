import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements OnInit, OnDestroy {
  @Input() show = false;

  username = 'User';
  role = '';
  initials = 'U';

  private roleSub?: Subscription;

  allNavItems = [
    { labelKey: 'nav.dashboard', icon: 'bi-speedometer2', route: '/', roles: ['admin', 'receptionist', 'member'] },
    { labelKey: 'nav.members', icon: 'bi-people-fill', route: '/members', roles: ['admin', 'receptionist'] },
    { labelKey: 'nav.trainers', icon: 'bi-person-badge-fill', route: '/trainers', roles: ['admin'] },
    { labelKey: 'nav.attendance', icon: 'bi-calendar-check-fill', route: '/attendance', roles: ['admin', 'receptionist', 'member'] },
    { labelKey: 'nav.payments', icon: 'bi-credit-card-fill', route: '/payments', roles: ['admin', 'receptionist'] },
    { labelKey: 'nav.equipment', icon: 'bi-tools', route: '/equipment', roles: ['admin'] },
    { labelKey: 'nav.reports', icon: 'bi-bar-chart-fill', route: '/reports', roles: ['admin', 'receptionist'] },
    { labelKey: 'nav.users', icon: 'bi-shield-lock', route: '/users', roles: ['admin'] },
    { labelKey: 'nav.policy', icon: 'bi-journal-text', route: '/policy', roles: ['admin', 'receptionist', 'member'] },
    { labelKey: 'nav.settings', icon: 'bi-gear-fill', route: '/settings', roles: ['admin', 'receptionist', 'member'] },
  ];

  navItems: typeof this.allNavItems = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    public langService: LanguageService
  ) {}

  ngOnInit(): void {
    this.loadProfile();

    this.roleSub = this.authService.role$.subscribe(role => {
      if (role) {
        this.role = role;
        this.filterNav();
      }
    });
  }

  ngOnDestroy(): void {
    this.roleSub?.unsubscribe();
  }

  loadProfile(): void {
    this.authService.getProfile().subscribe({
      next: (res: any) => {
        const user = res.user || res;
        this.username = user.username || 'User';
        this.role = user.role || '';
        this.authService.setRole(this.role);
        this.initials = this.username.substring(0, 2).toUpperCase();
        this.filterNav();
      },
      error: () => {
        const token = this.authService.getToken();
        if (!token) {
          this.router.navigate(['/login']);
        } else {
          this.role = this.authService.getStoredRole();
          this.filterNav();
        }
      }
    });
  }

  filterNav(): void {
    if (!this.role) {
      this.navItems = [];
      return;
    }
    this.navItems = this.allNavItems.filter(item => item.roles.includes(this.role));
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
}
