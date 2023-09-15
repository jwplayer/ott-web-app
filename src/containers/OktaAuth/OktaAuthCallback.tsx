// CustomLoginCallback.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import InPlayer from '@inplayer-org/inplayer.js';
import { useOktaAuth } from '@okta/okta-react';

import { login, register } from '#src/stores/AccountController';
import LoadingOverlay from '#components/LoadingOverlay/LoadingOverlay';

const CustomLoginCallback: React.FC = () => {
  const { oktaAuth, authState } = useOktaAuth();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthencitaced] = useState<boolean>(false);

  useEffect(() => {
    setIsAuthencitaced(InPlayer.Account.isAuthenticated());
    const handleLoginRedirect = async () => {
      if (isAuthenticated) {
        return navigate('/okta/auth');
      }

      await oktaAuth.handleLoginRedirect();
      const userInfo = await oktaAuth.token.getUserInfo(authState?.accessToken);
      if (userInfo?.email) {
        try {
          await register(userInfo.email, 'OktaUser123!@#');
          // automatically authenticated after successful register
          navigate('/');
        } catch {
          // if account exists register will throw and we authenticate the user
          await login(userInfo?.email, 'OktaUser123!@#')
            .catch(() => navigate('/okta/auth'))
            .finally(() => {
              navigate('/');
            });
        }
      }
    };

    handleLoginRedirect();
  }, [oktaAuth, authState, navigate, isAuthenticated]);

  return <LoadingOverlay inline />;
};

export default CustomLoginCallback;
