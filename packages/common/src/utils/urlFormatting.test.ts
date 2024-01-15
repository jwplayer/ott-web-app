import { createURL } from './urlFormatting';

describe('createUrl', () => {
  test('valid url from a path, query params', async () => {
    const url = createURL('/test', { foo: 'bar' });

    expect(url).toEqual('/test?foo=bar');
  });
  test('valid url from a path including params, query params', async () => {
    const url = createURL('/test?existing-param=1', { foo: 'bar' });

    expect(url).toEqual('/test?existing-param=1&foo=bar');
  });

  test('valid url from a path including params, removing one with a query param', async () => {
    const url = createURL('/test?existing-param=1', { [`existing-param`]: null });

    expect(url).toEqual('/test');
  });
  test('valid redirect url from a location including params, query params', async () => {
    const url = createURL('https://app-preview.jwplayer.com/?existing-param=1&foo=bar', { u: 'payment-method-success' });

    expect(url).toEqual('https://app-preview.jwplayer.com/?existing-param=1&foo=bar&u=payment-method-success');
  });
});
