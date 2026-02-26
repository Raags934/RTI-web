import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

/**
 * Protects routes: only allow access if we have an authorized app user (from user table).
 * Redirects to /login if not authenticated, or /access-denied if Okta user not in our table.
 * Uses localStorage to persist session after first successful login.
 */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.currentUserAsObservable.pipe(
    take(1),
    map((user) => {
      if (user) return true;
      // Check if there's a stored session in localStorage
      if (auth.hasStoredSession()) return true;
      if (auth.isOktaConfigured) {
        return router.createUrlTree(['/login']);
      }
      return router.createUrlTree(['/access-denied']);
    })
  );
};
