import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Role } from './models';

export function roleGuard(role: Role): CanActivateFn {
  return (_route, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);
    if (auth.expireIfNeeded()) return router.createUrlTree(['/login'], { queryParams: { expired: '1' } });
    const session = auth.session();
    if (!session) return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
    return session.role === role || router.createUrlTree(['/forbidden']);
  };
}
