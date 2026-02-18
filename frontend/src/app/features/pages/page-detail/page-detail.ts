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
