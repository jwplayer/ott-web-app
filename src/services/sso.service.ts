import { ConfigStore } from '../stores/ConfigStore';
import { AccountStore } from '../stores/AccountStore';
import { addQueryParams } from '../utils/formatting';

export interface State {
  returnUrl: string;
}

export function getLoginUrl() {
  return getAwsUrl('oauth2/authorize');
}

export function getSignUpUrl() {
  return getAwsUrl('signup');
}

export function getLogoutUrl() {
  return getAwsUrl('logout');
}

function getAwsUrl(action: 'login' | 'signup' | 'oauth2/authorize' | 'logout') {
  const { host, clientId } = ConfigStore.getRawState().config.sso || {};

  if (!host || !clientId) {
    // Trying to use the code endpoint without sso setup, in prod just redirect to root
    // @ts-ignore
    if (typeof NODE_ENV_COMPILE_CONST === 'undefined' || NODE_ENV_COMPILE_CONST !== 'production') {
      throw 'URL requested without sso setup';
    }

    return '#';
  }

  const state: State = {
    returnUrl: window.location.pathname + window.location.search,
  };

  const redirectParam = action === 'logout' ? 'logout_uri' : 'redirect_uri';
  const redirectUrl = action === 'logout' ? '/sso/logout' : '/sso/login';

  const stateEncoded = encodeURIComponent(window.btoa(JSON.stringify(state)));
  const stateParam = action === 'logout' ? '' : `&state=${stateEncoded}`;

  return `${host}/${action}?client_id=${clientId}&response_type=code&${redirectParam}=${window.location.origin}${redirectUrl}${stateParam}`;
}

export async function exchangeCode(code: string) {
  const { host, clientId } = ConfigStore.getRawState().config.sso || {};

  if (!host || !clientId) {
    // Trying to use the code endpoint without sso setup, in prod just redirect to root
    // @ts-ignore
    if (typeof NODE_ENV_COMPILE_CONST === 'undefined' || NODE_ENV_COMPILE_CONST !== 'production') {
      throw 'Code endpoint accessed without sso setup';
    }

    return undefined;
  }

  const response = await fetch(`${host}/oauth2/token`, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      Accept: 'application/json',
    },
    body: `grant_type=authorization_code&code=${code}&client_id=${clientId}&redirect_uri=${window.location.origin}/sso/login`,
  });

  if (response.ok) {
    const responseData = await response.json();

    const userData = JSON.parse(window.atob(responseData.id_token.split('.')[1]));

    return {
      accessToken: responseData.access_token,
      id_token: responseData.id_token,
      userData: userData,
    };
  }

  // @ts-ignore
  if (typeof NODE_ENV_COMPILE_CONST === 'undefined' || NODE_ENV_COMPILE_CONST !== 'production') {
    throw 'Error exchanging code: ' + response;
  }

  return undefined;
}

export function signUrl(url: string, page_limit?: number, related_media_id?: string) {
  const { sso, siteId } = ConfigStore.getRawState().config;
  const token = AccountStore.getRawState().accessToken || '';

  if (!sso || !siteId) {
    return url;
  }

  return addQueryParams(`${sso?.signingService}/v1/signed?site_id=${siteId}&token=${token}&resource=${url}`, {
    page_limit: page_limit?.toString(),
    related_media_id,
  });
}
