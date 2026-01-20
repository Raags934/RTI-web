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
  }
};
