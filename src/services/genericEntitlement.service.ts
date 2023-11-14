import { injectable } from 'inversify';

import type { GetMediaParams } from '#types/media';

@injectable()
export default class GenericEntitlementService {
  private getToken = async <T>(url: string, body: unknown = {}, jwt?: string): Promise<T> => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: jwt ? `Bearer ${jwt}` : '',
      },
      body: JSON.stringify(body),
    });

    return (await response.json()) as T;
  };

  getMediaToken = async (host: string, id: string, jwt?: string, params?: GetMediaParams, drmPolicyId?: string) => {
    const data = await this.getToken<GetTokenResponse>(`${host}/media/${id}/sign${drmPolicyId ? `/drm/${drmPolicyId}` : ''}`, params, jwt);

    if (!data.entitled) throw new Error('Unauthorized');

    return data.token;
  };
}
