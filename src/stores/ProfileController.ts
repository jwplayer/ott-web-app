import type { ProfilesData } from '@inplayer-org/inplayer.js';

import { useAccountStore } from './AccountStore';
import { useFavoritesStore } from './FavoritesStore';
import { useProfileStore } from './ProfileStore';
import { useWatchHistoryStore } from './WatchHistoryStore';
import { loadUserData } from './AccountController';

import * as persist from '#src/utils/persist';
import type { ProfilePayload, EnterProfilePayload, ProfileDetailsPayload } from '#types/account';
import useService from '#src/hooks/useService';

const PERSIST_PROFILE = 'profile';

export const unpersistProfile = () => {
  persist.removeItem(PERSIST_PROFILE);
};

export const persistProfile = ({ profile }: { profile: ProfilesData }) => {
  persist.setItem(PERSIST_PROFILE, profile);
  persist.setItemStorage('inplayer_token', {
    expires: profile.credentials.expires,
    token: profile.credentials.access_token,
    refreshToken: '',
  });
};

export const isValidProfile = (profile: unknown): profile is ProfilesData => {
  return (
    typeof profile === 'object' &&
    profile !== null &&
    'id' in profile &&
    'name' in profile &&
    'avatar_url' in profile &&
    'adult' in profile &&
    'credentials' in profile
  );
};

export const loadPersistedProfile = () => {
  const profile = persist.getItem(PERSIST_PROFILE);
  if (isValidProfile(profile)) {
    useProfileStore.getState().setProfile(profile);
    return profile;
  }
  useProfileStore.getState().setProfile(null);
  return null;
};

export const initializeProfile = async ({ profile }: { profile: ProfilesData }) => {
  persistProfile({ profile });
  useFavoritesStore.setState({ favorites: [] });
  useWatchHistoryStore.setState({ watchHistory: [] });
  useProfileStore.getState().setProfile(profile);

  await loadUserData();

  return profile;
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
    if (!profile) {
      throw new Error('Unable to enter profile');
    }
    await initializeProfile({ profile });
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
