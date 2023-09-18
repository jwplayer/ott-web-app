import classNames from 'classnames';
import type { UseMutateFunction } from 'react-query';

import styles from '../UserMenu.module.scss';

import LoadingOverlay from '#components/LoadingOverlay/LoadingOverlay';
import MenuButton from '#components/MenuButton/MenuButton';
import Plus from '#src/icons/Plus';
import ProfileCircle from '#src/icons/ProfileCircle';
import type { Profile } from '#types/account';

type ProfilesMenuProps = {
  profiles: Profile[];
  currentProfile?: Profile;
  small?: boolean;
  selectingProfile: boolean;
  selectProfile: UseMutateFunction<unknown, unknown, { id: string; avatarUrl: string }, unknown>;
  defaultAvatar: string;
  createButtonLabel?: string;
  switchProfilesLabel?: string;
  onCreateButtonClick: () => void;
};

const ProfilesMenu = ({
  profiles,
  currentProfile,
  small,
  selectingProfile,
  selectProfile,
  defaultAvatar,
  createButtonLabel,
  switchProfilesLabel,
  onCreateButtonClick,
}: ProfilesMenuProps) => (
  <>
    <li className={styles.sectionHeader}>{switchProfilesLabel}</li>
    {selectingProfile ? (
      <LoadingOverlay inline />
    ) : (
      profiles?.map((profile) => (
        <li key={profile.id}>
          <MenuButton
            active={profile.id === currentProfile?.id}
            small={small}
            onClick={() => selectProfile({ id: profile.id, avatarUrl: profile.avatar_url })}
            label={profile.name}
            startIcon={<ProfileCircle src={profile.avatar_url || defaultAvatar} alt={profile.name} />}
          />
        </li>
      ))
    )}
    {(profiles?.length || 0) < 4 && (
      <li>
        <MenuButton small={small} onClick={onCreateButtonClick} startIcon={<Plus />} label={createButtonLabel} />
      </li>
    )}
    <hr
      className={classNames(styles.divider, {
        [styles.small]: small,
      })}
    />
  </>
);

export default ProfilesMenu;
