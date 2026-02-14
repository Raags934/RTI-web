import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  template: `
    <div class="login-page">
      <p>Redirecting to sign in...</p>
      @if (!authService.isOktaConfigured) {
        <p class="error">Okta is not configured. Cannot sign in.</p>
      }
    </div>
  `,
  styles: [
    `
      .login-page {
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
export class LoginComponent implements OnInit {
  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    if (this.authService.isOktaConfigured) {
      this.authService.login();
    }
  }
}
