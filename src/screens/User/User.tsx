import React from 'react';
import { Redirect, Route, Switch, useHistory } from 'react-router-dom';
import type { PlaylistItem } from 'types/playlist';

import Favorites from '../../components/Favorites/Favorites';
import PlaylistContainer from '../../containers/Playlist/PlaylistContainer';
import { PersonalShelf } from '../../enum/PersonalShelf';
import useBlurImageUpdater from '../../hooks/useBlurImageUpdater';
import { cardUrl } from '../../utils/formatting';
import Customer from '../../containers/Customer/Customer';
import SubscriptionContainer from '../../containers/Subscription/Subscription';
import useBreakpoint, { Breakpoint } from '../../hooks/useBreakpoint';
import Button from '../../components/Button/Button';
import Account from '../../components/Account/Account';
import Payment from '../../components/Payment/Payment';
import AccountCircle from '../../icons/AccountCircle';
import Favorite from '../../icons/Favorite';
import BalanceWallet from '../../icons/BalanceWallet';
import Exit from '../../icons/Exit';
import { useFavorites } from '../../stores/FavoritesStore';

import styles from './User.module.scss';

const User = (): JSX.Element => {
  const history = useHistory();
  const breakpoint = useBreakpoint();
  const isLargeScreen = breakpoint >= Breakpoint.md;

  const updateBlurImage = useBlurImageUpdater();
  const { clearList: clearFavorites } = useFavorites();

  const onCardClick = (playlistItem: PlaylistItem) => history.push(cardUrl(playlistItem));
  const onCardHover = (playlistItem: PlaylistItem) => updateBlurImage(playlistItem.image);

  return (
    <div className={styles.user}>
      {isLargeScreen && (
        <div className={styles.leftColumn}>
          <div className={styles.panel}>
            <ul>
              <li>
                <Button to="/u/my-account" label="Account" variant="text" startIcon={<AccountCircle />} className={styles.button} />
              </li>
              <li>
                <Button to="/u/favorites" label="Favorites" variant="text" startIcon={<Favorite />} className={styles.button} />
              </li>
              <li>
                <Button to="/u/payments" label="Payments" variant="text" startIcon={<BalanceWallet />} className={styles.button} />
              </li>
              <li className={styles.logoutLi}>
                <Button to="/u/logout" label="Log out" variant="text" startIcon={<Exit />} className={styles.button} />
              </li>
            </ul>
          </div>
        </div>
      )}
      <div className={styles.mainColumn}>
        <Switch>
          <Route path="/u/my-account">
            <Customer>
              {({ customer, update }) => (
                <Account customer={customer} update={update} panelClassName={styles.panel} panelHeaderClassName={styles.panelHeader} />
              )}
            </Customer>
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
              {({ subscription, update }) => (
                <Payment
                  subscription={subscription}
                  onEditSubscriptionClick={update}
                  panelClassName={styles.panel}
                  panelHeaderClassName={styles.panelHeader}
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
