import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { RecoveryKeyService } from '../../services/recovery-key.service';

type SetupStep = 'form' | 'recovery-key';

@Component({
  selector: 'app-setup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './setup.html',
  styleUrls: ['./setup.scss']
})
export class SetupComponent {
  step: SetupStep = 'form';

  password = '';
  confirm = '';
  errorMsg = '';
  isLoading = false;
  recoveryKey = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private recoveryKeyService: RecoveryKeyService
  ) {}

  onSetup(): void {
    if (this.password.length < 6) {
      this.errorMsg = 'Password must be at least 6 characters';
      return;
    }
    if (this.password !== this.confirm) {
      this.errorMsg = 'Passwords do not match';
      return;
    }

    this.isLoading = true;
    this.errorMsg = '';

    this.http.post<{ success: boolean; recoveryKey: string }>(
      '/api/setup/configure', { password: this.password, dbPassword: this.password }
    ).subscribe({
      next: res => {
        this.recoveryKeyService.set(res.recoveryKey);
        this.router.navigate(['/recovery-key']);
      },
      error: err => {
        this.errorMsg = err.error?.error || 'Setup failed';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  copyKey(): void {
    navigator.clipboard.writeText(this.recoveryKey);
  }

  proceed(): void {
    this.router.navigate(['/login']);
  }
}
