import { Platform } from 'react-native';

const ENV = {
  development: {
    apiUrl: 'http://localhost:5000',
  },
  production: {
    apiUrl: 'https://api.shrinqe.com',
  },
};

const getEnvVars = () => {
  if (__DEV__) {
    return ENV.development;
  }
  return ENV.production;
};

const config = getEnvVars();

export const API_URL = config.apiUrl;
export const APP_NAME = 'ShrinQE';
export const APP_TAGLINE = 'Shrink Your Links, Grow Your Reach';

// OAuth redirect URIs
export const GOOGLE_OAUTH_URL = `${API_URL}/api/auth/google`;

export default config;
