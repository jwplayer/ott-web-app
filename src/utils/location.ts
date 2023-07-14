import type { Location } from 'react-router-dom';

/**
 * Adds a query parameter to the current location
 **/
export function addQueryParam(location: Location, key: string, value: string): string {
  const urlSearchParams = new URLSearchParams(location.search);

  urlSearchParams.set(key, value);

  const searchParams = urlSearchParams.toString();

  return `${location.pathname}${searchParams ? `?${searchParams}` : ''}`;
}

/**
 * Replaces query parameter in the current location
 **/
export function replaceQueryParam(location: Location, key: string, value: string): string {
  const urlSearchParams = new URLSearchParams();

  urlSearchParams.set(key, value);

  const searchParams = urlSearchParams.toString();

  return `${location.pathname}?${searchParams}`;
}

/**
 * Removes a query parameter from the current location
 **/
export function removeQueryParam(location: Location, key: string): string {
  const urlSearchParams = new URLSearchParams(location.search);

  urlSearchParams.delete(key);

  const searchParams = urlSearchParams.toString();

  return `${location.pathname}${searchParams ? `?${searchParams}` : ''}`;
}

/**
 * Removes multiple query parameters from the current location
 * @param {Location} location
 * @param {string[]} keys
 * @returns {string}
 * @example
 * const location = {
 *  pathname: '/search',
 *  search: '?q=react&sort=desc'
 * }
 * const keys = ['q', 'sort']
 * removeQueryParams(location, keys)
 * // => '/search'
 *
 **/
export function removeMultipleQueryParams(location: Location, keys: string[]): string {
  const urlSearchParams = new URLSearchParams(location.search);
  keys.forEach((key) => urlSearchParams.delete(key));
  const searchParams = urlSearchParams.toString();

  return `${location.pathname}${searchParams ? `?${searchParams}` : ''}`;
}
