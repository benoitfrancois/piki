import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent implements OnInit{
  password = '';
  errorMsg = '';
  isLoading = false;
  showPassword = false;

  ngOnInit(): void {
    this.auth.checkSetupStatus().subscribe(res => {
      if (!res.configured) {
        this.router.navigate(['/setup']);
      }
    });
  }

  constructor(
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  onLogin(): void {
    if (!this.password.trim()) return;
    this.isLoading = true;
    this.errorMsg = '';

    this.auth.login(this.password).subscribe({
      next: () => this.router.navigate(['/home']),
      error: () => {
        this.errorMsg = 'Incorrect password';
        this.isLoading = false;
        this.password = '';
        this.cdr.detectChanges();
      }
    });
  }
}
