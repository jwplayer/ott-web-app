import { ConfigStore } from '../stores/ConfigStore';

export function getLoginUrl() {
  return getAwsUrl('login');
}

export function getSignUpUrl() {
  return getAwsUrl('signup');
}

function getAwsUrl(action: 'login' | 'signup') {
  const { host, clientId } = ConfigStore.getRawState().config.sso || {};

  if (!host || !clientId) {
    return '#';
  }

  return `${host}/${action}?client_id=${clientId}&response_type=code&redirect_uri=${window.location.origin}/sso/login`;
}
