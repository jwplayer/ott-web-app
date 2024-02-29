import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { shallow } from '@jwp/ott-common/src/utils/compare';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useAccountStore } from '@jwp/ott-common/src/stores/AccountStore';
import { useProfiles, useSelectProfile } from '@jwp/ott-hooks-react/src/useProfiles';
import useBreakpoint, { Breakpoint } from '@jwp/ott-ui-react/src/hooks/useBreakpoint';
import { PATH_USER_PROFILES, PATH_USER_PROFILES_CREATE, PATH_USER_PROFILES_EDIT } from '@jwp/ott-common/src/paths';
import type { Profile } from '@jwp/ott-common/types/profiles';

import ProfileBox from '../../components/ProfileBox/ProfileBox';
import AddNewProfile from '../../components/ProfileBox/AddNewProfile';
import LoadingOverlay from '../../components/LoadingOverlay/LoadingOverlay';
import Button from '../../components/Button/Button';
import Alert from '../../components/Alert/Alert';

import styles from './Profiles.module.scss';

const MAX_PROFILES = 4;

type Props = {
  editMode?: boolean;
};

const Profiles = ({ editMode = false }: Props) => {
  const navigate = useNavigate();
  const { t } = useTranslation('user');
  const { loading, user } = useAccountStore(({ loading, user }) => ({ loading, user }), shallow);

  const [params] = useSearchParams();
  const creationSuccess = params.get('success') === 'true';
  const createdProfileId = params.get('id');

  const breakpoint: Breakpoint = useBreakpoint();
  const isMobile = breakpoint === Breakpoint.xs;

  const {
    query: { data, isLoading, isFetching, isError },
    profilesEnabled,
  } = useProfiles();

  const activeProfiles = data?.collection.length || 0;
  const canAddNew = activeProfiles < MAX_PROFILES;

  useEffect(() => {
    if (!profilesEnabled || !user?.id || isError) {
      navigate('/');
    }
  }, [profilesEnabled, navigate, user?.id, isError]);

  const selectProfile = useSelectProfile({
    onSuccess: () => navigate('/'),
    onError: () => navigate(PATH_USER_PROFILES),
  });

  const createdProfileData = data?.collection.find((profile: Profile) => profile.id === createdProfileId);

  if (loading || isLoading || isFetching) return <LoadingOverlay />;

  return (
    <>
      <div className={styles.wrapper}>
        {activeProfiles === 0 ? (
          <div className={styles.headings}>
            <p className={styles.paragraph}>{t('profile.no_one_watching')}</p>
            <h2 className={styles.heading}>{t('profile.create_message')}</h2>
          </div>
        ) : (
          <h2 className={styles.heading}>{t('account.who_is_watching')}</h2>
        )}
        <div className={styles.flex}>
          {data?.collection?.map((profile: Profile) => (
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
          {canAddNew && <AddNewProfile onClick={() => navigate(PATH_USER_PROFILES_CREATE)} />}
        </div>
        {activeProfiles > 0 && (
          <div className={styles.buttonContainer}>
            {!editMode ? (
              <Button
                onClick={() => navigate(PATH_USER_PROFILES_EDIT)}
                label={t('account.manage_profiles')}
                variant="outlined"
                size="large"
                fullWidth={isMobile}
              />
            ) : (
              <Button onClick={() => navigate(PATH_USER_PROFILES)} label={t('profile.done')} variant="outlined" size="large" fullWidth={isMobile} />
            )}
          </div>
        )}
      </div>
      <Alert
        isSuccess
        open={creationSuccess}
        titleOverride={t('profile.created_title')}
        message={t('profile.created_message')}
        onClose={() => navigate(PATH_USER_PROFILES)}
        actionsOverride={
          <div className={styles.modalActions}>
            <Button to="/u/profiles" label={t('profile.back_to_profiles')} variant="text" fullWidth={isMobile} />
            <Button
              onClick={() => {
                navigate(PATH_USER_PROFILES);
                createdProfileId && selectProfile.mutate({ id: createdProfileId, avatarUrl: createdProfileData?.avatar_url ?? '' });
              }}
              label={t('profile.watch_now')}
              variant="outlined"
              color="primary"
              fullWidth={isMobile}
            />
          </div>
        }
      />
    </>
  );
};

export default Profiles;
