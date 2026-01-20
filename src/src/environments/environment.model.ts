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
}
 