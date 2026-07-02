import { Injectable } from '@angular/core';

// Chiavi usate nel localStorage del browser
const ACCESS_KEY  = 'nas_access_token';
const REFRESH_KEY = 'nas_refresh_token';

// Gestisce la persistenza dei token JWT nel localStorage del browser.
// Sul web non abbiamo il Keystore Android o il Windows Credential Manager,
// quindi localStorage è la soluzione standard (accettabile per un NAS privato).
@Injectable({ providedIn: 'root' })
export class TokenService {

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_KEY);
  }

  saveTokens(access: string, refresh: string): void {
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  }

  clearTokens(): void {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  }

  isLoggedIn(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;
    try {
      // Decodifica il payload JWT (base64) e controlla il campo "exp"
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      // Token malformato → forziamo logout
      return false;
    }
  }
}
