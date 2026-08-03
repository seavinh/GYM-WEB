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
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      const url = e.urlAfterRedirects || e.url;
      this.isAuthPage = url.includes('/login') || url.includes('/register') || url.includes('/policy');
      this.sidebarShow = false;
    });
  }

  ngOnInit(): void {
    // Theme and language are initialized via their constructors (providedIn: 'root')
    // Accessing them here ensures they're ready before any component renders
  }

  toggleSidebar(): void {
    this.sidebarShow = !this.sidebarShow;
  }
}
