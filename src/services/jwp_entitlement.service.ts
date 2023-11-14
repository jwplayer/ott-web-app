import InPlayer from '@inplayer-org/inplayer.js';
import { injectable } from 'inversify';

@injectable()
export default class JWPEntitlementService {
  getJWPMediaToken = async (configId: string = '', mediaId: string) => {
    try {
      const { data } = await InPlayer.Asset.getSignedMediaToken(configId, mediaId);
      return data.token;
    } catch {
      throw new Error('Unauthorized');
    }
  };
}
