import React, { createContext, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router';

import { exchangeCode, State } from '../services/sso.service';
import LoadingOverlay from '../components/LoadingOverlay/LoadingOverlay';
import { AccountStore } from '../stores/AccountStore';
import type { Customer } from '../../types/account';

export const IdentityContext = createContext<IdentityContext>({});

interface IdentityContext {
  accessToken?: string;
  user?: Customer;
}

export default function IdentityProvider({ children }: { children: JSX.Element }): JSX.Element {
  const location = useLocation();
  const history = useHistory();

  const [state, setState] = useState<IdentityContext>({});

  const isSsoLoginPath = location.pathname === '/sso/login';
  const isSsoLogoutPath = location.pathname === '/sso/logout';

  if (isSsoLogoutPath) {
    AccountStore.update((s) => {
      s.user = null;
    });

    history.push('/');
  }

  useEffect(() => {
    if (isSsoLoginPath) {
      if (!tryAuthenticateWithCode()) {
        // Invalid code request, redirect to root
        history.push('/');
      }
    }
    // We only want this to run on location changes, so the other dependencies don't matter
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSsoLoginPath]);

  // Don't render UI during code exchange (this is essentially a non-ui endpoint)
  if (isSsoLoginPath || isSsoLogoutPath) {
    return <LoadingOverlay />;
  }

  return <IdentityContext.Provider value={state}>{children}</IdentityContext.Provider>;

  function tryAuthenticateWithCode() {
    const queries = Object.fromEntries(
      location.search
        .replace('?', '')
        .split('&')
        .map((s) => s.split('=')),
    );

    if (!queries.code) {
      // Trying to use the code endpoint without sso setup, in prod just redirect to root
      // @ts-ignore
      if (typeof NODE_ENV_COMPILE_CONST === 'undefined' || NODE_ENV_COMPILE_CONST !== 'production') {
        throw 'Code endpoint called but missing code query param';
      }

      return false;
    }

    exchangeCode(queries.code).then((data) => {
      if (!data) {
        history.push('/');
        return;
      }
      setState({
        accessToken: data.accessToken,
        user: {
          id: 0,
          externalId: data.userData['cognito:username'],
          email: data.userData.email,
          country: '',
          regDate: '',
          lastUserIp: '',
        },
      });
      AccountStore.update((s) => {
        s.user = {
          id: 0,
          externalId: data.userData['cognito:username'],
          email: data.userData.email,
          country: '',
          regDate: '',
          lastUserIp: '',
        };
        s.accessToken = data.accessToken;
      });

      const state = JSON.parse(window.atob(decodeURIComponent(queries.state || ''))) as State;
      history.push(state.returnUrl || '/');
    });

    return true;
  }
}
