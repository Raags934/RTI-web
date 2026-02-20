import { API_KEY } from '../app/shared/constants/appconstants';
import { AppEnvironment } from './environment.model';

export const environment: AppEnvironment = {
  production: true,
  name: 'production',
  apiUrl: 'https://api.myapp.com',
  oktaapiurl: 'https://rti-admin.dev.aws.alcon.net',
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
    clientId: '0oz1n4bdfdg9qkLhJs0z231',
    clientSecret: 'SDFBx_r2gNSPTVjbH6jl-T0lidfh0StZpOfsrFfXp4glywMk23gATWjBfwXROmPc',
    issuer: 'https://alcon.oktapreview.com',
    audience: '0oa2ngykartyujhmM0h8',
    authorizationEndpoint: 'https://alcon.oktapreview.com/oauth2/v1/authorize',
    tokenEndpoint: 'https://alcon.oktapreview.com/oauth2/v1/token',
    userinfoEndpoint: 'https://alcon.oktapreview.com/oauth2/v1/userinfo',
    redirectUri: 'https://rtinception.dev.aws.alcon.net/'
  }
};
