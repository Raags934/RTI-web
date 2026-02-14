export interface AppEnvironment {
    production: boolean;
    name: 'development' | 'qa' | 'production';
    apiUrl: string;
    x_api_key: string;
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
      /** When set and app runs on localhost, use this as redirect_uri so Okta accepts (e.g. dev URL already in Okta). For local testing only. */
      redirectUri?: string;
    };
}
 