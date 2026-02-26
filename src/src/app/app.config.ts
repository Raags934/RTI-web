import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { OktaAuth } from '@okta/okta-auth-js';
import { OKTA_AUTH, OKTA_CONFIG } from '@okta/okta-angular';

import { routes } from './app.routes';
import { environment } from '../environments/environment.development';
import { AuthService } from './core/services/auth.service';
import { isLocalHost } from './core/utils/environment.util';

function getOktaProviders(): { provide: unknown; useValue: unknown }[] {
  // On localhost, skip Okta so the app works locally with local API only
  if (isLocalHost()) return [];
  const okta = environment.okta;
  if (!okta?.clientId || !okta?.issuer) return [];
  const redirectUri =
    typeof window !== 'undefined'
      ? `${window.location.origin}/`
      : '';
  if (!redirectUri) return [];
  const oktaAuth = new OktaAuth({
    issuer: okta.issuer,
    clientId: okta.clientId,
    redirectUri,
  });
  return [
    { provide: OKTA_AUTH, useValue: oktaAuth },
    { provide: OKTA_CONFIG, useValue: { oktaAuth } },
  ];
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    ...getOktaProviders(),
    {
      provide: APP_INITIALIZER,
      useFactory: (auth: AuthService) => () => auth.ensureInitialAuth(),
      deps: [AuthService],
      multi: true,
    },
  ],
};
