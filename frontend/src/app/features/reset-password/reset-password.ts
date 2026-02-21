import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

type ResetStep = 'verify-key' | 'new-password' | 'new-recovery-key';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.scss']
})
export class ResetPasswordComponent {
  step: ResetStep = 'verify-key';

  recoveryKey = '';
  newPassword = '';
  confirmPassword = '';
  newRecoveryKey = '';
  errorMsg = '';
  isLoading = false;

  constructor(private http: HttpClient, private router: Router) {}

  verifyKey(): void {
    if (!this.recoveryKey.trim()) return;
    this.isLoading = true;
    this.errorMsg = '';

    this.http.post<{ valid: boolean }>(
      '/api/setup/verify-recovery-key', { recoveryKey: this.recoveryKey }
    ).subscribe({
      next: res => {
        if (res.valid) {
          this.step = 'new-password';
        } else {
          this.errorMsg = 'Invalid recovery key';
        }
        this.isLoading = false;
      },
      error: () => {
        this.errorMsg = 'Verification failed';
        this.isLoading = false;
      }
    });
  }

  resetPassword(): void {
    if (this.newPassword.length < 6) {
      this.errorMsg = 'Password must be at least 6 characters';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.errorMsg = 'Passwords do not match';
      return;
    }

    this.isLoading = true;
    this.errorMsg = '';

    this.http.post<{ success: boolean; recoveryKey: string }>(
      '/api/setup/reset-password',
      { recoveryKey: this.recoveryKey, newPassword: this.newPassword }
    ).subscribe({
      next: res => {
        this.newRecoveryKey = res.recoveryKey;
        this.step = 'new-recovery-key';
        this.isLoading = false;
      },
      error: err => {
        this.errorMsg = err.error?.error || 'Reset failed';
        this.isLoading = false;
      }
    });
  }

  copyKey(): void {
    navigator.clipboard.writeText(this.newRecoveryKey);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
