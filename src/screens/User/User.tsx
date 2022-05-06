import React, { useEffect, useState } from 'react';
import { Redirect, Route, Switch, useHistory, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import Favorites from '../../components/Favorites/Favorites';
import PlaylistContainer from '../../containers/Playlist/PlaylistContainer';
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
import { useFavorites } from '../../stores/FavoritesStore';
import { AccountStore, logout } from '../../stores/AccountStore';
import LoadingOverlay from '../../components/LoadingOverlay/LoadingOverlay';
import ConfirmationDialog from '../../components/ConfirmationDialog/ConfirmationDialog';
import { ConfigStore } from '../../stores/ConfigStore';

import styles from './User.module.scss';

import type { PlaylistItem } from '#types/playlist';

const User = (): JSX.Element => {
  const accessModel = ConfigStore.useState((s) => s.accessModel);
  const history = useHistory();
  const location = useLocation();
  const { t } = useTranslation('user');
  const breakpoint = useBreakpoint();
  const [clearFavoritesOpen, setClearFavoritesOpen] = useState(false);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const isLargeScreen = breakpoint > Breakpoint.md;
  const { user: customer, subscription, transactions, activePayment, loading } = AccountStore.useState((state) => state);

  const updateBlurImage = useBlurImageUpdater();
  const { clearList: clearFavorites } = useFavorites();

  const onCardClick = (playlistItem: PlaylistItem) => history.push(cardUrl(playlistItem));
  const onCardHover = (playlistItem: PlaylistItem) => updateBlurImage(playlistItem.image);

  useEffect(() => updateBlurImage(''), [updateBlurImage]);

  useEffect(() => {
    if (!loading && !customer) {
      history.replace('/');
    }
  }, [history, customer, loading]);

  useEffect(() => {
    // Todo: Make logout a function, not a route (https://stackoverflow.com/questions/3521290/logout-get-or-post)
    if (location.pathname === '/u/logout') {
      logout();
      history.push('/');
    }
  }, [location, history]);

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
                <Button to="/u/my-account" label={t('nav.account')} variant="text" startIcon={<AccountCircle />} className={styles.button} />
              </li>
              <li>
                <Button to="/u/favorites" label={t('nav.favorites')} variant="text" startIcon={<Favorite />} className={styles.button} />
              </li>
              {accessModel === 'SVOD' && (
                <li>
                  <Button to="/u/payments" label={t('nav.payments')} variant="text" startIcon={<BalanceWallet />} className={styles.button} />
                </li>
              )}
              <li className={styles.logoutLi}>
                <Button to="/u/logout" label={t('nav.logout')} variant="text" startIcon={<Exit />} className={styles.button} />
              </li>
            </ul>
          </div>
        </div>
      )}
      <div className={styles.mainColumn}>
        <Switch>
          <Route path="/u/my-account">
            <AccountComponent panelClassName={styles.panel} panelHeaderClassName={styles.panelHeader} />
          </Route>
          <Route path="/u/favorites">
            <PlaylistContainer playlistId={PersonalShelf.Favorites} showEmpty>
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
              onConfirm={() => {
                clearFavorites();
                setClearFavoritesOpen(false);
              }}
              onClose={() => setClearFavoritesOpen(false)}
            />
          </Route>
          <Route path="/u/payments">
            {accessModel === 'SVOD' ? (
              <Payment
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
              <Redirect to="/u/my-account" />
            )}
          </Route>
          <Route path="/u/logout">
            <LoadingOverlay transparentBackground />
          </Route>
          <Route path="/u/:other?">
            <Redirect to="/u/my-account" />
          </Route>
        </Switch>
      </div>
    </div>
  );
};

export default User;
