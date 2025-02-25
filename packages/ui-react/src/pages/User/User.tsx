import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Outlet } from 'react-router-dom';
import { shallow } from '@jwp/ott-common/src/utils/compare';
import { getModule } from '@jwp/ott-common/src/modules/container';
import { useAccountStore } from '@jwp/ott-common/src/stores/AccountStore';
import { useConfigStore } from '@jwp/ott-common/src/stores/ConfigStore';
import AccountController from '@jwp/ott-common/src/controllers/AccountController';
import { ACCESS_MODEL } from '@jwp/ott-common/src/constants';
import useBreakpoint, { Breakpoint } from '@jwp/ott-ui-react/src/hooks/useBreakpoint';
import AccountCircle from '@jwp/ott-theme/assets/icons/account_circle.svg?react';
import BalanceWallet from '@jwp/ott-theme/assets/icons/balance_wallet.svg?react';
import Exit from '@jwp/ott-theme/assets/icons/exit.svg?react';
import Favorite from '@jwp/ott-theme/assets/icons/favorite.svg?react';
import { RELATIVE_PATH_USER_ACCOUNT, RELATIVE_PATH_USER_FAVORITES, RELATIVE_PATH_USER_PAYMENTS } from '@jwp/ott-common/src/paths';

import Button from '../../components/Button/Button';
import LoadingOverlay from '../../components/LoadingOverlay/LoadingOverlay';
import Icon from '../../components/Icon/Icon';

import styles from './User.module.scss';

const User = (): JSX.Element => {
  const accountController = getModule(AccountController);

  const { accessModel, favoritesList } = useConfigStore(
    (s) => ({
      accessModel: s.accessModel,
      favoritesList: s.config.features?.favoritesList,
    }),
    shallow,
  );
  const navigate = useNavigate();
  const { t } = useTranslation('user');
  const breakpoint = useBreakpoint();

  const isLargeScreen = breakpoint > Breakpoint.md;
  const { user: customer, loading } = useAccountStore();

  const onLogout = useCallback(async () => {
    // Empty customer on a user page leads to navigate (code bellow), so we don't repeat it here
    await accountController.logout();
  }, [accountController]);

  useEffect(() => {
    if (!loading && !customer) {
      navigate('/', { replace: true });
    }
  }, [navigate, customer, loading]);

  if (!customer) {
    return (
      <div className={styles.user}>
        <LoadingOverlay inline />
      </div>
    );
  }

  return (
    <div className={styles.user}>
      {isLargeScreen && (
        <nav className={styles.leftColumn}>
          <div className={styles.panel}>
            <ul>
              <li>
                <Button
                  to={RELATIVE_PATH_USER_ACCOUNT}
                  label={t('nav.account')}
                  variant="text"
                  startIcon={<Icon icon={AccountCircle} />}
                  className={styles.button}
                />
              </li>

              {favoritesList && (
                <li>
                  <Button
                    to={RELATIVE_PATH_USER_FAVORITES}
                    label={t('nav.favorites')}
                    variant="text"
                    startIcon={<Icon icon={Favorite} />}
                    className={styles.button}
                  />
                </li>
              )}

              {accessModel !== ACCESS_MODEL.AVOD && (
                <li>
                  <Button
                    to={RELATIVE_PATH_USER_PAYMENTS}
                    label={t('nav.payments')}
                    variant="text"
                    startIcon={<Icon icon={BalanceWallet} />}
                    className={styles.button}
                  />
                </li>
              )}

              <li className={styles.logoutLi}>
                <Button onClick={onLogout} label={t('nav.logout')} variant="text" startIcon={<Icon icon={Exit} />} className={styles.button} />
              </li>
            </ul>
          </div>
        </nav>
      )}
      <div className={styles.mainColumn}>
        <Outlet />
      </div>
    </div>
  );
};

export default User;
