import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, map, catchError, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SetupGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.auth.checkSetupStatus().pipe(
      map(res => {
        if (res.configured) {
          this.router.navigate(['/login']);
          return false;
        }
        return true;
      }),
      catchError(() => of(true))
    );
  }
}
