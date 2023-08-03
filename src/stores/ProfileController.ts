import useService from '#src/hooks/useService';
import type { ProfilePayload, EnterProfilePayload, ProfileDetailsPayload } from '#types/account';

export const listProfiles = async () => {
  return await useService(async ({ profileService, sandbox }) => {
    return await profileService?.listProfiles(undefined, sandbox ?? true);
  });
};

export const createProfile = async ({ name, adult, avatar_url, pin }: ProfilePayload) => {
  return await useService(async ({ profileService, sandbox }) => {
    return await profileService?.createProfile({ name, adult, avatar_url, pin }, sandbox ?? true);
  });
};

export const updateProfile = async ({ id, name, adult, avatar_url, pin }: ProfilePayload) => {
  return await useService(async ({ profileService, sandbox }) => {
    return await profileService?.updateProfile({ id, name, adult, avatar_url, pin }, sandbox ?? true);
  });
};

export const enterProfile = async ({ id, pin }: EnterProfilePayload) => {
  return await useService(async ({ profileService, sandbox }) => {
    return await profileService?.enterProfile({ id, pin }, sandbox ?? true);
  });
};

export const deleteProfile = async ({ id }: ProfileDetailsPayload) => {
  return await useService(async ({ profileService, sandbox }) => {
    return await profileService?.deleteProfile({ id }, sandbox ?? true);
  });
};

export const getProfileDetails = async ({ id }: ProfileDetailsPayload) => {
  return await useService(async ({ profileService, sandbox }) => {
    return await profileService?.getProfileDetails({ id }, sandbox ?? true);
  });
};
