import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageService } from '../../services/page.service';
import { Type } from '../../models/page.model';

@Component({
  selector: 'app-type-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './type-manager.html',
  styleUrls: ['./type-manager.scss']
})
export class TypeManagerComponent implements OnInit {
  types: Type[] = [];
  filteredTypes: Type[] = [];
  filterQuery = '';
  isLoading = true;
  createError = '';

  newName = '';
  newColor = 'gray';
  newIcon = '📄';

  editingId: number | null = null;
  editName = '';
  editColor = 'gray';
  editIcon = '📄';

  colorOptions = [
    { value: 'blue',   label: 'Blue'   },
    { value: 'green',  label: 'Green'  },
    { value: 'purple', label: 'Purple' },
    { value: 'red',    label: 'Red'    },
    { value: 'orange', label: 'Orange' },
    { value: 'yellow', label: 'Yellow' },
    { value: 'pink',   label: 'Pink'   },
    { value: 'gray',   label: 'Gray'   },
  ];

  showColorPicker = false;
  showEditColorPicker = false;

  constructor(
    private pageService: PageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.pageService.getAllTypes().subscribe({
      next: types => {
        this.types = types;
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
    this.filteredTypes = q
      ? this.types.filter(t => t.name.toLowerCase().includes(q))
      : [...this.types];
  }

  onFilterChange(): void {
    this.applyFilter();
  }

  clearFilter(): void {
    this.filterQuery = ''; this.applyFilter();
  }

  create(): void {
    if (!this.newName.trim()) { this.createError = 'Name is required'; return; }
    this.createError = '';
    this.pageService.createType(this.newName.trim(), this.newColor, this.newIcon || '📄').subscribe({
      next: t => {
        this.types = [...this.types, t];
        this.newName = '';
        this.newColor = 'gray';
        this.newIcon = '📄';
        this.applyFilter();
        this.cdr.detectChanges();
      },
      error: err => {
        this.createError = err.error?.error || 'Creation error';
        this.cdr.detectChanges();
      }
    });
  }

  startEdit(t: Type): void {
    this.editingId = t.id;
    this.editName = t.name;
    this.editColor = t.color;
    this.editIcon = t.icon;
  }
  cancelEdit(): void {
    this.editingId = null;
  }

  saveEdit(t: Type): void {
    if (!this.editName.trim()) return;
    this.pageService.updateType(t.id, this.editName.trim(), this.editColor, this.editIcon || '📄').subscribe({
      next: updated => {
        const i = this.types.findIndex(x => x.id === t.id);
        if (i !== -1) this.types[i] = updated;
        this.types = [...this.types];
        this.applyFilter();
        this.cancelEdit();
        this.cdr.detectChanges();
      },
      error: err => { alert(err.error?.error || 'Update error'); }
    });
  }

  delete(t: Type): void {
    if (!confirm(`Delete type "${t.name}" ? Associated pages will have no type.`)) return;
    this.pageService.deleteType(t.id).subscribe({
      next: () => {
        this.types = this.types.filter(x => x.id !== t.id);
        this.applyFilter();
        this.cdr.detectChanges();
        },
      error: err => {
        alert(err.error?.error || 'Delete error');
      }
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

  getDotClass(color: string): string {
    const map: Record<string, string> = {
      blue:   'bg-blue-500',
      green:  'bg-green-500',
      purple: 'bg-purple-500',
      red:    'bg-red-500',
      orange: 'bg-orange-500',
      yellow: 'bg-yellow-400',
      pink:   'bg-pink-500',
      gray:   'bg-gray-500',
    };
    return map[color] || 'bg-gray-500';
  }

  getColorLabel(value: string): string {
    return this.colorOptions.find(c => c.value === value)?.label || value;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.color-picker-wrapper')) {
      this.showColorPicker = false;
      this.showEditColorPicker = false;
      this.cdr.detectChanges();
    }
  }

  toggleColorPicker(): void {
    this.showColorPicker = !this.showColorPicker;
    this.showEditColorPicker = false;
  }

  toggleEditColorPicker(): void {
    this.showEditColorPicker = !this.showEditColorPicker;
    this.showColorPicker = false;
  }
}
