import { describe, it, expect } from 'vitest';

import { PassportService } from '../../src/services/passport-service.js';

describe('PassportService generateSignedUrl test', () => {
  const service = new PassportService();

  it('should generate a signed URL with the correct token', async () => {
    const path = '/path/to/resource';
    const clientHost = 'https://example.com';

    const result = await service.generateSignedUrl(path, clientHost);

    // Parse the result URL to extract the token
    const url = new URL(result);
    const token = url.searchParams.get('token');

    expect(result).toBe(`${clientHost}${path}?token=${token}`);
  });
});
