import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageService } from '../../services/page.service';
import { Type } from '../../models/page.model';

@Component({
  selector: 'app-type-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <h2 class="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
        📂 Types de pages
        <span class="bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-0.5 rounded-full">
          {{ types.length }}
        </span>
      </h2>

      <!-- Formulaire création -->
      <div class="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-200">
        <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Nouveau type</p>
        <div class="flex gap-2 flex-wrap">
          <input type="text" [(ngModel)]="newName" placeholder="Nom..."
            class="flex-1 min-w-32 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
          <input type="text" [(ngModel)]="newIcon" placeholder="📄" maxlength="4"
            class="w-16 text-center px-2 py-2 border border-slate-200 rounded-lg text-lg focus:outline-none" />
          <select [(ngModel)]="newColor"
            class="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none bg-white">
            <option *ngFor="let c of colorOptions" [value]="c.value">{{ c.label }}</option>
          </select>
          <button (click)="create()"
            class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
            Ajouter
          </button>
        </div>
        <!-- Aperçu -->
        <div class="mt-3 flex items-center gap-2">
          <span class="text-xs text-slate-400">Aperçu :</span>
          <span class="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full"
            [ngClass]="getColorClass(newColor, 'badge')">
            {{ newIcon || '📄' }} {{ newName || 'Nouveau type' }}
          </span>
        </div>
        <p *ngIf="createError" class="text-red-500 text-xs mt-2">{{ createError }}</p>
      </div>

      <div *ngIf="isLoading" class="text-slate-400 text-sm text-center py-8">Chargement...</div>
      <p *ngIf="!isLoading && types.length === 0" class="text-slate-400 text-sm text-center py-8">Aucun type.</p>

      <ul class="space-y-2">
        <li *ngFor="let t of types" class="group">
          <!-- Affichage -->
          <div *ngIf="editingId !== t.id"
            class="flex items-center justify-between rounded-xl px-4 py-3 border-2 transition-colors"
            [ngClass]="getColorClass(t.color, 'card')">
            <div class="flex items-center gap-3">
              <span class="text-xl">{{ t.icon }}</span>
              <p class="font-semibold text-sm" [ngClass]="getColorClass(t.color, 'text')">{{ t.name }}</p>
            </div>
            <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button (click)="startEdit(t)" class="text-slate-400 hover:text-indigo-600 p-1.5 rounded text-sm">✏️</button>
              <button (click)="delete(t)"    class="text-slate-400 hover:text-red-500 p-1.5 rounded text-sm">🗑️</button>
            </div>
          </div>
          <!-- Édition -->
          <div *ngIf="editingId === t.id" class="rounded-xl border-2 border-indigo-400 p-3 bg-indigo-50">
            <div class="flex gap-2 flex-wrap mb-2">
              <input type="text" [(ngModel)]="editName" (keyup.enter)="saveEdit(t)"
                class="flex-1 min-w-32 px-3 py-2 border border-indigo-300 rounded-lg text-sm focus:outline-none bg-white" />
              <input type="text" [(ngModel)]="editIcon" maxlength="4"
                class="w-16 text-center px-2 py-2 border border-indigo-300 rounded-lg text-lg focus:outline-none bg-white" />
              <select [(ngModel)]="editColor"
                class="px-3 py-2 border border-indigo-300 rounded-lg text-sm focus:outline-none bg-white">
                <option *ngFor="let c of colorOptions" [value]="c.value">{{ c.label }}</option>
              </select>
            </div>
            <div class="flex gap-2 justify-end">
              <button (click)="saveEdit(t)"
                class="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold">
                ✓ Sauvegarder
              </button>
              <button (click)="cancelEdit()"
                class="bg-slate-200 hover:bg-slate-300 text-slate-600 px-3 py-1.5 rounded-lg text-xs">
                Annuler
              </button>
            </div>
          </div>
        </li>
      </ul>

      <div class="mt-5 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-700">
        ⚠️ Supprimer un type met les pages associées à "Sans type".
      </div>
    </div>
  `
})
export class TypeManagerComponent implements OnInit {
  types: Type[] = [];
  isLoading = true;
  createError = '';
  newName = ''; newColor = 'gray'; newIcon = '📄';
  editingId: number | null = null;
  editName = ''; editColor = 'gray'; editIcon = '📄';

  colorOptions = [
    { value: 'blue',   label: '🔵 Bleu'   },
    { value: 'green',  label: '🟢 Vert'   },
    { value: 'purple', label: '🟣 Violet' },
    { value: 'red',    label: '🔴 Rouge'  },
    { value: 'orange', label: '🟠 Orange' },
    { value: 'yellow', label: '🟡 Jaune'  },
    { value: 'pink',   label: '🩷 Rose'   },
    { value: 'gray',   label: '⚫ Gris'   },
  ];

  constructor(private pageService: PageService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.isLoading = true;
    this.pageService.getAllTypes().subscribe({
      next: types => { this.types = types; this.isLoading = false; this.cdr.detectChanges(); },
      error: () => { this.isLoading = false; this.cdr.detectChanges(); }
    });
  }

  create(): void {
    if (!this.newName.trim()) { this.createError = 'Le nom est requis'; return; }
    this.createError = '';
    this.pageService.createType(this.newName.trim(), this.newColor, this.newIcon || '📄').subscribe({
      next: t => { this.types = [...this.types, t]; this.newName = ''; this.newColor = 'gray'; this.newIcon = '📄'; this.cdr.detectChanges(); },
      error: err => { this.createError = err.error?.error || 'Erreur création'; this.cdr.detectChanges(); }
    });
  }

  startEdit(t: Type): void { this.editingId = t.id; this.editName = t.name; this.editColor = t.color; this.editIcon = t.icon; }
  cancelEdit(): void { this.editingId = null; }

  saveEdit(t: Type): void {
    if (!this.editName.trim()) return;
    this.pageService.updateType(t.id, this.editName.trim(), this.editColor, this.editIcon || '📄').subscribe({
      next: updated => {
        const i = this.types.findIndex(x => x.id === t.id);
        if (i !== -1) this.types[i] = updated;
        this.types = [...this.types];
        this.cancelEdit();
        this.cdr.detectChanges();
      },
      error: err => { alert(err.error?.error || 'Erreur mise à jour'); }
    });
  }

  delete(t: Type): void {
    if (!confirm(`Supprimer "${t.name}" ? Les pages associées n'auront plus de type.`)) return;
    this.pageService.deleteType(t.id).subscribe({
      next: () => { this.types = this.types.filter(x => x.id !== t.id); this.cdr.detectChanges(); },
      error: err => { alert(err.error?.error || 'Erreur suppression'); }
    });
  }

  getColorClass(color: string, variant: 'badge' | 'card' | 'text'): string {
    const map: Record<string, Record<string, string>> = {
      blue:   { badge: 'bg-blue-100 text-blue-800',    card: 'bg-blue-50 border-blue-200',    text: 'text-blue-800' },
      green:  { badge: 'bg-green-100 text-green-800',  card: 'bg-green-50 border-green-200',  text: 'text-green-800' },
      purple: { badge: 'bg-purple-100 text-purple-800',card: 'bg-purple-50 border-purple-200',text: 'text-purple-800' },
      red:    { badge: 'bg-red-100 text-red-800',      card: 'bg-red-50 border-red-200',      text: 'text-red-800' },
      orange: { badge: 'bg-orange-100 text-orange-800',card: 'bg-orange-50 border-orange-200',text: 'text-orange-800' },
      yellow: { badge: 'bg-yellow-100 text-yellow-800',card: 'bg-yellow-50 border-yellow-200',text: 'text-yellow-800' },
      pink:   { badge: 'bg-pink-100 text-pink-800',    card: 'bg-pink-50 border-pink-200',    text: 'text-pink-800' },
      gray:   { badge: 'bg-gray-100 text-gray-700',    card: 'bg-gray-50 border-gray-200',    text: 'text-gray-700' },
    };
    return (map[color] || map['gray'])[variant];
  }
}
