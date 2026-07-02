import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../services/token.service';

// Redirige al login se non c'è un token valido.
export const authGuard: CanActivateFn = () => {
  const tokens = inject(TokenService);
  const router = inject(Router);

  if (tokens.isLoggedIn()) return true;

  router.navigate(['/login']);
  return false;
};
