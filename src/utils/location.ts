import type { Location } from 'react-router-dom';

export function addQueryParam(location: Location, key: string, value: string): string {
  const urlSearchParams = new URLSearchParams(location.search);

  urlSearchParams.set(key, value);

  const searchParams = urlSearchParams.toString();

  return `${location.pathname}${searchParams ? `?${searchParams}` : ''}`;
}

export function removeQueryParam(location: Location, key: string): string {
  const urlSearchParams = new URLSearchParams(location.search);

  urlSearchParams.delete(key);

  const searchParams = urlSearchParams.toString();

  return `${location.pathname}${searchParams ? `?${searchParams}` : ''}`;
}
