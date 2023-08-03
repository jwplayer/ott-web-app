import { useMutation, useQuery } from 'react-query';

import { enterProfile, initializeAccount, listProfiles } from '#src/stores/AccountController';
import { useAccountStore } from '#src/stores/AccountStore';
import { useFavoritesStore } from '#src/stores/FavoritesStore';
import { useWatchHistoryStore } from '#src/stores/WatchHistoryStore';
import * as persist from '#src/utils/persist';
import type { AuthData } from '#types/account';
import { useConfigStore } from '#src/stores/ConfigStore';

const PERSIST_KEY_ACCOUNT = 'auth';
const PERSIST_PROFILE = 'profile';

type ProfileSelectionPayload = {
  id: string;
  navigate: (path: string) => void;
  selectingProfileAvatarUrl?: string;
};

export const unpersistProfile = () => {
  persist.removeItem(PERSIST_PROFILE);
  persist.removeItem(PERSIST_KEY_ACCOUNT);
};

const handleProfileSelection = async ({ id, navigate, selectingProfileAvatarUrl = '' }: ProfileSelectionPayload) => {
  try {
    useAccountStore.setState({ selectingProfileAvatar: selectingProfileAvatarUrl, profile: null });
    const response = await enterProfile({ id });
    const profile = response?.responseData;

    if (profile?.credentials?.access_token) {
      const authData: AuthData = {
        jwt: profile.credentials.access_token,
        refreshToken: '',
      };
      persist.setItem(PERSIST_KEY_ACCOUNT, authData);
      persist.setItem(PERSIST_PROFILE, profile);
      persist.setItemStorage('inplayer_token', {
        expires: profile.credentials.expires,
        token: profile.credentials.access_token,
        refreshToken: '',
      });
      useFavoritesStore.setState({ favorites: [] });
      useWatchHistoryStore.setState({ watchHistory: [] });
      await initializeAccount().finally(() => {
        navigate('/');
      });
    }
  } catch {
    throw new Error('Unable to enter profile.');
  } finally {
    useAccountStore.setState({ selectingProfileAvatar: null });
  }
};

export const useSelectProfile = () => useMutation(handleProfileSelection);

export const useListProfiles = () => useQuery(['listProfiles'], listProfiles);

export const useProfilesFeatureEnabled = (): boolean => {
  const canManageProfiles = useAccountStore((s) => s.canManageProfiles);
  const profilesFeatureEnabled = useConfigStore((s) => s.config.custom?.profilesFeatureEnabled);
  return canManageProfiles && !!profilesFeatureEnabled;
};
