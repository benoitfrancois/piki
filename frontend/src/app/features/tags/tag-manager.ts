import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TagService } from '../../services/tag.service';
import { Tag } from '../../models/page.model';

@Component({
  selector: 'app-tag-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <h2 class="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
        🏷️ Tags
        <span class="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-0.5 rounded-full">
          {{ tags.length }}
        </span>
      </h2>

      <!-- Create -->
      <div class="flex gap-2 mb-4">
        <input type="text" [(ngModel)]="newName" (keyup.enter)="create()"
          placeholder="Nouveau tag..."
          class="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        <button (click)="create()"
          class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
          Ajouter
        </button>
      </div>
      <p *ngIf="errorMsg" class="text-red-500 text-xs mb-3">{{ errorMsg }}</p>

      <div *ngIf="isLoading" class="text-slate-400 text-sm text-center py-8">Chargement...</div>
      <p *ngIf="!isLoading && tags.length === 0" class="text-slate-400 text-sm text-center py-8">Aucun tag.</p>

      <ul class="space-y-2">
        <li *ngFor="let tag of tags" class="group flex items-center gap-2">
          <!-- Display -->
          <div *ngIf="editingId !== tag.id"
            class="flex-1 flex items-center justify-between bg-slate-50 hover:bg-slate-100 rounded-xl px-4 py-2.5 transition-colors">
            <span class="text-sm font-medium text-slate-700"># {{ tag.name }}</span>
            <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button (click)="startEdit(tag)" class="text-slate-400 hover:text-indigo-600 p-1 rounded text-xs">✏️</button>
              <button (click)="delete(tag)"    class="text-slate-400 hover:text-red-500 p-1 rounded text-xs">🗑️</button>
            </div>
          </div>
          <!-- Edition -->
          <div *ngIf="editingId === tag.id" class="flex-1 flex gap-2">
            <input type="text" [(ngModel)]="editingName"
              (keyup.enter)="saveEdit(tag)" (keyup.escape)="cancelEdit()"
              class="flex-1 px-3 py-2 border-2 border-indigo-400 rounded-xl text-sm focus:outline-none" />
            <button (click)="saveEdit(tag)"
              class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-semibold">✓</button>
            <button (click)="cancelEdit()"
              class="bg-slate-200 hover:bg-slate-300 text-slate-600 px-3 py-1 rounded-lg text-xs">✕</button>
          </div>
        </li>
      </ul>
    </div>
  `
})
export class TagManagerComponent implements OnInit {
  tags: Tag[] = [];
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
      next: tags => { this.tags = tags.sort((a, b) => a.name.localeCompare(b.name)); this.isLoading = false; this.cdr.detectChanges(); },
      error: () => { this.isLoading = false; this.cdr.detectChanges(); }
    });
  }

  create(): void {
    const name = this.newName.trim().toLowerCase();
    if (!name) return;
    this.errorMsg = '';
    this.tagService.create(name).subscribe({
      next: tag => { this.tags = [...this.tags, tag].sort((a, b) => a.name.localeCompare(b.name)); this.newName = ''; this.cdr.detectChanges(); },
      error: err => { this.errorMsg = err.error?.error || 'Erreur création'; this.cdr.detectChanges(); }
    });
  }

  startEdit(tag: Tag): void { this.editingId = tag.id!; this.editingName = tag.name; }
  cancelEdit(): void { this.editingId = null; }

  saveEdit(tag: Tag): void {
    const name = this.editingName.trim().toLowerCase();
    if (!name) return;
    this.tagService.rename(tag.id!, name).subscribe({
      next: updated => {
        const i = this.tags.findIndex(t => t.id === tag.id);
        if (i !== -1) this.tags[i] = updated;
        this.tags = [...this.tags].sort((a, b) => a.name.localeCompare(b.name));
        this.cancelEdit();
        this.cdr.detectChanges();
      },
      error: err => { alert(err.error?.error || 'Erreur renommage'); }
    });
  }

  delete(tag: Tag): void {
    if (!confirm(`Supprimer "#${tag.name}" de toutes les pages ?`)) return;
    this.tagService.delete(tag.id!).subscribe({
      next: () => { this.tags = this.tags.filter(t => t.id !== tag.id); this.cdr.detectChanges(); },
      error: err => { alert(err.error?.error || 'Erreur suppression'); }
    });
  }
}
