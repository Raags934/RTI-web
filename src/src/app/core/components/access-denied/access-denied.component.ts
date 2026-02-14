import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="access-denied-page">
      <h1>Access Denied</h1>
      <p>Your account is not authorized to access this application. Please contact your administrator if you believe this is an error.</p>
      <a routerLink="/login" class="link">Back to sign in</a>
    </div>
  `,
  styles: [
    `
      .access-denied-page {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 60vh;
        padding: 2rem;
        text-align: center;
      }
      .link { margin-top: 1rem; color: #1565c0; }
    `,
  ],
})
export class AccessDeniedComponent {}
