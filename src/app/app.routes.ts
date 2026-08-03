import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Members } from './pages/members/members';
import { Trainers } from './pages/trainers/trainers';
import { Attendance } from './pages/attendance/attendance';
import { Payments } from './pages/payments/payments';
import { Equipment } from './pages/equipment/equipment';
import { Reports } from './pages/reports/reports';
import { Settings } from './pages/settings/settings';
import { Users } from './pages/users/users';
import { Policy } from './pages/policy/policy';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  // Public routes (must be matched before auth routes)
  { path: 'policy', component: Policy },
  { path: 'policies', redirectTo: 'policy', pathMatch: 'full' },
  { path: 'privacy-policy', redirectTo: 'policy', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },

  // Guarded app routes
  { path: '', component: Home, canActivate: [authGuard] },
  { path: 'members', component: Members, canActivate: [authGuard, roleGuard], data: { roles: ['admin', 'receptionist'] } },
  { path: 'trainers', component: Trainers, canActivate: [authGuard, roleGuard], data: { roles: ['admin'] } },
  { path: 'attendance', component: Attendance, canActivate: [authGuard, roleGuard], data: { roles: ['admin', 'receptionist', 'member'] } },
  { path: 'payments', component: Payments, canActivate: [authGuard, roleGuard], data: { roles: ['admin', 'receptionist'] } },
  { path: 'equipment', component: Equipment, canActivate: [authGuard, roleGuard], data: { roles: ['admin'] } },
  { path: 'reports', component: Reports, canActivate: [authGuard, roleGuard], data: { roles: ['admin', 'receptionist'] } },
  { path: 'users', component: Users, canActivate: [authGuard, roleGuard], data: { roles: ['admin'] } },
  { path: 'settings', component: Settings, canActivate: [authGuard] },

  // Fallback
  { path: '**', redirectTo: 'login' }
];
