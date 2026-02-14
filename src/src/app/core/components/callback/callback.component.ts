import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-callback',
  standalone: true,
  template: `
    <div class="callback-page">
      <p>Completing sign in...</p>
      @if (error) {
        <p class="error">{{ error }}</p>
      }
    </div>
  `,
  styles: [
    `
      .callback-page {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 60vh;
        padding: 2rem;
      }
      .error { color: #c62828; }
    `,
  ],
})
export class CallbackComponent implements OnInit {
  error: string | null = null;

  constructor(private authService: AuthService) {}

  async ngOnInit(): Promise<void> {
    try {
      const result = await this.authService.handleCallback();
      if (result === 'access-denied') {
        this.error = 'Access denied. Your account is not authorized to use this application.';
      }
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'Sign-in failed.';
    }
  }
}
