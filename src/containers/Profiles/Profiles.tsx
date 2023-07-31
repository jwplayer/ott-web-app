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
import { useSelectProfile, useListProfiles } from '#src/hooks/useProfiles';
const MAX_PROFILES = 4;

type Props = {
  editMode?: boolean;
};

const Profiles = ({ editMode = false }: Props) => {
  const navigate = useNavigate();
  const { t } = useTranslation('user');
  const { canManageProfiles, loading, user } = useAccountStore(({ canManageProfiles, loading, user }) => ({ canManageProfiles, loading, user }), shallow);

  useEffect(() => {
    if (!canManageProfiles || !user?.id) navigate('/');
  }, [canManageProfiles, navigate, user?.id]);

  const { data, isLoading, isFetching, refetch } = useListProfiles();
  const activeProfiles = data?.responseData.collection.length || 0;
  const canAddNew = activeProfiles < MAX_PROFILES;

  const selectProfile = useSelectProfile();

  useEffect(() => {
    refetch();
  }, [refetch]);

  if (loading || isLoading || isFetching) return <LoadingOverlay inline />;

  return (
    <div className={styles.wrapper}>
      {activeProfiles === 0 ? (
        <div className={styles.headings}>
          <p className={styles.paragarph}>There’s no one watching.</p>
          <h2 className={styles.heading}>Create your profile</h2>
        </div>
      ) : (
        <h2 className={styles.heading}>{t('account.who_is_watching')}</h2>
      )}
      <div className={styles.flex}>
        {data?.responseData.collection?.map((profile: Profile) => (
          <ProfileBox
            editMode={editMode}
            onEdit={() => navigate(`/u/profiles/edit/${profile.id}`)}
            onClick={() => selectProfile.mutate({ id: profile.id, navigate })}
            key={profile.id}
            name={profile.name}
            adult={profile.adult}
            image={profile.avatar_url}
          />
        ))}
        {canAddNew && <AddNewProfile onClick={() => navigate('/u/profiles/create')} />}
      </div>
      {activeProfiles > 0 && (
        <>
          {!editMode ? (
            <Button onClick={() => navigate('/u/profiles/edit')} label={t('account.manage_profiles')} variant="outlined" size="large" />
          ) : (
            <Button onClick={() => navigate('/u/profiles')} label="Done" variant="outlined" size="large" />
          )}
        </>
      )}
    </div>
  );
};

export default Profiles;
