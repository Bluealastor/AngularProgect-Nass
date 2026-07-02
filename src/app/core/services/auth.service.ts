import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { TokenService } from './token.service';
import { environment } from '../../../environments/environment';

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

// Gestisce login, logout e refresh del token JWT.
// Tutti gli endpoint /api/auth/* sono pubblici (non richiedono JWT).
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http   = inject(HttpClient);
  private router = inject(Router);
  private tokens = inject(TokenService);

  private readonly base = `${environment.apiUrl}/api/auth`;

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/login`, { username, password }).pipe(
      tap(res => this.tokens.saveTokens(res.accessToken, res.refreshToken))
    );
  }

  logout(): void {
    this.tokens.clearTokens();
    this.router.navigate(['/login']);
  }

  refreshToken(): Observable<AuthResponse> {
    const refresh = this.tokens.getRefreshToken();
    return this.http.post<AuthResponse>(`${this.base}/refresh`, { refreshToken: refresh }).pipe(
      tap(res => this.tokens.saveTokens(res.accessToken, res.refreshToken))
    );
  }
}
