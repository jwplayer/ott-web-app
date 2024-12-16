import { injectable } from 'inversify';

import type { Config } from '../../../types/config';
import type { GetMediaParams } from '../../../types/media';
import type { GetTokenResponse } from '../../../types/entitlement';
import EntitlementService from '../EntitlementService';

@injectable()
export default class GenericEntitlementService extends EntitlementService {
  private host!: string;

  protected getToken = async <T>(url: string, body: unknown = {}): Promise<T> => {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
    });

    return (await response.json()) as T;
  };

  setHost = (host: string) => {
    this.host = host;
  };

  getMediaToken = async (config: Config, id: string, jwt?: string, params: GetMediaParams = {}, drmPolicyId?: string) => {
    const provider = config.integrations.jwp?.clientId ? 'jwp' : config.integrations.cleeng?.id ? 'cleeng' : '';

    const data = await this.getToken<GetTokenResponse>(this.host, {
      provider,
      credentials: {
        token: jwt || '',
      },
      asset: {
        id,
        drmPolicyId,
        params,
      },
    });

    if (!data.entitled) throw new Error('Unauthorized');

    return data.token;
  };
}
