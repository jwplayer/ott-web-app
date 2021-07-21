import type { History } from 'history';

export function addQueryParam(history: History, key: string, value: string, method: 'replace' | 'push' = 'push') {
  const urlSearchParams = new URLSearchParams(history.location.search);

  urlSearchParams.set(key, value);

  history[method]({ pathname: history.location.pathname, search: urlSearchParams.toString() });
}

export function removeQueryParam(history: History, key: string, method: 'replace' | 'push' = 'push') {
  const urlSearchParams = new URLSearchParams(history.location.search);

  urlSearchParams.delete(key);

  history[method]({ pathname: history.location.pathname, search: urlSearchParams.toString() });
}
