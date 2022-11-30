import InPlayer from '@inplayer-org/inplayer.js';

import { useConfigStore } from '../ConfigStore';
import { useAccountStore } from '../AccountStore';

import * as persist from '#src/utils/persist';
import type { AuthData } from '#types/account';
import { processInplayerAccount, processInPlayerAuth } from '#src/utils/common';

const PERSIST_KEY_ACCOUNT = 'auth';
let subscription: undefined | (() => void);

export const initializeInPlayerAccount = async () => {
  try {
    const { clientId } = useConfigStore.getState().getInPlayerData();

    if (!clientId) {
      useAccountStore.getState().setLoading(false);
      return;
    }

    const storedSession: AuthData | null = persist.getItem(PERSIST_KEY_ACCOUNT) as AuthData | null;

    // clear previous subscribe (for dev environment only)
    if (subscription) {
      subscription();
    }
    subscription = useAccountStore.subscribe(
      (state) => state.auth,
      (authData) => {
        if (authData) {
          persist.setItem(PERSIST_KEY_ACCOUNT, authData);
        }
      },
    );

    if (storedSession) {
      const { data } = await InPlayer.Account.getAccountInfo();

      useAccountStore.setState({
        auth: storedSession,
        user: processInplayerAccount(data),
      });
    }

    useAccountStore.setState({ loading: false });
  } catch {
    await inPlayerLogout();
  }
};

export const inplayerLogin = async (email: string, password: string) => {
  const { clientId } = useConfigStore.getState().getInPlayerData();

  useAccountStore.setState({ loading: true });

  const { data } = await InPlayer.Account.signInV2({
    email,
    password,
    clientId: clientId || '',
    referrer: window.location.href,
  });

  if (data) {
    useAccountStore.setState({
      auth: processInPlayerAuth(data),
      user: processInplayerAccount(data.account),
      loading: false,
    });
  }
};

export const inPlayerLogout = async () => {
  await InPlayer.Account.signOut();

  persist.removeItem(PERSIST_KEY_ACCOUNT);
  useAccountStore.setState({
    auth: null,
    user: null,
  });
};
