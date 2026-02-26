import { API_KEY } from '../app/shared/constants/appconstants';
import { AppEnvironment } from './environment.model';

export const environment: AppEnvironment = {
  production: true,
  name: 'production',
  apiUrl: 'https://api.av.com',
  oktaapiurl: 'https://rti-admin.dev.aws.rags.net',
  x_api_key: API_KEY.PROD,
  okta_api_key: API_KEY.OKTA_PROD,
  featureFlags: {
    newDashboard: true,
    enableBeta: false
  },
  logging: {
    level: 'warn',
    remoteEnabled: true
  },
  okta: {
    clientId: '152', 
    clientSecret: '556',
    issuer: 'https://rags.oktapreview.com',
    audience: '123',
    authorizationEndpoint: 'https://rags.oktapreview.com/oauth2/v1/authorize',
    tokenEndpoint: 'https://ags.oktapreview.com/oauth2/v1/token',
    userinfoEndpoint: 'https://tags.oktapreview.com/oauth2/v1/userinfo',
    redirectUri: 'https://abc.dev.aws.rags.net/'
  }
};
