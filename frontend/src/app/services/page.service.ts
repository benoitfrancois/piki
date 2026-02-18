import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Page, PageRequest, TypePage, Tag } from '../models/page.model';

@Injectable({
  providedIn: 'root'
})
export class PageService {
  private apiUrl = '/api/pages';

  constructor(private http: HttpClient) {}

  getAllPages(): Observable<Page[]> {
    return this.http.get<Page[]>(this.apiUrl);
  }

  getPageById(id: number): Observable<Page> {
    return this.http.get<Page>(`${this.apiUrl}/${id}`);
  }

  getPagesByType(type: TypePage): Observable<Page[]> {
    return this.http.get<Page[]>(`${this.apiUrl}/type/${type}`);
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

  getAllTags(): Observable<Tag[]> {
    return this.http.get<Tag[]>(`${this.apiUrl}/tags`);
  }
}
