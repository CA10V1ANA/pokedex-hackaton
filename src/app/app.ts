import { Component, signal, OnInit, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  constructor(@Inject(DOCUMENT) private document: Document) {}
  
  isDarkMode = signal(false);

  ngOnInit() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      this.isDarkMode.set(true);
      this.document.body.classList.add('dark-theme');
    }
  }

  toggleTheme() {
    this.isDarkMode.update(v => !v);
    if (this.isDarkMode()) {
      this.document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      this.document.body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  }
  protected readonly title = signal('pokedex-hackaton');
  isSidebarOpen = signal(false);

  toggleSidebar() {
    this.isSidebarOpen.update(v => !v);
  }
}
