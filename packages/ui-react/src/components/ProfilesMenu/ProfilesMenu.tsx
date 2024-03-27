import Plus from '@jwp/ott-theme/assets/icons/plus.svg?react';
import type { Profile } from '@jwp/ott-common/types/profiles';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PATH_USER_PROFILES_CREATE } from '@jwp/ott-common/src/paths';

import styles from '../UserMenu/UserMenu.module.scss'; // TODO inherit styling
import LoadingOverlay from '../LoadingOverlay/LoadingOverlay';
import MenuButton from '../MenuButton/MenuButton';
import Icon from '../Icon/Icon';
import ProfileCircle from '../ProfileCircle/ProfileCircle';

type ProfilesMenuProps = {
  profiles: Profile[];
  currentProfile?: Profile | null;
  small?: boolean;
  selectingProfile: boolean;
  selectProfile?: ({ avatarUrl, id }: { avatarUrl: string; id: string }) => void;
  onButtonClick?: () => void;
};

const ProfilesMenu = ({ profiles, currentProfile, small, selectingProfile, selectProfile, onButtonClick }: ProfilesMenuProps) => {
  const { t } = useTranslation('user');
  const navigate = useNavigate();

  const onProfileSelectClick = (profile: Profile) => {
    onButtonClick?.();
    selectProfile?.({ id: profile.id, avatarUrl: profile.avatar_url });
  };

  const onProfileCreateClick = () => {
    onButtonClick?.();
    navigate(PATH_USER_PROFILES_CREATE);
  };

  return (
    <>
      <h2 className={styles.sectionHeader}>{t('nav.switch_profiles')}</h2>
      <ul className={styles.menuItems}>
        {selectingProfile ? (
          <li aria-hidden="true">
            <LoadingOverlay inline />
          </li>
        ) : (
          profiles.map((profile) => (
            <li key={profile.id}>
              <MenuButton
                active={profile.id === currentProfile?.id}
                aria-current={profile.id === currentProfile?.id ? true : undefined}
                small={small}
                onClick={() => onProfileSelectClick(profile)}
                label={profile.name}
                startIcon={<ProfileCircle src={profile.avatar_url} alt={profile.name} />}
              />
            </li>
          ))
        )}
        {profiles.length < 4 && (
          <li>
            <MenuButton small={small} onClick={onProfileCreateClick} startIcon={<Icon icon={Plus} />} label={t('nav.add_profile')} />
          </li>
        )}
      </ul>
    </>
  );
};

export default ProfilesMenu;
