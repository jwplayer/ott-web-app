import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { shallow } from '@jwp/ott-common/src/utils/compare';
import { getModule } from '@jwp/ott-common/src/modules/container';
import { useAccountStore } from '@jwp/ott-common/src/stores/AccountStore';
import { useConfigStore } from '@jwp/ott-common/src/stores/ConfigStore';
import FavoritesController from '@jwp/ott-common/src/stores/FavoritesController';
import AccountController from '@jwp/ott-common/src/stores/AccountController';
import CheckoutController from '@jwp/ott-common/src/stores/CheckoutController';
import { useProfileStore } from '@jwp/ott-common/src/stores/ProfileStore';
import { ACCESS_MODEL, PersonalShelf } from '@jwp/ott-common/src/constants';
import useBreakpoint, { Breakpoint } from '@jwp/ott-ui-react/src/hooks/useBreakpoint';
import { useProfiles } from '@jwp/ott-hooks-react/src/useProfiles';

import AccountCircle from '../../icons/AccountCircle';
import BalanceWallet from '../../icons/BalanceWallet';
import Exit from '../../icons/Exit';
import Favorite from '../../icons/Favorite';
import AccountComponent from '../../components/Account/Account';
import Button from '../../components/Button/Button';
import ConfirmationDialog from '../../components/ConfirmationDialog/ConfirmationDialog';
import Favorites from '../../components/Favorites/Favorites';
import LoadingOverlay from '../../components/LoadingOverlay/LoadingOverlay';
import PaymentContainer from '../../containers/PaymentContainer/PaymentContainer';
import PlaylistContainer from '../../containers/PlaylistContainer/PlaylistContainer';
import EditProfile from '../../containers/Profiles/EditProfile';

import styles from './User.module.scss';

const User = (): JSX.Element => {
  const favoritesController = getModule(FavoritesController);
  const accountController = getModule(AccountController);
  const checkoutController = getModule(CheckoutController);

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
  const [clearFavoritesOpen, setClearFavoritesOpen] = useState(false);
  const location = useLocation();

  const isLargeScreen = breakpoint > Breakpoint.md;
  const { user: customer, subscription, loading } = useAccountStore();
  const { canUpdateEmail, canRenewSubscription } = accountController.getFeatures();
  const { profile } = useProfileStore();

  const { profilesEnabled } = useProfiles();

  const profileAndFavoritesPage = location.pathname?.includes('my-profile') || location.pathname.includes('favorites');

  const onLogout = useCallback(async () => {
    // Empty customer on a user page leads to navigate (code bellow), so we don't repeat it here
    await accountController.logout();
  }, [accountController]);

  useEffect(() => {
    if (accessModel !== ACCESS_MODEL.AVOD && canRenewSubscription) {
      checkoutController.getSubscriptionSwitches();
    }
  }, [accessModel, checkoutController, canRenewSubscription]);

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
        <div className={styles.leftColumn}>
          <div className={styles.panel}>
            <ul>
              {accessModel === 'SVOD' && profilesEnabled && profileAndFavoritesPage && (
                <li>
                  <Button
                    to={`my-profile/${profile?.id}`}
                    label={profile?.name ?? t('nav.profile')}
                    variant="text"
                    startIcon={<img className={styles.profileIcon} src={profile?.avatar_url} alt={profile?.name} />}
                    className={styles.button}
                  />
                </li>
              )}
              {(!profilesEnabled || !profileAndFavoritesPage) && (
                <li>
                  <Button to="my-account" label={t('nav.account')} variant="text" startIcon={<AccountCircle />} className={styles.button} />
                </li>
              )}
              {favoritesList && (!profilesEnabled || profileAndFavoritesPage) && (
                <li>
                  <Button to="favorites" label={t('nav.favorites')} variant="text" startIcon={<Favorite />} className={styles.button} />
                </li>
              )}

              {accessModel !== ACCESS_MODEL.AVOD && (!profilesEnabled || !profileAndFavoritesPage) && (
                <li>
                  <Button to="payments" label={t('nav.payments')} variant="text" startIcon={<BalanceWallet />} className={styles.button} />
                </li>
              )}

              {(!profilesEnabled || !profileAndFavoritesPage) && (
                <li className={styles.logoutLi}>
                  <Button onClick={onLogout} label={t('nav.logout')} variant="text" startIcon={<Exit />} className={styles.button} />
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
      <div className={styles.mainColumn}>
        <Routes>
          <Route
            path="my-account"
            element={<AccountComponent panelClassName={styles.panel} panelHeaderClassName={styles.panelHeader} canUpdateEmail={canUpdateEmail} />}
          />
          {profilesEnabled && <Route path="my-profile/:id" element={<EditProfile contained />} />}
          {favoritesList && (
            <Route
              path="favorites"
              element={
                <>
                  <PlaylistContainer type={PersonalShelf.Favorites} showEmpty>
                    {({ playlist, error, isLoading }) => (
                      <Favorites
                        playlist={playlist}
                        error={error}
                        isLoading={isLoading}
                        onClearFavoritesClick={() => setClearFavoritesOpen(true)}
                        accessModel={accessModel}
                        hasSubscription={!!subscription}
                      />
                    )}
                  </PlaylistContainer>
                  <ConfirmationDialog
                    open={clearFavoritesOpen}
                    title={t('favorites.clear_favorites_title')}
                    body={t('favorites.clear_favorites_body')}
                    onConfirm={async () => {
                      await favoritesController.clear();
                      setClearFavoritesOpen(false);
                    }}
                    onClose={() => setClearFavoritesOpen(false)}
                  />
                </>
              }
            />
          )}
          <Route path="payments" element={accessModel !== ACCESS_MODEL.AVOD ? <PaymentContainer /> : <Navigate to="my-account" />} />
          <Route path="*" element={<Navigate to="my-account" />} />
        </Routes>
      </div>
    </div>
  );
};

export default User;
