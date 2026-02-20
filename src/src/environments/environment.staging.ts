import { API_KEY } from '../app/shared/constants/appconstants';
import { AppEnvironment } from './environment.model';

export const environment: AppEnvironment = {
  production: false,
  name: 'qa',
  apiUrl: 'https://qa.api.myapp.com',
  oktaapiurl: 'https://rti-admin.dev.aws.alcon.net',
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
