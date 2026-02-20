export interface AppEnvironment {
  production: boolean;
  name: 'development' | 'qa' | 'production';
  apiUrl: string;
  oktaapiurl: string;
  x_api_key: string;
  okta_api_key: string;
  featureFlags: {
    newDashboard: boolean;
    enableBeta: boolean;
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    remoteEnabled: boolean;
  };
  okta: {
    clientId: string;
    clientSecret: string;
    issuer: string;
    audience: string;
    authorizationEndpoint: string;
    tokenEndpoint: string;
    userinfoEndpoint: string;
    redirectUri:string;
  };
}
