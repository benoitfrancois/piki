import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PageService } from '../../services/page.service';
import { Page, Tag, TypePage } from '../../models/page.model';
import { forkJoin } from 'rxjs';

interface PageStats {
  total: number;
  byType: { [key: string]: number };
  totalTags: number;
  recentPages: Page[];
  topTags: { tag: string; count: number }[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {
  stats: PageStats = {
    total: 0,
    byType: {},
    totalTags: 0,
    recentPages: [],
    topTags: []
  };

  isLoading = true;
  Object = Object;

  constructor(
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
        this.calculateStats(result.pages);
        this.stats.totalTags = result.tags.length;
        this.isLoading = false;
        this.cdr.detectChanges();  // ← Add this
      },
      error: (error) => {
        console.error('Error loading data:', error);
        this.isLoading = false;
        this.cdr.detectChanges();  // ← Add this
      }
    });
  }

  calculateStats(pages: Page[]): void {
    this.stats.total = pages.length;

    // Count by type
    this.stats.byType = {};
    pages.forEach(page => {
      const type = page.type;
      this.stats.byType[type] = (this.stats.byType[type] || 0) + 1;
    });

    // Recent pages (last 5)
    this.stats.recentPages = pages
      .sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt || 0);
        const dateB = new Date(b.updatedAt || b.createdAt || 0);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 5);

    // Top tags
    const tagCounts: { [key: string]: number } = {};
    pages.forEach(page => {
      page.tags.forEach(tag => {
        tagCounts[tag.name] = (tagCounts[tag.name] || 0) + 1;
      });
    });

    this.stats.topTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  getTypeColor(type: string): string {
    const colors: { [key: string]: string } = {
      'DEFINITION': 'bg-blue-100 text-blue-800',
      'SCHEMA': 'bg-green-100 text-green-800',
      'WORKFLOW': 'bg-purple-100 text-purple-800',
      'MAINTENANCE': 'bg-red-100 text-red-800',
      'AUTRE': 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  }

  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'DEFINITION': 'Definition',
      'SCHEMA': 'Schema',
      'WORKFLOW': 'Workflow',
      'MAINTENANCE': 'Maintenance',
      'AUTRE': 'Other'
    };
    return labels[type] || type;
  }
}
