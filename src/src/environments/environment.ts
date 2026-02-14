import { AppEnvironment } from './environment.model';

export const environment: AppEnvironment = {
  production: true,
  name: 'production',
  apiUrl: 'https://api.myapp.com',
  x_api_key: 'a',
  featureFlags: {
    newDashboard: true,
    enableBeta: false
  },
  logging: {
    level: 'warn',
    remoteEnabled: true
  },
  okta: {
    clientId: '',
    clientSecret: '',
    issuer: 'https://alcon.oktapreview.com',
    audience: '',
    authorizationEndpoint: 'https://alcon.oktapreview.com/oauth2/v1/authorize',
    tokenEndpoint: 'https://alcon.oktapreview.com/oauth2/v1/token',
    userinfoEndpoint: 'https://alcon.oktapreview.com/oauth2/v1/userinfo'
  }
};
