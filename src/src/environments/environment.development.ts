import { API_KEY } from '../app/shared/constants/appconstants';
import { AppEnvironment } from './environment.model';

export const environment: AppEnvironment = {
  production: false,
  name: 'development',
  apiUrl: 'https://rti-ideas.dev.aws.alcon.net',
  oktaapiurl: 'https://rti-admin.dev.aws.alcon.net',
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
    clientId: '0oz1n4bdfdg9qkLhJs0z231',
    clientSecret: 'SDFBx_r2gNSPTVjbH6jl-T0lidfh0StZpOfsrFfXp4glywMk23gATWjBfwXROmPc',
    issuer: 'https://alcon.oktapreview.com',
    audience: '0oa2ngykartyujhmM0h8',
    authorizationEndpoint: 'https://alcon.oktapreview.com/oauth2/v1/authorize',
    tokenEndpoint: 'https://alcon.oktapreview.com/oauth2/v1/token',
    userinfoEndpoint: 'https://alcon.oktapreview.com/oauth2/v1/userinfo',
    // Use dev root as redirect URI (must match Okta exactly; Okta has root, not /callback). App handles code on root.
    redirectUri: 'https://rtinception.dev.aws.alcon.net/',
  }
};