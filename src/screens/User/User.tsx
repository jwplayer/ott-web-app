import React, { useEffect } from 'react';
import { Redirect, Route, Switch, useHistory, useLocation } from 'react-router-dom';
import type { PlaylistItem } from 'types/playlist';
import { useTranslation } from 'react-i18next';

import Favorites from '../../components/Favorites/Favorites';
import PlaylistContainer from '../../containers/Playlist/PlaylistContainer';
import { PersonalShelf } from '../../enum/PersonalShelf';
import useBlurImageUpdater from '../../hooks/useBlurImageUpdater';
import { cardUrl } from '../../utils/formatting';
import AccountContainer from '../../containers/Account/AccountContainer';
import SubscriptionContainer from '../../containers/Subscription/SubscriptionContainer';
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
import { addQueryParam } from '../../utils/history';

import styles from './User.module.scss';

const User = (): JSX.Element => {
  const history = useHistory();
  const location = useLocation();
  const { t } = useTranslation('user');
  const breakpoint = useBreakpoint();
  const isLargeScreen = breakpoint >= Breakpoint.md;
  const { user: customer, subscription } = AccountStore.useState((state) => state);

  const updateBlurImage = useBlurImageUpdater();
  const { clearList: clearFavorites } = useFavorites();

  const onCardClick = (playlistItem: PlaylistItem) => history.push(cardUrl(playlistItem));
  const onCardHover = (playlistItem: PlaylistItem) => updateBlurImage(playlistItem.image);

  const handleCompleteSubscriptionClick = () => {
    history.push(addQueryParam(history, 'u', 'choose-offer'));
  };

  const handleCancelSubscriptionClick = () => {
    history.push(addQueryParam(history, 'u', 'unsubscribe'));
  };

  const handleRenewSubscriptionClick = () => {
    history.push(addQueryParam(history, 'u', 'renew-subscription'));
  };

  useEffect(() => updateBlurImage(''), [updateBlurImage]);

  useEffect(() => {
    if (location.pathname === '/u/logout') {
      logout();
      history.push('/');
      history.go(0);
    }
  }, [location, history]);

  if (!customer) {
    return <div className={styles.user}>Please login first</div>;
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
              <li>
                <Button to="/u/payments" label={t('nav.payments')} variant="text" startIcon={<BalanceWallet />} className={styles.button} />
              </li>
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
            <AccountContainer>
              {({
                customer,
                errors,
                isLoading,
                consentsLoading,
                publisherConsents,
                customerConsents,
                onUpdateEmailSubmit,
                onUpdateInfoSubmit,
                onUpdateConsentsSubmit,
                onReset,
              }) => (
                <AccountComponent
                  customer={customer}
                  errors={errors}
                  isLoading={isLoading}
                  consentsLoading={consentsLoading}
                  publisherConsents={publisherConsents}
                  customerConsents={customerConsents}
                  onUpdateEmailSubmit={onUpdateEmailSubmit}
                  onUpdateInfoSubmit={onUpdateInfoSubmit}
                  onUpdateConsentsSubmit={onUpdateConsentsSubmit}
                  onReset={onReset}
                  panelClassName={styles.panel}
                  panelHeaderClassName={styles.panelHeader}
                  onDeleteAccountClick={() => console.error('Sure?')}
                />
              )}
            </AccountContainer>
          </Route>
          <Route path="/u/favorites">
            <PlaylistContainer playlistId={PersonalShelf.Favorites}>
              {({ playlist, error, isLoading }) => (
                <Favorites
                  playlist={playlist.playlist}
                  error={error}
                  isLoading={isLoading}
                  onCardClick={onCardClick}
                  onCardHover={onCardHover}
                  onClearFavoritesClick={clearFavorites}
                />
              )}
            </PlaylistContainer>
          </Route>
          <Route path="/u/payments">
            <SubscriptionContainer>
              {({ activePaymentDetail, transactions, isLoading }) => (
                <Payment
                  activeSubscription={subscription}
                  activePaymentDetail={activePaymentDetail}
                  transactions={transactions}
                  customer={customer}
                  isLoading={isLoading}
                  panelClassName={styles.panel}
                  panelHeaderClassName={styles.panelHeader}
                  onCompleteSubscriptionClick={handleCompleteSubscriptionClick}
                  onCancelSubscriptionClick={handleCancelSubscriptionClick}
                  onRenewSubscriptionClick={handleRenewSubscriptionClick}
                />
              )}
            </SubscriptionContainer>
          </Route>
          <Route path="/u/logout">
            <Redirect to="/" />
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
