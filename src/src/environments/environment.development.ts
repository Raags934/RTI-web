import { AppEnvironment } from './environment.model';

export const environment: AppEnvironment = {
  production: false,
  name: 'development',
  apiUrl: 'https://rti-ideas.dev.aws.alcon.net',
  x_api_key: '9C4Ql8F6GeREMxQXdLu1abcFgETpC6J1kg4AXHIc',
  featureFlags: {
    newDashboard: true,
    enableBeta: true
  },
  logging: {
    level: 'debug',
    remoteEnabled: false
  },
  okta: {
    clientId: '0oa3n4cdfdsfsdqkLhJs0h9',
    clientSecret: 'FNQAx_r4gNPPTVjbH6jl-H7liria9StZpOhfdsfsdf4glyfMk62gATWjBfwXROmPc',
    issuer: 'https://alcon.oktapreview.com',
    audience: '3oa1n2ccmg1dfdsfd8h8',
    authorizationEndpoint: 'https://alcon.oktapreview.com/oauth2/v1/authorize',
    tokenEndpoint: 'https://alcon.oktapreview.com/oauth2/v1/token',
    userinfoEndpoint: 'https://alcon.oktapreview.com/oauth2/v1/userinfo',
    // Use dev root as redirect URI (must match Okta exactly; Okta has root, not /callback). App handles code on root.
    redirectUri: 'https://rtinception.dev.aws.alcon.net'
  }
};
