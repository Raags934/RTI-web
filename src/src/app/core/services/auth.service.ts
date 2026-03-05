import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { OKTA_AUTH } from '@okta/okta-angular';
import type { OktaAuth } from '@okta/okta-auth-js';
import { User } from '../../models/user.model';
import { UserService } from './user.service';
import { environment } from '../../../environments/environment.development';
import { isLocalHost } from '../utils/environment.util';

/** Stub user for local dev when running on localhost (no Okta). */
const LOCAL_DEV_USER: User = {
  user_id: 1,
  name: 'sahil',
  email: 'sahil@example.com',
  active: true,
  roles: [],
  functions: [],
  therapeutic_areas: [],
  research_pathways: [],
};

/** Key for storing user in localStorage */
const STORED_USER_KEY = 'app_current_user';

/**
 * Handles Okta login and app authorization:
 * 1. Okta login (authorize → token → userinfo).
 * 2. Check user exists via GET /users/by_email?email= (authorization).
 * 3. If exists → store user, redirect to home; if not → redirect to access-denied.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  private readonly oktaAuth = inject(OKTA_AUTH, { optional: true }) as OktaAuth | null;

  private readonly currentUser$ = new BehaviorSubject<User | null>(null);

  /** Current app user (from our user table) after Okta + authorization check. */
  get currentUser(): User | null {
    return this.currentUser$.getValue();
  }

  get currentUserAsObservable(): Observable<User | null> {
    return this.currentUser$.asObservable();
  }

  /** user_id of the authorized user for created_by / updated_by. */
  getCurrentUserId(): number | null {
    const user = this.currentUser$.getValue();
    return user?.user_id ?? null;
  }

  /** Whether Okta is configured (we use it for login). */
  get isOktaConfigured(): boolean {
    if (isLocalHost()) return false;
    return !!(
      environment.okta?.clientId &&
      environment.okta?.issuer
    );
  }

  /** Get stored user from localStorage */
  private getStoredUser(): User | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(STORED_USER_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored) as User;
    } catch {
      return null;
    }
  }

  /** Store user in localStorage */
  private storeUser(user: User): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORED_USER_KEY, JSON.stringify(user));
  }

  /** Clear stored user from localStorage */
  private clearStoredSession(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORED_USER_KEY);
  }

  /** Check if user is stored in localStorage (for guard to use) */
  hasStoredSession(): boolean {
    return !!this.getStoredUser();
  }

  /** Start Okta login (redirects to Okta). */
  login(): void {
    if (!this.oktaAuth) {
      console.warn('Okta not configured');
      return;
    }
    this.oktaAuth.signInWithRedirect();
  }

  /**
   * Handle Okta callback: parse tokens, get userinfo, check user table, then redirect.
   * Call this from the callback route component.
   */
  async handleCallback(): Promise<'authorized' | 'access-denied'> {
    if (!this.oktaAuth) {
      this.router.navigate(['/access-denied']);
      return 'access-denied';
    }

    try {
      await this.oktaAuth.handleLoginRedirect();
      const userInfo = await this.oktaAuth.getUser();
      const email = userInfo?.email as string | undefined;
      if (!email) {
        this.router.navigate(['/access-denied']);
        return 'access-denied';
      }

      //const user = await firstValueFrom(this.userService.getByEmail(email));
      const user = {
        email: userInfo?.email,
      } as User
     
      console.log('Email value:', user);
      // console.log('Email value1:', userInfo?.email);
      // console.log('Email value2:', userInfo);
     
      if (!user) {
        this.router.navigate(['/access-denied']);
        return 'access-denied';
      }

      // Store user in localStorage for persistent session
      this.storeUser(user);
      this.currentUser$.next(user);
      this.router.navigate(['/']);
      return 'authorized';
    } catch (e) {
      console.error('Auth callback error', e);
      this.router.navigate(['/access-denied']);
      return 'access-denied';
    }
  }

  logout(): void {
    this.currentUser$.next(null);
    this.clearStoredSession();
    if (this.oktaAuth) {
      this.oktaAuth.signOut();
    } else {
      this.router.navigate(['/login']);
    }
  }

  /**
   * If the URL has an authorization code (Okta redirected here), handle it first.
   * Otherwise try to restore session from existing tokens.
   * Call from APP_INITIALIZER so callback is handled before routing.
   */
  async ensureInitialAuth(): Promise<void> {
    if (isLocalHost()) {
      this.currentUser$.next(LOCAL_DEV_USER);
      return;
    }
    const hasCode =
      typeof window !== 'undefined' &&
      typeof URLSearchParams !== 'undefined' &&
      new URLSearchParams(window.location.search).has('code');
    if (hasCode && this.oktaAuth) {
      await this.handleCallback();
      return;
    }
    await this.restoreSession();
  }

  /** Sync auth state from existing Okta session (e.g. page refresh). */
  async restoreSession(): Promise<boolean> {
    if (isLocalHost()) {
      this.currentUser$.next(LOCAL_DEV_USER);
      return true;
    }
    if (this.currentUser$.getValue()) {
      return true;
    }

    // First, try to restore from localStorage (persistent session)
    const storedUser = this.getStoredUser();
    if (storedUser) {
      this.currentUser$.next(storedUser);
      return true;
    }

    // If no stored user, try Okta session
    if (!this.oktaAuth) {
      return false;
    }

    try {
      const isAuthenticated = await this.oktaAuth.isAuthenticated();
      if (!isAuthenticated) return false;
      const userInfo = await this.oktaAuth.getUser();
      const email = userInfo?.email as string | undefined;
      if (!email) return false;
      const user = await firstValueFrom(this.userService.getByEmail(email));
      if (!user) return false;
      // Store user for next time
      this.storeUser(user);
      this.currentUser$.next(user);
      return true;
    } catch {
      return false;
    }
  }
}
