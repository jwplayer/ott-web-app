import React, { useCallback, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import shallow from 'zustand/shallow';

import Favorites from '../../components/Favorites/Favorites';
import PlaylistContainer from '../../containers/PlaylistContainer/PlaylistContainer';
import { PersonalShelf } from '../../enum/PersonalShelf';
import useBlurImageUpdater from '../../hooks/useBlurImageUpdater';
import { cardUrl } from '../../utils/formatting';
import useBreakpoint, { Breakpoint } from '../../hooks/useBreakpoint';
import Button from '../../components/Button/Button';
import AccountComponent from '../../components/Account/Account';
import Payment from '../../components/Payment/Payment';
import AccountCircle from '../../icons/AccountCircle';
import Favorite from '../../icons/Favorite';
import BalanceWallet from '../../icons/BalanceWallet';
import Exit from '../../icons/Exit';
import { useAccountStore } from '../../stores/AccountStore';
import LoadingOverlay from '../../components/LoadingOverlay/LoadingOverlay';
import ConfirmationDialog from '../../components/ConfirmationDialog/ConfirmationDialog';
import { useConfigStore } from '../../stores/ConfigStore';

import styles from './User.module.scss';

import type { PlaylistItem } from '#types/playlist';
import { logout } from '#src/stores/AccountController';
import { clear as clearFavorites } from '#src/stores/FavoritesController';

const User = (): JSX.Element => {
  const { accessModel, favoritesList } = useConfigStore(
    (s) => ({
      accessModel: s.accessModel,
      favoritesList: s.config?.features?.favoritesList,
    }),
    shallow,
  );
  const navigate = useNavigate();
  const { t } = useTranslation('user');
  const breakpoint = useBreakpoint();
  const [clearFavoritesOpen, setClearFavoritesOpen] = useState(false);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const isLargeScreen = breakpoint > Breakpoint.md;
  const { user: customer, subscription, transactions, activePayment, loading } = useAccountStore();

  const updateBlurImage = useBlurImageUpdater();

  const onCardClick = (playlistItem: PlaylistItem) => navigate(cardUrl(playlistItem));
  const onCardHover = (playlistItem: PlaylistItem) => updateBlurImage(playlistItem.image);
  const onLogout = useCallback(async () => {
    // Empty customer on a user page leads to navigate (code bellow), so we don't repeat it here
    await logout();
  }, []);

  useEffect(() => updateBlurImage(''), [updateBlurImage]);

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
              <li>
                <Button to="my-account" label={t('nav.account')} variant="text" startIcon={<AccountCircle />} className={styles.button} />
              </li>
              {favoritesList && (
                <li>
                  <Button to="favorites" label={t('nav.favorites')} variant="text" startIcon={<Favorite />} className={styles.button} />
                </li>
              )}
              {accessModel !== 'AVOD' && (
                <li>
                  <Button to="payments" label={t('nav.payments')} variant="text" startIcon={<BalanceWallet />} className={styles.button} />
                </li>
              )}
              <li className={styles.logoutLi}>
                <Button onClick={onLogout} label={t('nav.logout')} variant="text" startIcon={<Exit />} className={styles.button} />
              </li>
            </ul>
          </div>
        </div>
      )}
      <div className={styles.mainColumn}>
        <Routes>
          <Route path="my-account" element={<AccountComponent panelClassName={styles.panel} panelHeaderClassName={styles.panelHeader} />} />
          {favoritesList && (
            <Route
              path="favorites"
              element={
                <>
                  <PlaylistContainer type={PersonalShelf.Favorites} showEmpty>
                    {({ playlist, error, isLoading }) => (
                      <Favorites
                        playlist={playlist.playlist}
                        error={error}
                        isLoading={isLoading}
                        onCardClick={onCardClick}
                        onCardHover={onCardHover}
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
                      await clearFavorites();
                      setClearFavoritesOpen(false);
                    }}
                    onClose={() => setClearFavoritesOpen(false)}
                  />
                </>
              }
            />
          )}
          <Route
            path="payments"
            element={
              accessModel !== 'AVOD' ? (
                <Payment
                  accessModel={accessModel}
                  activeSubscription={subscription}
                  activePaymentDetail={activePayment}
                  transactions={transactions}
                  customer={customer}
                  isLoading={loading}
                  panelClassName={styles.panel}
                  panelHeaderClassName={styles.panelHeader}
                  onShowAllTransactionsClick={() => setShowAllTransactions(true)}
                  showAllTransactions={showAllTransactions}
                />
              ) : (
                <Navigate to="my-account" />
              )
            }
          />
          {/* <Route path=":other" element={<Navigate to="my-account" />} /> */}
          <Route path="*" element={<Navigate to="my-account" />} />
        </Routes>
      </div>
    </div>
  );
};

export default User;
