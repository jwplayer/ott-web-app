import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useQuery } from 'react-query';
import shallow from 'zustand/shallow';
import { useTranslation } from 'react-i18next';

import styles from './Profiles.module.scss';

import * as persist from '#src/utils/persist';
import ProfileBox from '#src/components/ProfileBox/ProfileBox';
import { useAccountStore } from '#src/stores/AccountStore';
import { enterProfile, initializeAccount, listProfiles } from '#src/stores/AccountController';
import type { AuthData, Profile } from '#types/account';
import AddNewProfile from '#src/components/ProfileBox/AddNewProfile';
import LoadingOverlay from '#src/components/LoadingOverlay/LoadingOverlay';
import Button from '#src/components/Button/Button';
import { useFavoritesStore } from '#src/stores/FavoritesStore';
import { useWatchHistoryStore } from '#src/stores/WatchHistoryStore';

const MAX_PROFILES = 4;
const PERSIST_KEY_ACCOUNT = 'auth';
const PERSIST_PROFILE = 'profile';

type Props = {
  editMode?: boolean;
};

const Profiles = ({ editMode = false }: Props) => {
  const navigate = useNavigate();
  const { t } = useTranslation('user');
  const { canManageProfiles, loading } = useAccountStore(({ canManageProfiles, loading }) => ({ canManageProfiles, loading }), shallow);

  useEffect(() => {
    if (!canManageProfiles) navigate('/');
  }, [canManageProfiles, navigate]);

  const { data, isLoading, isFetching } = useQuery(['listProfiles'], listProfiles, {
    staleTime: 0,
  });
  const activeProfiles = data?.responseData.collection.length || 0;
  const canAddNew = activeProfiles < MAX_PROFILES;

  const handleProfileSelection = async (id: string) => {
    try {
      useAccountStore.setState({ loading: true });
      const response = await enterProfile({ id });
      const profile = response?.responseData;

      if (profile?.credentials?.access_token) {
        const authData: AuthData = {
          jwt: profile.credentials.access_token,
          refreshToken: '',
        };
        persist.setItem(PERSIST_KEY_ACCOUNT, authData);
        persist.setItem(PERSIST_PROFILE, profile.name);
        persist.setItemStorage('inplayer_token', {
          expires: profile.credentials.expires,
          token: profile.credentials.access_token,
          refreshToken: '',
        });
        // useAccountStore.setState({ auth: authData });
        useFavoritesStore.setState({ favorites: [] });
        useWatchHistoryStore.setState({ watchHistory: [] });
        await initializeAccount().finally(() => {
          navigate('/');
        });
      }
    } catch {
      throw new Error('Unable to enter profile.');
    }
  };

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
            onClick={() => handleProfileSelection(profile.id)}
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
