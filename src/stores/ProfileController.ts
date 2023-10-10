import { useFavoritesStore } from './FavoritesStore';
import { useProfileStore } from './ProfileStore';
import { useWatchHistoryStore } from './WatchHistoryStore';
import { initializeAccount } from './AccountController';
import { useAccountStore } from './AccountStore';

import * as persist from '#src/utils/persist';
import type { ProfilePayload, EnterProfilePayload, ProfileDetailsPayload } from '#types/account';
import useService from '#src/hooks/useService';

const PERSIST_PROFILE = 'profile';

export const unpersistProfile = () => {
  persist.removeItem(PERSIST_PROFILE);
};

export const listProfiles = async () => {
  return await useService(async ({ profileService, sandbox }) => {
    const res = await profileService?.listProfiles(undefined, sandbox ?? true);
    const canManageProfiles = useAccountStore.getState().canManageProfiles;
    if (!canManageProfiles && res?.responseData.canManageProfiles) {
      useAccountStore.setState({ canManageProfiles: true });
    }
    return res;
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
    const response = await profileService?.enterProfile({ id, pin }, sandbox ?? true);
    const profile = response?.responseData;
    if (profile?.credentials?.access_token) {
      persist.setItem(PERSIST_PROFILE, profile);
      persist.setItemStorage('inplayer_token', {
        expires: profile.credentials.expires,
        token: profile.credentials.access_token,
        refreshToken: '',
      });
      useFavoritesStore.setState({ favorites: [] });
      useWatchHistoryStore.setState({ watchHistory: [] });
      useProfileStore.getState().setProfile(profile);
    }
    return initializeAccount();
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
