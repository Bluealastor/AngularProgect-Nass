import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  private auth   = inject(AuthService);
  private router = inject(Router);

  username = '';
  password = '';
  loading  = false;
  error    = '';

  onSubmit(): void {
    if (!this.username || !this.password) return;
    this.loading = true;
    this.error   = '';

    this.auth.login(this.username, this.password).subscribe({
      next: () => this.router.navigate(['/home']),
      error: (err) => {
        this.loading = false;
        this.error = err.status === 401
          ? 'Credenziali non valide.'
          : 'Errore di connessione al server.';
      },
    });
  }
}
