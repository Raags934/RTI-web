import { AppEnvironment } from './environment.model';

export const environment: AppEnvironment = {
  production: false,
  name: 'qa',
  apiUrl: 'https://qa.api.myapp.com',
  x_api_key: 'a',
  featureFlags: {
    newDashboard: true,
    enableBeta: false
  },
  logging: {
    level: 'info',
    remoteEnabled: true
  }
};
