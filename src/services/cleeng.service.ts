export const getBaseUrl = (sandbox: boolean) => (sandbox ? 'https://mediastore-sandbox.cleeng.com' : 'https://mediastore.cleeng.com');

export const performRequest = async (sandbox: boolean, path: string = '/', method = 'GET', body?: string, jwt?: string) => {
  try {
    const resp = await fetch(`${getBaseUrl(sandbox)}${path}`, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: jwt ? `Bearer ${jwt}` : '',
      },
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

export const get = (sandbox: boolean, path: string, jwt?: string) => performRequest(sandbox, path, 'GET', undefined, jwt);
export const patch = (sandbox: boolean, path: string, body?: string, jwt?: string) => performRequest(sandbox, path, 'PATCH', body, jwt);
export const put = (sandbox: boolean, path: string, body?: string, jwt?: string) => performRequest(sandbox, path, 'PUT', body, jwt);
export const post = (sandbox: boolean, path: string, body?: string, jwt?: string) => performRequest(sandbox, path, 'POST', body, jwt);
