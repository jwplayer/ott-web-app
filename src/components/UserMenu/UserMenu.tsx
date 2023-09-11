import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

import styles from './UserMenu.module.scss';
import ProfilesMenu from './ProfilesMenu/ProfilesMenu';

import AccountCircle from '#src/icons/AccountCircle';
import Favorite from '#src/icons/Favorite';
import BalanceWallet from '#src/icons/BalanceWallet';
import Exit from '#src/icons/Exit';
import MenuButton from '#components/MenuButton/MenuButton';
import { logout } from '#src/stores/AccountController';
import { useSelectProfile } from '#src/hooks/useProfiles';
import ProfileCircle from '#src/icons/ProfileCircle';
import type { AccessModel } from '#types/Config';
import type { Profile } from '#types/account';
import defaultAvatar from '#src/assets/profiles/default_avatar.png';

type Props = {
  small?: boolean;
  showPaymentsItem: boolean;
  onClick?: () => void;
  accessModel?: AccessModel;
  currentProfile?: Profile;
  profilesEnabled?: boolean;
  profiles?: Profile[];
};

const UserMenu = ({ showPaymentsItem, small = false, onClick, accessModel, currentProfile, profilesEnabled, profiles }: Props) => {
  const { t } = useTranslation('user');
  const navigate = useNavigate();

  const selectProfile = useSelectProfile();

  const onLogout = useCallback(async () => {
    if (onClick) {
      onClick();
    }

    await logout();
    navigate('/', { replace: true });
  }, [onClick, navigate]);

  return (
    <ul className={styles.menuItems}>
      {accessModel === 'SVOD' && profilesEnabled && (
        <ProfilesMenu
          profiles={profiles ?? []}
          currentProfile={currentProfile}
          small={small}
          selectingProfile={selectProfile.isLoading}
          selectProfile={selectProfile.mutate}
          defaultAvatar={defaultAvatar}
          createButtonLabel={t('nav.add_profile')}
          switchProfilesLabel={t('nav.switch_profiles')}
          onCreateButtonClick={() => navigate('/u/profiles/create')}
        />
      )}
      <li className={styles.sectionHeader}>{t('nav.settings')}</li>
      {profilesEnabled && currentProfile && (
        <li>
          <MenuButton
            small={small}
            onClick={onClick}
            to={`/u/my-profile/${currentProfile?.id ?? ''}`}
            label={t('nav.profile')}
            startIcon={<ProfileCircle src={currentProfile?.avatar_url || defaultAvatar} alt={currentProfile?.name ?? ''} />}
          />
        </li>
      )}
      <li>
        <MenuButton small={small} onClick={onClick} to="/u/my-account" label={t('nav.account')} startIcon={<AccountCircle />} />
      </li>

      <li>
        <MenuButton small={small} onClick={onClick} to="/u/favorites" label={t('nav.favorites')} startIcon={<Favorite />} />
      </li>
      {showPaymentsItem && (
        <li>
          <MenuButton small={small} onClick={onClick} to="/u/payments" label={t('nav.payments')} startIcon={<BalanceWallet />} />
        </li>
      )}
      <hr className={classNames(styles.divider, { [styles.small]: small })} />
      <li>
        <MenuButton small={small} onClick={onLogout} label={t('nav.logout')} startIcon={<Exit />} />
      </li>
    </ul>
  );
};

export default UserMenu;
