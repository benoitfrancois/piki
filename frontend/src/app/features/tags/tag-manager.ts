import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TagService } from '../../services/tag.service';
import { Tag } from '../../models/page.model';

@Component({
  selector: 'app-tag-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tag-manager.html',
  styleUrls: ['./tag-manager.scss']
})
export class TagManagerComponent implements OnInit {
  tags: Tag[] = [];
  filteredTags: Tag[] = [];
  filterQuery = '';
  newName = '';
  errorMsg = '';
  isLoading = true;
  editingId: number | null = null;
  editingName = '';

  constructor(private tagService: TagService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.isLoading = true;
    this.tagService.getAll().subscribe({
      next: tags => {
        this.tags = tags.sort((a, b) => a.name.localeCompare(b.name));
        this.applyFilter();
        this.isLoading = false;
        this.cdr.detectChanges();
        },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  applyFilter(): void {
    const q = this.filterQuery.toLowerCase().trim();
    this.filteredTags = q
      ? this.tags.filter(t => t.name.includes(q))
      : [...this.tags];
  }

  onFilterChange(): void {
    this.applyFilter();
  }

  clearFilter(): void {
    this.filterQuery = ''; this.applyFilter();
  }

  create(): void {
    const name = this.newName.trim().toLowerCase();
    if (!name) return;
    this.errorMsg = '';
    this.tagService.create(name).subscribe({
      next: tag => {
        this.tags = [...this.tags, tag].sort((a, b) => a.name.localeCompare(b.name));
        this.newName = '';
        this.cdr.detectChanges();
        },
      error: err => {
        this.errorMsg = err.error?.error || 'Creation error';
        this.cdr.detectChanges();
      }
    });
  }

  startEdit(tag: Tag): void {
    this.editingId = tag.id!;
    this.editingName = tag.name;
  }
  cancelEdit(): void {
    this.editingId = null;
  }

  saveEdit(tag: Tag): void {
    const name = this.editingName.trim().toLowerCase();
    if (!name) return;
    this.tagService.rename(tag.id!, name).subscribe({
      next: updated => {
        const i = this.tags.findIndex(t => t.id === tag.id);
        if (i !== -1) this.tags[i] = updated;
        this.tags = [...this.tags].sort((a, b) => a.name.localeCompare(b.name));
        this.applyFilter();
        this.cancelEdit();
        this.cdr.detectChanges();
      },
      error: err => {
        alert(err.error?.error || 'Renaming error');
      }
    });
  }

  delete(tag: Tag): void {
    if (!confirm(`Delete "#${tag.name}" of all pages ?`)) return;
    this.tagService.delete(tag.id!).subscribe({
      next: () => {
        this.tags = this.tags.filter(t => t.id !== tag.id);
        this.applyFilter();
        this.cdr.detectChanges();
        },
      error: err => {
        alert(err.error?.error || 'Deletion error');
      }
    });
  }
}
