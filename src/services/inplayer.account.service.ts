import InPlayer from '@inplayer-org/inplayer.js';

import type { Login } from '#types/account';
import { processInplayerAccount, processInPlayerAuth } from '#src/utils/common';

export const login: Login = async ({ config, email, password }) => {
  const { data } = await InPlayer.Account.signInV2({
    email,
    password,
    clientId: config.integrations.inplayer?.clientId || '',
    referrer: window.location.href,
  });

  return {
    auth: processInPlayerAuth(data),
    user: processInplayerAccount(data.account),
  };
};
