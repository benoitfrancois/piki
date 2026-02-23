import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';
import { PageService } from '../../../services/page.service';
import { Page } from '../../../models/page.model';

@Component({
  selector: 'app-page-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MarkdownModule],
  templateUrl: './page-detail.html',
  styleUrls: ['./page-detail.scss']
})
export class PageDetailComponent implements OnInit {
  page?: Page;
  isLoading = true;
  pageId?: number;

  constructor(
    private pageService: PageService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.pageId = Number(id);
      this.loadPage();
    }
  }

  loadPage(): void {
    if (!this.pageId) return;

    this.isLoading = true;
    this.cdr.detectChanges();

    this.pageService.getPageById(this.pageId).subscribe({
      next: (page) => {
        this.page = page;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading page:', error);
        this.isLoading = false;
        this.cdr.detectChanges();
        alert('Page not found');
        this.router.navigate(['/pages']);
      }
    });
  }

  deletePage(): void {
    if (!this.page || !this.pageId) return;

    const confirmed = confirm(`Are you sure you want to delete "${this.page.title}"?`);
    if (!confirmed) return;

    this.pageService.deletePage(this.pageId).subscribe({
      next: () => {
        this.router.navigate(['/pages']);
      },
      error: (error) => {
        console.error('Error deleting page:', error);
        alert('Error deleting page');
      }
    });
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

  getHeaderColor(color: string | undefined): string {
    const map: Record<string, string> = {
      blue:   'bg-blue-500',
      green:  'bg-green-500',
      purple: 'bg-purple-500',
      red:    'bg-red-500',
      orange: 'bg-orange-500',
      yellow: 'bg-yellow-500',
      pink:   'bg-pink-500',
      gray:   'bg-gray-500',
    };
    return map[color ?? ''] || 'bg-blue-600';
  }

  printPage(): void {
    window.print();
  }
}
