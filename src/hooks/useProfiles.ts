import { useMutation, useQuery } from 'react-query';

import { enterProfile, getAccount, initializeAccount, listProfiles } from '#src/stores/AccountController';
import { useAccountStore } from '#src/stores/AccountStore';
import { useFavoritesStore } from '#src/stores/FavoritesStore';
import { useWatchHistoryStore } from '#src/stores/WatchHistoryStore';
import * as persist from '#src/utils/persist';
import type { AuthData } from '#types/account';

const PERSIST_KEY_ACCOUNT = 'auth';
const PERSIST_PROFILE = 'profile';

type ProfileSelectionPayload = {
  id: string;
  navigate: (path: string) => void;
};

const handleProfileSelection = async ({ id, navigate }: ProfileSelectionPayload) => {
  try {
    useAccountStore.setState({ loading: true });
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
  }
};

export const useSelectProfile = () =>
  useMutation(handleProfileSelection, {
    onSettled: () => {
      getAccount();
    },
  });

export const useListProfiles = () => useQuery(['listProfiles'], listProfiles);
