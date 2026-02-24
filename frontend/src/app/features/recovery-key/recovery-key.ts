import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RecoveryKeyService } from '../../services/recovery-key.service';

@Component({
  selector: 'app-recovery-key',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recovery-key.html'
})
export class RecoveryKeyComponent implements OnInit {
  recoveryKey = '';
  copySuccess = false;

  constructor(
    private recoveryKeyService: RecoveryKeyService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.recoveryKey = this.recoveryKeyService.get();
    if (!this.recoveryKey) {
      this.router.navigate(['/login']);
    }
  }

  copyKey(): void {
    navigator.clipboard.writeText(this.recoveryKey).then(() => {
      this.copySuccess = true;
      setTimeout(() => this.copySuccess = false, 2000);
    });
  }

  proceed(): void {
    this.recoveryKeyService.clear();
    this.router.navigate(['/login']);
  }
}
