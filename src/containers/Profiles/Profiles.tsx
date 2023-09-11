import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import shallow from 'zustand/shallow';
import { useTranslation } from 'react-i18next';

import styles from './Profiles.module.scss';

import ProfileBox from '#src/components/ProfileBox/ProfileBox';
import { useAccountStore } from '#src/stores/AccountStore';
import type { Profile } from '#types/account';
import AddNewProfile from '#src/components/ProfileBox/AddNewProfile';
import LoadingOverlay from '#src/components/LoadingOverlay/LoadingOverlay';
import Button from '#src/components/Button/Button';
import { useSelectProfile, useProfiles } from '#src/hooks/useProfiles';
import useBreakpoint, { Breakpoint } from '#src/hooks/useBreakpoint';
const MAX_PROFILES = 4;

type Props = {
  editMode?: boolean;
};

const Profiles = ({ editMode = false }: Props) => {
  const navigate = useNavigate();
  const { t } = useTranslation('user');
  const { loading, user } = useAccountStore(({ loading, user }) => ({ loading, user }), shallow);

  const breakpoint: Breakpoint = useBreakpoint();
  const isMobile = breakpoint === Breakpoint.xs;

  const { data, isLoading, isFetching, isError, profilesEnabled } = useProfiles();

  const activeProfiles = data?.responseData.collection.length || 0;
  const canAddNew = activeProfiles < MAX_PROFILES;

  useEffect(() => {
    if (!profilesEnabled || !user?.id || isError) {
      navigate('/');
    }
  }, [profilesEnabled, navigate, user?.id, isError]);

  const selectProfile = useSelectProfile();

  if (loading || isLoading || isFetching) return <LoadingOverlay inline />;

  return (
    <div className={styles.wrapper}>
      {activeProfiles === 0 ? (
        <div className={styles.headings}>
          <p className={styles.paragarph}>{t('profile.no_one_watching')}</p>
          <h2 className={styles.heading}>{t('profile.create_message')}</h2>
        </div>
      ) : (
        <h2 className={styles.heading}>{t('account.who_is_watching')}</h2>
      )}
      <div className={styles.flex}>
        {data?.responseData.collection?.map((profile: Profile) => (
          <ProfileBox
            editMode={editMode}
            onEdit={() => navigate(`/u/profiles/edit/${profile.id}`)}
            onClick={() => selectProfile.mutate({ id: profile.id, avatarUrl: profile.avatar_url })}
            key={profile.id}
            name={profile.name}
            adult={profile.adult}
            image={profile.avatar_url}
          />
        ))}
        {canAddNew && <AddNewProfile onClick={() => navigate('/u/profiles/create')} />}
      </div>
      {activeProfiles > 0 && (
        <div className={styles.buttonContainer}>
          {!editMode ? (
            <Button onClick={() => navigate('/u/profiles/edit')} label={t('account.manage_profiles')} variant="outlined" size="large" fullWidth={isMobile} />
          ) : (
            <Button onClick={() => navigate('/u/profiles')} label="Done" variant="outlined" size="large" fullWidth={isMobile} />
          )}
        </div>
      )}
    </div>
  );
};

export default Profiles;
