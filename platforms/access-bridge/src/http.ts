/**
 * Performs a GET request using fetch with optional authentication token.
 * @param url The URL to fetch.
 * @param token Optional authentication token for authorization header.
 * @returns A promise that resolves to the parsed JSON response.
 */
export async function get<T>(url: string, token?: string): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = token;
  }

  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  return await handleResponse(response);
}

/**
 * Performs a POST request using fetch with JSON body and optional authentication token.
 * @param url The URL to fetch.
 * @param body The JSON body to send in the POST request.
 * @param token Optional authentication token for authorization header.
 * @returns A promise that resolves to the parsed JSON response.
 */
export async function post<T, U>(url: string, body: U, token?: string): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = token;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  return await handleResponse(response);
}

/**
 * Performs a PUT request using fetch with JSON body and optional authentication token.
 * @param url The URL to fetch.
 * @param body The JSON body to send in the PUT request.
 * @param token Optional authentication token for authorization header.
 * @returns A promise that resolves to the parsed JSON response.
 */
export async function put<T, U>(url: string, body: U, token?: string): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = token;
  }

  const response = await fetch(url, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  });

  return await handleResponse(response);
}

// Handles the response from a fetch request, throwing an error if the response is not ok.
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (error) {
      // If parsing JSON fails, throw with status text
      throw new Error(`${response.status}, ${response.statusText}`);
    }

    // Throw the original error data as-is
    throw errorData;
  }

  // If response is ok, return the parsed JSON content
  return response.json();
}
