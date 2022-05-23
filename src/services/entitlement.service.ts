const getToken = async (url: string, params: Record<string, unknown> = {}, jwt?: string) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: jwt ? `Bearer ${jwt}` : '',
    },
    body: JSON.stringify(params),
  });

  const data = (await response.json()) as EntitlementResponse;

  if (!data.entitled) throw new Error('Unauthorized');

  return data.token;
};

export const getMediaToken = (host: string, id: string, jwt?: string, params = {}, drmPolicyId?: string) => {
  return getToken(`${host}/media/${id}/sign${drmPolicyId ? `/drm/${drmPolicyId}` : ''}`, params, jwt);
};

export const getPublicToken = (host: string, type: EntitlementType, id: string, jwt?: string, params = {}, drmPolicyId?: string) => {
  return getToken(`${host}/${type}/${id}/sign_public${drmPolicyId ? `/drm/${drmPolicyId}` : ''}`, params, jwt);
};
