import classNames from 'classnames';
import type { UseMutateFunction } from 'react-query';
import type { Profile } from '@jwp/ott-common/types/account';

import Plus from '../../../icons/Plus';
import ProfileCircle from '../../../icons/ProfileCircle';
import styles from '../UserMenu.module.scss';
import LoadingOverlay from '../../LoadingOverlay/LoadingOverlay';
import MenuButton from '../../MenuButton/MenuButton';

type ProfilesMenuProps = {
  profiles: Profile[];
  currentProfile?: Profile | null;
  small?: boolean;
  selectingProfile: boolean;
  selectProfile: UseMutateFunction<unknown, unknown, { id: string; avatarUrl: string }, unknown>;
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
  createButtonLabel,
  switchProfilesLabel,
  onCreateButtonClick,
}: ProfilesMenuProps) => (
  <>
    <li className={styles.sectionHeader}>{switchProfilesLabel}</li>
    {selectingProfile ? (
      <li>
        <LoadingOverlay inline />
      </li>
    ) : (
      profiles?.map((profile) => (
        <li key={profile.id}>
          <MenuButton
            active={profile.id === currentProfile?.id}
            small={small}
            onClick={() => selectProfile({ id: profile.id, avatarUrl: profile.avatar_url })}
            label={profile.name}
            startIcon={<ProfileCircle src={profile.avatar_url} alt={profile.name} />}
          />
        </li>
      ))
    )}
    {(profiles?.length || 0) < 4 && (
      <li>
        <MenuButton small={small} onClick={onCreateButtonClick} startIcon={<Plus />} label={createButtonLabel} />
      </li>
    )}
    <li>
      <hr
        className={classNames(styles.divider, {
          [styles.small]: small,
        })}
      />
    </li>
  </>
);

export default ProfilesMenu;
