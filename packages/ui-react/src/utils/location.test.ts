import type { Location } from 'react-router-dom';

import { createURLFromLocation, modalURLFromLocation } from './location';

describe('url from location', () => {
  test('valid url from a location', async () => {
    const location: Location = {
      pathname: '/test',
      search: '',
      hash: '',
      state: null,
      key: '',
    };
    const url = createURLFromLocation(location);

    expect(url).toEqual('/test');
  });
  test('valid url from a location with search query', async () => {
    const location: Location = {
      pathname: '/test',
      search: '?test-param=1',
      hash: '',
      state: null,
      key: '',
    };
    const url = createURLFromLocation(location);

    expect(url).toEqual('/test?test-param=1');
  });
  test('valid url from a location with query params', async () => {
    const location: Location = {
      pathname: '/test',
      search: '?test-param=1',
      hash: '',
      state: null,
      key: '',
    };
    const url = createURLFromLocation(location, { foo: 'bar' });

    expect(url).toEqual('/test?test-param=1&foo=bar');
  });
  test('valid url from a location with search query and query params', async () => {
    const location: Location = {
      pathname: '/test',
      search: '?test-param=1',
      hash: '',
      state: null,
      key: '',
    };
    const url = createURLFromLocation(location, { foo: 'bar' });

    expect(url).toEqual('/test?test-param=1&foo=bar');
  });
  test('valid url from a location with search query and a query param that clears the saarch param', async () => {
    const location: Location = {
      pathname: '/test',
      search: '?test-param=1',
      hash: '',
      state: null,
      key: '',
    };
    const url = createURLFromLocation(location, { 'test-param': null });

    expect(url).toEqual('/test');
  });
});

describe('modal urls from location', () => {
  test('valid modal url from a location', async () => {
    const location: Location = {
      pathname: '/test',
      search: '',
      hash: '',
      state: null,
      key: '',
    };
    const url = modalURLFromLocation(location, 'login');

    expect(url).toEqual('/test?u=login');
  });
  test('valid modal url from a location with search query', async () => {
    const location: Location = {
      pathname: '/test',
      search: '?test-param=1',
      hash: '',
      state: null,
      key: '',
    };
    const url = modalURLFromLocation(location, 'login');

    expect(url).toEqual('/test?test-param=1&u=login');
  });
  test('valid modal url from a location with query params', async () => {
    const location: Location = {
      pathname: '/test',
      search: '',
      hash: '',
      state: null,
      key: '',
    };
    const url = modalURLFromLocation(location, 'login', { foo: 'bar' });

    expect(url).toEqual('/test?u=login&foo=bar');
  });

  test('valid modal url from a location with a search query and query params', async () => {
    const location: Location = {
      pathname: '/test',
      search: '?test-param=1',
      hash: '',
      state: null,
      key: '',
    };
    const url = modalURLFromLocation(location, 'login', { foo: 'bar' });

    expect(url).toEqual('/test?test-param=1&u=login&foo=bar');
  });
});
