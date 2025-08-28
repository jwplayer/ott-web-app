import type { Config } from '../../types/config';
import type { GetMediaParams } from '../../types/media';

export default abstract class EntitlementService {
  abstract getMediaToken(config: Config, mediaId: string, jwt?: string, params?: GetMediaParams, drmPolicyId?: string, accessType?: string): Promise<string>;
}
