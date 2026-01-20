import { AppEnvironment } from './environment.model';

export const environment: AppEnvironment = {
  production: false,
  name: 'development',
  apiUrl: 'http:localhost:5000',
  x_api_key: '9C4Ql8F6GeREMxQXdLu1abcFgETpC6J1kg4AXHIccc',
  featureFlags: {
    newDashboard: true,
    enableBeta: true
  },
  logging: {
    level: 'debug',
    remoteEnabled: false
  }
};
