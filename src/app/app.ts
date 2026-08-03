import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Sidebar } from './components/sidebar/sidebar';
import { filter } from 'rxjs/operators';
import { ThemeService } from './services/theme.service';
import { LanguageService } from './services/language.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, Sidebar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  sidebarShow = false;
  isAuthPage = false;

  constructor(
    private router: Router,
    private themeService: ThemeService,
    private langService: LanguageService
  ) {
    this.checkAuthPage(window.location.pathname);
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      const url = e.urlAfterRedirects || e.url;
      this.checkAuthPage(url);
    });
  }

  private checkAuthPage(url: string): void {
    const path = window.location.pathname || url;
    this.isAuthPage = path.includes('/login') || path.includes('/register') || path.includes('/policy');
    this.sidebarShow = false;
  }

  ngOnInit(): void {
    // Theme and language are initialized via their constructors (providedIn: 'root')
  }

  toggleSidebar(): void {
    this.sidebarShow = !this.sidebarShow;
  }
}
