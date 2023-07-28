import cleengAuthService from '#src/services/cleeng.auth.service';

export const getBaseUrl = (sandbox: boolean) => (sandbox ? 'https://mediastore-sandbox.cleeng.com' : 'https://mediastore.cleeng.com');

type RequestOptions = { authenticate?: boolean; keepalive?: boolean };

export const performRequest = async (sandbox: boolean, path: string = '/', method = 'GET', body?: string, options: RequestOptions = {}) => {
  try {
    const token = options.authenticate ? await cleengAuthService.getAccessTokenOrThrow() : undefined;

    const resp = await fetch(`${getBaseUrl(sandbox)}${path}`, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      keepalive: options.keepalive,
      method,
      body,
    });

    return await resp.json();
  } catch (error: unknown) {
    return {
      errors: Array.of(error as string),
    };
  }
};

export const get = (sandbox: boolean, path: string, options?: RequestOptions) => performRequest(sandbox, path, 'GET', undefined, options);
export const patch = (sandbox: boolean, path: string, body?: string, options?: RequestOptions) => performRequest(sandbox, path, 'PATCH', body, options);
export const put = (sandbox: boolean, path: string, body?: string, options?: RequestOptions) => performRequest(sandbox, path, 'PUT', body, options);
export const post = (sandbox: boolean, path: string, body?: string, options?: RequestOptions) => performRequest(sandbox, path, 'POST', body, options);
export const remove = (sandbox: boolean, path: string, options?: RequestOptions) => performRequest(sandbox, path, 'DELETE', undefined, options);
