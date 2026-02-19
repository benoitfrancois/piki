import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tag } from '../models/page.model';

@Injectable({ providedIn: 'root' })
export class TagService {
  private apiUrl = '/api/tags';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Tag[]> {
    return this.http.get<Tag[]>(this.apiUrl);
  }

  create(name: string): Observable<Tag> {
    return this.http.post<Tag>(this.apiUrl, { name });
  }

  rename(id: number, name: string): Observable<Tag> {
    return this.http.put<Tag>(`${this.apiUrl}/${id}`, { name });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
