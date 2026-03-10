import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
        return router.parseUrl('/login');
    }

    // Check role requirements if any
    const requiredRole = route.data['role'];
    if (requiredRole && authService.currentUser()?.role !== requiredRole) {
        return router.parseUrl('/home');
    }

    return true;
};
