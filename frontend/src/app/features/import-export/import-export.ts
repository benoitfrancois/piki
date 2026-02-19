import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { PageService } from '../../services/page.service';
import { Page, Type } from '../../models/page.model';
import * as JSZip from 'jszip';

interface ExportPage extends Page {
  selected: boolean;
}

interface ImportPage {
  title: string;
  typeName?: string;
  typeColor?: string;
  typeIcon?: string;
  tags: string[];
  content: string;
  isDuplicate: boolean;
  selected: boolean;
}

interface HistoryEntry {
  date: string;
  action: 'import' | 'export';
  count: number;
  detail: string;
}

@Component({
  selector: 'app-import-export',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './import-export.html',
  styleUrls: ['./import-export.scss']
})
export class ImportExportComponent implements OnInit {

  // ── Export ──────────────────────────────────────────────
  allPages: ExportPage[] = [];
  exportFilterQuery = '';
  isLoadingPages = true;
  isExporting = false;

  get selectedPages(): ExportPage[] {
    return this.allPages.filter(p => p.selected);
  }

  get unselectedFilteredPages(): ExportPage[] {
    const q = this.exportFilterQuery.toLowerCase().trim();
    return this.allPages.filter(p => !p.selected && (
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.type?.name?.toLowerCase().includes(q) ||
      p.tags.some(t => t.name.toLowerCase().includes(q))
    ));
  }

  get allUnselectedChecked(): boolean {
    const unselected = this.unselectedFilteredPages;
    return unselected.length > 0 && unselected.every(p => p.selected);
  }

  // ── Import ──────────────────────────────────────────────
  importPages: ImportPage[] = [];
  importFile: File | null = null;
  importOption: 'skip' | 'overwrite' = 'skip';
  isDragOver = false;
  isCheckingDuplicates = false;
  isImporting = false;
  importResult: { imported: number; skipped: number; overwritten: number; message: string } | null = null;
  importError = '';

  get selectedImportPages(): ImportPage[] {
    return this.importPages.filter(p => p.selected);
  }

  get allImportChecked(): boolean {
    return this.importPages.length > 0 && this.importPages.every(p => p.selected);
  }

  // ── History ─────────────────────────────────────────────
  history: HistoryEntry[] = [];

  constructor(
    private pageService: PageService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadPages();
    this.loadHistory();
  }

  // ── Export methods ───────────────────────────────────────

  loadPages(): void {
    this.isLoadingPages = true;
    this.pageService.getAllPages().subscribe({
      next: pages => {
        this.allPages = pages.map(p => ({ ...p, selected: false }));
        this.isLoadingPages = false;
        this.cdr.detectChanges();
      },
      error: () => { this.isLoadingPages = false; this.cdr.detectChanges(); }
    });
  }

  toggleExportPage(page: ExportPage): void {
    page.selected = !page.selected;
  }

  toggleSelectAllUnselected(): void {
    const unselected = this.unselectedFilteredPages;
    const allChecked = unselected.every(p => p.selected);
    unselected.forEach(p => p.selected = !allChecked);
  }

  deselectPage(page: ExportPage): void {
    page.selected = false;
  }

  clearExportSelection(): void {
    this.allPages.forEach(p => p.selected = false);
  }

