import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Page, PageRequest, Type, Tag } from '../models/page.model';

@Injectable({
  providedIn: 'root'
})
export class PageService {
  private apiUrl = '/api/pages';
  private typeUrl = '/api/types';

  constructor(private http: HttpClient) {}

  // ── Pages ──────────────────────────────────────────────
  getAllPages(): Observable<Page[]> {
    return this.http.get<Page[]>(this.apiUrl);
  }

  getPageById(id: number): Observable<Page> {
    return this.http.get<Page>(`${this.apiUrl}/${id}`);
  }

  createPage(pageRequest: PageRequest): Observable<Page> {
    return this.http.post<Page>(this.apiUrl, pageRequest);
  }

  updatePage(id: number, pageRequest: PageRequest): Observable<Page> {
    return this.http.put<Page>(`${this.apiUrl}/${id}`, pageRequest);
  }

  deletePage(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  searchPages(title: string): Observable<Page[]> {
    const params = new HttpParams().set('title', title);
    return this.http.get<Page[]>(`${this.apiUrl}/search`, { params });
  }

  // ── Tags ───────────────────────────────────────────────
  getAllTags(): Observable<Tag[]> {
    return this.http.get<Tag[]>(`${this.apiUrl}/tags`);
  }

  // ── Types ──────────────────────────────────────────────
  getAllTypes(): Observable<Type[]> {
    return this.http.get<Type[]>(this.typeUrl);
  }

  createType(name: string, color: string, icon: string): Observable<Type> {
    return this.http.post<Type>(this.typeUrl, { name, color, icon });
  }

  updateType(id: number, name: string, color: string, icon: string): Observable<Type> {
    return this.http.put<Type>(`${this.typeUrl}/${id}`, { name, color, icon });
  }

  deleteType(id: number): Observable<void> {
    return this.http.delete<void>(`${this.typeUrl}/${id}`);
  }

  getTypePageCount(id: number): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.typeUrl}/${id}/page-count`);
  }
}
