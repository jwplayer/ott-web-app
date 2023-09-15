import { useOktaAuth } from '@okta/okta-react';

import styles from './Okta.module.scss';

import Button from '#components/Button/Button';
import { logout } from '#src/stores/AccountController';
import LoadingOverlay from '#components/LoadingOverlay/LoadingOverlay';

const OktaAuth = () => {
  const { oktaAuth, authState } = useOktaAuth();

  const loginUser = async () => oktaAuth.signInWithRedirect();
  const logoutUser = async () => {
    await logout();
    await oktaAuth.signOut();
  };

  if (!authState) {
    return <LoadingOverlay inline />;
  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.authFrame}>
        <div className={styles.logoWrapper}>
          <img src="https://ottwebapp.web.app/images/logo.png" alt="Okta Logo" className={styles.authLogo} />
          <img src="https://www.okta.com/sites/default/files/media/image/2023-03/Okta_Wordmark_White_S.png" alt="Okta Logo" className={styles.authLogo} />
        </div>
        {authState.isAuthenticated ? (
          <>
            <p>Authenticated with Okta</p>
            <p>Are you sure you want to proceed?</p>
            <Button type="button" variant="contained" color="primary" size="large" label="Yes, Logout" onClick={logoutUser} />
          </>
        ) : (
          <>
            <p>Authenticate with Okta?</p>
            <Button type="button" variant="contained" color="primary" size="large" label="Yes, Proceed" onClick={loginUser} />
          </>
        )}
      </div>
    </div>
  );
};

export default OktaAuth;
