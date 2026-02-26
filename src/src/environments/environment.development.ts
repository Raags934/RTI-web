import { API_KEY } from '../app/shared/constants/appconstants';
import { AppEnvironment } from './environment.model';

export const environment: AppEnvironment = {
  production: false,
  name: 'development',
  apiUrl: 'https://rti-ideas.dev.aws.rags.net',
  oktaapiurl: 'https://rti-admin.dev.aws.rags.net',
  x_api_key: API_KEY.DEV,
  okta_api_key: API_KEY.OKTA_DEV,
  featureFlags: {
    newDashboard: true,
    enableBeta: true
  },
  logging: {
    level: 'debug',
    remoteEnabled: false
  },
  okta: {
    clientId: '452',
    clientSecret: '5236',
    issuer: 'https://abc.oktapreview.com',
    audience: '0oa2ngykartyujhmM0h8',
    authorizationEndpoint: 'https://abc.oktapreview.com/oauth2/v1/authorize',
    tokenEndpoint: 'https://abc.oktapreview.com/oauth2/v1/token',
    userinfoEndpoint: 'https://abc.oktapreview.com/oauth2/v1/userinfo',
    // Use dev root as redirect URI (must match Okta exactly; Okta has root, not /callback). App handles code on root.
    redirectUri: 'https://acb/',
  }
};