import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { User } from '../../models/user.model';
import { environment } from '../../../environments/environment';

export interface UserByEmailResponse {
  user: User;
}

/**
 * Fetches user by email from backend. Used to authorize after Okta login:
 * if user exists in our user table, they are authorized.
 */
@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getByEmail(email: string): Observable<User | null> {
    if (!email?.trim()) {
      return of(null);
    }
    return this.http
      .get<UserByEmailResponse>(`${this.baseUrl}/users/by_email`, {
        params: { email: email.trim() },
      })
      .pipe(
        map((res) => res?.user ?? null),
        catchError(() => of(null))
      );
  }
}
