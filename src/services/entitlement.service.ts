import InPlayer from '@inplayer-org/inplayer.js';

import type { GetMediaParams } from '#types/media';

const getToken = async <T>(url: string, body: unknown = {}, jwt?: string): Promise<T> => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: jwt ? `Bearer ${jwt}` : '',
    },
    body: JSON.stringify(body),
  });

  return (await response.json()) as T;
};

export const getMediaToken = async (host: string, id: string, jwt?: string, params?: GetMediaParams, drmPolicyId?: string) => {
  const data = await getToken<GetTokenResponse>(`${host}/media/${id}/sign${drmPolicyId ? `/drm/${drmPolicyId}` : ''}`, params, jwt);

  if (!data.entitled) throw new Error('Unauthorized');

  return data.token;
};

export const getJWPMediaToken = async (configId: string = '', mediaId: string) => {
  try {
    const { data } = await InPlayer.Asset.getSignedMediaToken(configId, mediaId);
    return data.token;
  } catch {
    throw new Error('Unauthorized');
  }
};
