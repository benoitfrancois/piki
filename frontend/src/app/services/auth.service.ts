import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private authenticated$ = new BehaviorSubject<boolean>(false);
  private configured$ = new BehaviorSubject<boolean>(true);

  constructor(private http: HttpClient) {}

  login(password: string): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>('/api/auth/login', { password }).pipe(
      tap(() => this.authenticated$.next(true))
    );
  }

  logout(): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>('/api/auth/logout', {}).pipe(
      tap(() => this.authenticated$.next(false))
    );
  }

  checkAuth(): Observable<{ authenticated: boolean; configured: boolean }> {
    return this.http.get<{ authenticated: boolean; configured: boolean }>('/api/auth/check').pipe(
      tap(res => {
        this.authenticated$.next(res.authenticated);
        this.configured$.next(res.configured);
      })
    );
  }

  checkSetupStatus(): Observable<{ configured: boolean }> {
    return this.http.get<{ configured: boolean }>('/api/setup/status').pipe(
      tap(res => this.configured$.next(res.configured))
    );
  }

  isAuthenticated(): boolean { return this.authenticated$.value; }
  isConfigured(): boolean { return this.configured$.value; }
}
