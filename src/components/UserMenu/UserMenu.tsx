import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

import styles from './UserMenu.module.scss';

import AccountCircle from '#src/icons/AccountCircle';
import Favorite from '#src/icons/Favorite';
import BalanceWallet from '#src/icons/BalanceWallet';
import Exit from '#src/icons/Exit';
import MenuButton from '#components/MenuButton/MenuButton';
import { logout } from '#src/stores/AccountController';
import { useConfigStore } from '#src/stores/ConfigStore';
import LoadingOverlay from '#components/LoadingOverlay/LoadingOverlay';
import Plus from '#src/icons/Plus';
import { useSelectProfile, useListProfiles, unpersistProfile, useProfilesFeatureEnabled } from '#src/hooks/useProfiles';
import ProfileCircle from '#src/icons/ProfileCircle';
import { useProfileStore } from '#src/stores/ProfileStore';

type Props = {
  small?: boolean;
  showPaymentsItem: boolean;
  onClick?: () => void;
};

const UserMenu = ({ showPaymentsItem, small = false, onClick }: Props) => {
  const { t } = useTranslation('user');
  const navigate = useNavigate();
  const { accessModel } = useConfigStore();
  const { profile: currentProfile } = useProfileStore();
  const profilesEnabled = useProfilesFeatureEnabled();

  const { data, isFetching } = useListProfiles();
  const profiles = data?.responseData.collection;

  if (profilesEnabled && !profiles?.length) {
    unpersistProfile();
    navigate('/u/profiles');
  }

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
        <>
          <div className={styles.sectionHeader}>{t('nav.switch_profiles')}</div>
          {selectProfile.isLoading || isFetching ? (
            <LoadingOverlay inline />
          ) : (
            profiles?.map((profile) => (
              <li key={profile.id}>
                <MenuButton
                  active={profile.id === currentProfile?.id}
                  small={small}
                  onClick={() => selectProfile.mutate({ id: profile.id, avatarUrl: profile.avatar_url })}
                  label={profile.name}
                  startIcon={<ProfileCircle src={profile.avatar_url} alt={profile.name} />}
                />
              </li>
            ))
          )}
          {(profiles?.length || 0) < 4 && (
            <li>
              <MenuButton small={small} onClick={() => navigate('/u/profiles/create')} label={t('nav.add_profile')} startIcon={<Plus />} />
            </li>
          )}
          <hr
            className={classNames(styles.divider, {
              [styles.small]: small,
            })}
          />
        </>
      )}
      <div className={styles.sectionHeader}>{t('nav.settings')}</div>
      {profilesEnabled && (
        <li>
          <MenuButton
            small={small}
            onClick={onClick}
            to={`/u/my-profile/${currentProfile?.id ?? ''}`}
            label={t('nav.profile')}
            startIcon={<ProfileCircle src={currentProfile?.avatar_url ?? ''} alt={currentProfile?.name ?? ''} />}
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
