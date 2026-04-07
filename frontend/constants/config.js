import { Platform } from 'react-native';

const ENV = {
  development: {
    apiUrl: 'http://localhost:5000',
  },
  production: {
    apiUrl: 'https://shrinkly-l9a2.onrender.com', // Update with your Render URL
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
export const APP_NAME = 'Shrinkly';
export const APP_TAGLINE = 'Shrink Your Links, Grow Your Reach';
export const ADSENSE_PUBLISHER_ID = ''; // Add your AdSense publisher ID

// OAuth redirect URIs
export const GOOGLE_OAUTH_URL = `${API_URL}/api/auth/google`;
export const MICROSOFT_OAUTH_URL = `${API_URL}/api/auth/microsoft`;

export default config;
