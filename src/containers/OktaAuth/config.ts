import { OktaAuth } from '@okta/okta-auth-js';

const oktaConfig = {
  clientId: '0oab75w004jcsArJf5d7',
  issuer: 'https://dev-70883055.okta.com/oauth2/default',
  redirectUri: window.location.origin + '/okta/auth/callback?app-config=a2kbjdv0',
  post_logout_url: 'http://localhost:8080/',
};

export const oktaAuth = new OktaAuth(oktaConfig);
