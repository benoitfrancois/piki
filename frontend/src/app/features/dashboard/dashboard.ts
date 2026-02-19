import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PageService } from '../../services/page.service';
import { Page, Tag, Type } from '../../models/page.model';
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
      const typeName = page.type?.name ?? 'No type';
      this.stats.byType[typeName] = (this.stats.byType[typeName] || 0) + 1;
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

  getTypeBadgeClass(color: string): string {
    const map: Record<string, string> = {
      blue:   'bg-blue-100 text-blue-800',
      green:  'bg-green-100 text-green-800',
      purple: 'bg-purple-100 text-purple-800',
      red:    'bg-red-100 text-red-800',
      orange: 'bg-orange-100 text-orange-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      pink:   'bg-pink-100 text-pink-800',
      gray:   'bg-gray-100 text-gray-700',
    };
    return map[color] || map['gray'];
  }
}
