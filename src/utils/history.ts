import type { History } from 'history';

export function addQueryParam(history: History, key: string, value: string): string {
  const urlSearchParams = new URLSearchParams(history.location.search);

  urlSearchParams.set(key, value);

  const searchParams = urlSearchParams.toString();

  return `${history.location.pathname}${searchParams ? `?${searchParams}` : ''}`;
}

export function removeQueryParam(history: History, key: string): string {
  const urlSearchParams = new URLSearchParams(history.location.search);

  urlSearchParams.delete(key);

  const searchParams = urlSearchParams.toString();

  return `${history.location.pathname}${searchParams ? `?${searchParams}` : ''}`;
}
