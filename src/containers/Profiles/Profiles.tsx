import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import shallow from 'zustand/shallow';

import styles from './Profiles.module.scss';

import ProfileBox from '#src/components/ProfileBox/ProfileBox';
import { useAccountStore } from '#src/stores/AccountStore';
import type { Profile } from '#types/account';
import AddNewProfile from '#src/components/ProfileBox/AddNewProfile';
import LoadingOverlay from '#src/components/LoadingOverlay/LoadingOverlay';
import Button from '#src/components/Button/Button';
import { useHandleProfileSelection, useListProfiles } from '#src/hooks/useProfiles';
const MAX_PROFILES = 4;

type Props = {
  editMode?: boolean;
};

const Profiles = ({ editMode = false }: Props) => {
  const navigate = useNavigate();

  const { canManageProfiles, loading } = useAccountStore(({ canManageProfiles, loading }) => ({ canManageProfiles, loading }), shallow);

  useEffect(() => {
    if (!canManageProfiles) navigate('/');
  }, [canManageProfiles, navigate]);

  const { data, isLoading, isFetching } = useListProfiles();
  const activeProfiles = data?.responseData.collection.length || 0;
  const canAddNew = activeProfiles < MAX_PROFILES;

  const selectProfile = useHandleProfileSelection();

  if (loading || isLoading || isFetching) return <LoadingOverlay inline />;

  return (
    <div className={styles.wrapper}>
      {activeProfiles === 0 ? (
        <div className={styles.headings}>
          <p className={styles.paragarph}>There’s no one watching.</p>
          <h2 className={styles.heading}>Create your profile</h2>
        </div>
      ) : (
        <h2 className={styles.heading}>{!editMode ? 'Who’s watching?' : 'Manage profiles'}</h2>
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
        {canAddNew && !editMode && <AddNewProfile onClick={() => navigate('/u/profiles/create')} />}
      </div>
      {activeProfiles > 0 && (
        <>
          {!editMode ? (
            <Button onClick={() => navigate('/u/profiles/edit')} label="Edit profiles" variant="outlined" size="large" />
          ) : (
            <Button onClick={() => navigate('/u/profiles')} label="Done" variant="outlined" size="large" />
          )}
        </>
      )}
    </div>
  );
};

export default Profiles;
