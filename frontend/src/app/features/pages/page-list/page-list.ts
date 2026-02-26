import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';
import Fuse from 'fuse.js';
import { PageService } from '../../../services/page.service';
import { Page, Type, Tag } from '../../../models/page.model';

@Component({
  selector: 'app-page-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, MarkdownModule],
  templateUrl: './page-list.html',
  styleUrls: ['./page-list.scss']
})
export class PageListComponent implements OnInit {
  allPages: Page[] = [];
  filteredPages: Page[] = [];
  allTags: Tag[] = [];
  availableTypes: Type[] = [];

  searchQuery: string = '';
  selectedType: Type | null = null;
  selectedTags: string[] = [];

  tagFilter: string = '';

  isLoading = true;

  private fuse!: Fuse<Page>;

  constructor(
    private pageService: PageService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Check if there's a search query from URL
    this.route.queryParams.subscribe(params => {
      if (params['search']) {
        this.searchQuery = params['search'];
      }
    });

    this.loadTypes();
    this.loadPages();
    this.loadTags();
  }

  loadTypes(): void {
    this.pageService.getAllTypes().subscribe({
      next: types => { this.availableTypes = types; this.cdr.detectChanges(); },
      error: err => console.error('Error loading types:', err)
    });
  }

  loadPages(): void {
    this.isLoading = true;
    this.pageService.getAllPages().subscribe({
      next: (pages) => {
        this.allPages = pages;

        this.fuse = new Fuse(pages, {
          keys: [
            { name: 'title',   weight: 3 },   // title counts 3x more
            { name: 'tags.name', weight: 2 }, // tags count 2x
            { name: 'content', weight: 1 }    // content counts 1x
          ],
          threshold: 0.25,       // 0 = exact, 1 = all accepted. 0.25 = reasonable tolerance
          includeScore: true,    // we want the score to sort
          ignoreLocation: true,  // search throughout the text, not just at the beginning
          useExtendedSearch: false
        });

        this.applyFilters();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading pages:', error);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadTags(): void {
    this.pageService.getAllTags().subscribe({
      next: (tags) => {
        this.allTags = tags;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading tags:', error);
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.allPages];

    // multi-word search with Fuse.js
    if (this.searchQuery.trim()) {
      const words = this.searchQuery.trim().toLowerCase().split(/\s+/);

      if (words.length === 1) {
        // One word: let Fuse handle it (fuzzy + scoring)
        const results = this.fuse.search(words[0]);
        filtered = results.map(r => r.item);
      } else {
        // Multiple words: AND logic — each word must match
        // We filter pages that contain ALL words
        const matchingSets = words.map(word => {
          const results = this.fuse.search(word);
          return new Set(results.map(r => r.item.id));
        });

        // Intersection of sets (logical AND)
        const intersection = matchingSets.reduce((a, b) =>
          new Set([...a].filter(id => b.has(id)))
        );

        // We keep the pages that are in the intersection, in the order of the first word.
        const firstWordResults = this.fuse.search(words[0]);
        filtered = firstWordResults
          .filter(r => intersection.has(r.item.id))
          .map(r => r.item);
      }
    } else {
      filtered = [...this.allPages];
    }

    // Filter by type
    if (this.selectedType !== null) {
      filtered = filtered.filter(page => page.type?.id === this.selectedType!.id);
    }

    // Filter by tags
    if (this.selectedTags.length > 0) {
      filtered = filtered.filter(page =>
        this.selectedTags.every(selectedTag =>       // every = logic AND
          page.tags.some(tag => tag.name === selectedTag)
        )
      );
    }

    this.filteredPages = filtered;
  }

  get visibleTags(): Tag[] {
    if (!this.tagFilter.trim()) return this.allTags;
    const q = this.tagFilter.toLowerCase();
    return this.allTags.filter(tag => tag.name.toLowerCase().includes(q));
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onTypeChange(): void {
    this.applyFilters();
  }

  toggleTag(tagName: string): void {
    const index = this.selectedTags.indexOf(tagName);
    if (index > -1) {
      this.selectedTags.splice(index, 1);
    } else {
      this.selectedTags.push(tagName);
    }
    this.applyFilters();
  }

  isTagSelected(tagName: string): boolean {
    return this.selectedTags.includes(tagName);
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedType = null;
    this.selectedTags = [];
    this.tagFilter = '';
    this.applyFilters();
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
    return map[color ?? ''] || 'bg-blue-600'; // ← blue Piki par défaut
  }

  compareTypes(a: Type | null, b: Type | null): boolean {
    return a?.id === b?.id;
  }
}
