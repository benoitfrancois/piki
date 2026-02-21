import { Component } from '@angular/core';
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
export class LoginComponent {
  password = '';
  errorMsg = '';
  isLoading = false;

  constructor(private auth: AuthService, private router: Router) {}

  onLogin(): void {
    if (!this.password.trim()) return;
    this.isLoading = true;
    this.errorMsg = '';

    this.auth.login(this.password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => {
        this.errorMsg = 'Incorrect password';
        this.isLoading = false;
        this.password = '';
      }
    });
  }
}
