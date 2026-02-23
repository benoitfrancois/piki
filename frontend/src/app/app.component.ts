import { Component } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './shared/header/header';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent  {
  title = 'PersonalWiki';

  showHeader = false;
  private readonly noHeaderRoutes = ['/login', '/setup', '/reset-password'];

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: NavigationEnd) => {
      const url = e.urlAfterRedirects.split('?')[0]; // ← ignorer les query params
      this.showHeader = !this.noHeaderRoutes.some(r => url.startsWith(r));
    });
  }
}
