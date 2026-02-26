import { API_KEY } from '../app/shared/constants/appconstants';
import { AppEnvironment } from './environment.model';

export const environment: AppEnvironment = {
  production: false,
  name: 'qa',
  apiUrl: 'https://qa.api.myapp.com',
  oktaapiurl: 'https://rti-admin.dev.aws.rags.net',
  x_api_key: API_KEY.QA,
  okta_api_key: API_KEY.OKTA_QA,
  featureFlags: {
    newDashboard: true,
    enableBeta: false
  },
  logging: {
    level: 'info',
    remoteEnabled: true
  },
  okta: {
    clientId: '123',
    clientSecret: '123',
    issuer: 'https://raags.oktapreview.com',
    audience: '123',
    authorizationEndpoint: 'https://rags.oktapreview.com/oauth2/v1/authorize',
    tokenEndpoint: 'https://rags.oktapreview.com/oauth2/v1/token',
    userinfoEndpoint: 'https://rags.oktapreview.com/oauth2/v1/userinfo',
    redirectUri: 'https://anc.dev.aws.rasg.net/'
  }
};
