import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TagManagerComponent } from '../tags/tag-manager';
import { TypeManagerComponent } from '../types/type-manager';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterLink, TagManagerComponent, TypeManagerComponent],
  template: `
    <div class="min-h-screen bg-slate-50">
      <div class="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-3">
        <a routerLink="/dashboard" class="text-slate-400 hover:text-slate-600 text-lg leading-none">←</a>
        <div>
          <h1 class="text-xl font-bold text-slate-800">Gestion Tags & Types</h1>
          <p class="text-slate-400 text-xs mt-0.5">Organise ta base de connaissances</p>
        </div>
      </div>
      <div class="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <app-tag-manager></app-tag-manager>
        </div>
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <app-type-manager></app-type-manager>
        </div>
      </div>
    </div>
  `
})
export class AdminComponent {}