  exportSelected(): void {
    if (this.selectedPages.length === 0) return;
    this.isExporting = true;
    const ids = this.selectedPages.map(p => p.id as number);

    this.http.post('/api/import-export/export', ids, { responseType: 'blob' }).subscribe({
      next: blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'piki-export.zip';
        a.click();
        window.URL.revokeObjectURL(url);

        this.addHistory('export', this.selectedPages.length,
          `${this.selectedPages.length} page(s) exported`);
        this.clearExportSelection();
        this.isExporting = false;
        this.cdr.detectChanges();
      },
      error: () => { this.isExporting = false; this.cdr.detectChanges(); }
    });
  }

  // ── Import methods ───────────────────────────────────────

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(): void {
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    const file = event.dataTransfer?.files[0];
    if (file) this.handleFile(file);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.handleFile(input.files[0]);
  }

  async handleFile(file: File): Promise<void> {
    this.importFile = file;
    this.importPages = [];
    this.importResult = null;
    this.importError = '';
    this.isCheckingDuplicates = true;
    this.cdr.detectChanges();

    try {
      let dtos: any[] = [];

      if (file.name.endsWith('.zip')) {
        const zip = await (JSZip as any).loadAsync(file);
        const jsonFile = zip.file('pages.json');
        if (!jsonFile) throw new Error('pages.json not found in ZIP');
        const jsonText = await jsonFile.async('string');
        dtos = JSON.parse(jsonText);
      } else if (file.name.endsWith('.json')) {
        const text = await file.text();
        const parsed = JSON.parse(text);
        dtos = Array.isArray(parsed) ? parsed : [parsed];
      } else {
        throw new Error('Unsupported format. Use .zip or .json');
      }

      if (!Array.isArray(dtos)) dtos = [dtos];

      // Check duplicates
      const titles = dtos.map((d: any) => d.title);
      const checkResp = await this.http.post<string[]>(
        '/api/import-export/check-duplicates', { titles }
      ).toPromise();

      const duplicates = new Set(checkResp || []);

      this.importPages = dtos.map((d: any) => ({
        title: d.title,
        typeName: d.typeName,
        typeColor: d.typeColor,
        typeIcon: d.typeIcon,
        tags: d.tags || [],
        content: d.content || '',
        isDuplicate: duplicates.has(d.title),
        selected: true
      }));

    } catch (err: any) {
      this.importError = err.message || 'Failed to parse file';
    }

    this.isCheckingDuplicates = false;
    this.cdr.detectChanges();
  }

  toggleAllImport(): void {
    const allChecked = this.allImportChecked;
    this.importPages.forEach(p => p.selected = !allChecked);
  }

  doImport(): void {
    if (this.selectedImportPages.length === 0 || !this.importFile) return;
    this.isImporting = true;
    this.importResult = null;

    const formData = new FormData();
    formData.append('file', this.importFile);
    formData.append('overwrite', String(this.importOption === 'overwrite'));
    this.selectedImportPages.forEach(p =>
      formData.append('selectedTitles', p.title)
    );

    this.http.post<any>('/api/import-export/import', formData).subscribe({
      next: result => {
        this.importResult = result;
        this.addHistory('import', result.imported, result.message);
        this.isImporting = false;
        this.loadPages(); // Refresh export list
        this.cdr.detectChanges();
      },
      error: err => {
        this.importError = err.error?.error || 'Import failed';
        this.isImporting = false;
        this.cdr.detectChanges();
      }
    });
  }

  resetImport(): void {
    this.importFile = null;
    this.importPages = [];
    this.importResult = null;
    this.importError = '';
  }

  // ── History ──────────────────────────────────────────────

  loadHistory(): void {
    try {
      const raw = localStorage.getItem('piki_io_history');
      this.history = raw ? JSON.parse(raw) : [];
    } catch {
      this.history = [];
    }
  }

  addHistory(action: 'import' | 'export', count: number, detail: string): void {
    this.history.unshift({
      date: new Date().toLocaleString(),
      action,
      count,
      detail
    });
    this.history = this.history.slice(0, 10); // Keep last 10
    localStorage.setItem('piki_io_history', JSON.stringify(this.history));
  }

  clearHistory(): void {
    this.history = [];
    localStorage.removeItem('piki_io_history');
  }

  // ── Helpers ──────────────────────────────────────────────

  getTypeBadgeClass(color: string): string {
    const map: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-800', green: 'bg-green-100 text-green-800',
      purple: 'bg-purple-100 text-purple-800', red: 'bg-red-100 text-red-800',
      orange: 'bg-orange-100 text-orange-800', yellow: 'bg-yellow-100 text-yellow-800',
      pink: 'bg-pink-100 text-pink-800', gray: 'bg-gray-100 text-gray-700',
    };
    return map[color] || map['gray'];
  }
}
