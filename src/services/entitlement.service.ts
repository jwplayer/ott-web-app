import type { GetMediaParams } from '#types/media';
import type { GetPlaylistParams } from '#types/playlist';

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

export const getPublicToken = async (
  host: string,
  type: EntitlementType,
  id: string,
  jwt?: string,
  params?: GetMediaParams | GetPlaylistParams,
  drmPolicyId?: string,
) => {
  const data = await getToken<GetTokenResponse>(`${host}/${type}/${id}/sign_public${drmPolicyId ? `/drm/${drmPolicyId}` : ''}`, params, jwt);

  if (!data.entitled) throw new Error('Unauthorized');

  return data.token;
};
