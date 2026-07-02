import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { TokenService } from '../services/token.service';

// Aggiunge automaticamente "Authorization: Bearer <token>" a ogni richiesta HTTP,
// tranne quelle verso /api/auth/* che sono pubbliche.
// Se il server risponde 401 (token scaduto/invalido), svuota i token e
// reindirizza al login così l'utente può riautenticarsi.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokens = inject(TokenService);
  const router = inject(Router);
  const token  = tokens.getAccessToken();

  if (token && !req.url.includes('/api/auth/')) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && !req.url.includes('/api/auth/')) {
        tokens.clearTokens();
        router.navigate(['/login']);
      }
      return throwError(() => err);
    })
  );
};
