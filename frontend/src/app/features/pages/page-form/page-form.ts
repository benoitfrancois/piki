import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { PageService } from '../../../services/page.service';
import { Page, PageRequest, Type } from '../../../models/page.model';

@Component({
  selector: 'app-page-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './page-form.html',
  styleUrls: ['./page-form.scss']
})
export class PageFormComponent implements OnInit {
  isEditMode = false;
  pageId?: number;
  isLoading = false;
  isSaving = false;

  // Image upload
  isUploading = false;
  uploadError = '';

  // Form data
  title: string = '';
  content: string = '';
  selectedType: Type | null = null;
  tags: string[] = [];
  tagInput: string = '';

  availableTypes: Type[] = [];

  constructor(
    private pageService: PageService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.pageService.getAllTypes().subscribe({
      next: types => this.availableTypes = types
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
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
        this.title = page.title;
        this.content = page.content;
        this.selectedType = page.type ?? null;
        this.tags = page.tags.map(tag => tag.name);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.router.navigate(['/pages']);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      this.uploadError = 'File size must be less than 5MB';
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.uploadError = 'Only image files are allowed';
      return;
    }

    this.uploadImage(file);
  }

  uploadImage(file: File): void {
    this.isUploading = true;
    this.uploadError = '';

    const formData = new FormData();
    formData.append('file', file);

    this.http.post<{url: string, filename: string}>('/api/upload/image', formData)
      .subscribe({
        next: (response) => {
          // Insert markdown image syntax at cursor position or end
          const imageMarkdown = `\n![${response.filename}](${response.url})\n`;
          this.content = this.content + imageMarkdown;
          this.isUploading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Upload error:', error);
          this.uploadError = error.error?.error || 'Failed to upload image';
          this.isUploading = false;
          this.cdr.detectChanges();
        }
      });
  }

  addTag(): void {
    const tag = this.tagInput.trim().toLowerCase();
    if (tag && !this.tags.includes(tag)) {
      this.tags.push(tag);
      this.tagInput = '';
    }
  }

  removeTag(tag: string): void {
    this.tags = this.tags.filter(t => t !== tag);
  }

  onTagInputKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addTag();
    }
  }

  onSubmit(): void {
    // Validation
    if (!this.title.trim()) {
      alert('Please enter a title');
      return;
    }

    this.isSaving = true;

    const pageRequest: PageRequest = {
      title: this.title.trim(),
      content: this.content.trim(),
      type: this.selectedType,
      tags: this.tags
    };

    if (this.isEditMode && this.pageId) {
      // Update existing page
      this.pageService.updatePage(this.pageId, pageRequest).subscribe({
        next: (page) => {
          this.isSaving = false;
          this.router.navigate(['/pages', page.id]);
        },
        error: (error) => {
          console.error('Error updating page:', error);
          this.isSaving = false;
          alert('Error updating page');
        }
      });
    } else {
      // Create new page
      this.pageService.createPage(pageRequest).subscribe({
        next: (page) => {
          this.isSaving = false;
          this.router.navigate(['/pages', page.id]);
        },
        error: (error) => {
          console.error('Error creating page:', error);
          this.isSaving = false;
          alert('Error creating page');
        }
      });
    }
  }

  cancel(): void {
    if (this.isEditMode && this.pageId) {
      this.router.navigate(['/pages', this.pageId]);
    } else {
      this.router.navigate(['/pages']);
    }
  }

  compareTypes(a: Type | null, b: Type | null): boolean {
    return a?.id === b?.id;
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
}
