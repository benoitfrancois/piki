import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SearchBarComponent } from '../../shared/search-bar/search-bar';
import { PageService } from '../../services/page.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchBarComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomeComponent implements OnInit {
  searchQuery: string = '';

  // Stats
  totalPages: number = 0;
  totalTags: number = 0;
  recentUpdates: number = 0;

  isLoading: boolean = true;

  constructor(
    private router: Router,
    private pageService: PageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    forkJoin({
      pages: this.pageService.getAllPages(),
      tags: this.pageService.getAllTags()
    }).subscribe({
      next: (result) => {
        this.totalPages = result.pages.length;
        this.totalTags = result.tags.length;

        // Calculate recent updates (pages updated in last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        this.recentUpdates = result.pages.filter(page => {
          const updatedDate = new Date(page.updatedAt || page.createdAt || 0);
          return updatedDate >= sevenDaysAgo;
        }).length;

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading stats:', error);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSearch(query: string): void {
    if (query.trim()) {
      // Navigate to pages list with search parameter
      this.router.navigate(['/pages'], { queryParams: { search: query } });
    }
  }
}
