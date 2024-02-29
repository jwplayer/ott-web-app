import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { useLocation, useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { getModule } from '@jwp/ott-common/src/modules/container';
import ProfileController from '@jwp/ott-common/src/controllers/ProfileController';
import type { UseFormOnSubmitHandler } from '@jwp/ott-hooks-react/src/useForm';
import { useProfileErrorHandler, useUpdateProfile } from '@jwp/ott-hooks-react/src/useProfiles';
import useBreakpoint, { Breakpoint } from '@jwp/ott-ui-react/src/hooks/useBreakpoint';
import type { ProfileFormValues } from '@jwp/ott-common/types/profiles';
import { PATH_USER_PROFILES } from '@jwp/ott-common/src/paths';

import styles from '../../pages/User/User.module.scss';
import LoadingOverlay from '../../components/LoadingOverlay/LoadingOverlay';
import Button from '../../components/Button/Button';
import { createURLFromLocation } from '../../utils/location';

import DeleteProfile from './DeleteProfile';
import Form from './Form';
import profileStyles from './Profiles.module.scss';

type EditProfileProps = {
  contained?: boolean;
};

const EditProfile = ({ contained = false }: EditProfileProps) => {
  const params = useParams();
  const { id } = params;
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation('user');

  const profileController = getModule(ProfileController);

  const breakpoint: Breakpoint = useBreakpoint();
  const isMobile = breakpoint === Breakpoint.xs;

  const {
    data: profileDetails,
    isLoading,
    isFetching,
  } = useQuery(['getProfileDetails'], () => profileController.getProfileDetails({ id: id || '' }), {
    staleTime: 0,
  });

  const initialValues = useMemo(() => {
    return {
      id: profileDetails?.id || '',
      name: profileDetails?.name || '',
      adult: profileDetails?.adult ? 'true' : 'false',
      avatar_url: profileDetails?.avatar_url || '',
      pin: undefined,
    };
  }, [profileDetails?.id, profileDetails?.name, profileDetails?.adult, profileDetails?.avatar_url]);

  const [selectedAvatar, setSelectedAvatar] = useState<string | undefined>(initialValues?.avatar_url);

  useEffect(() => {
    setSelectedAvatar(profileDetails?.avatar_url);
  }, [profileDetails?.avatar_url]);

  if (!id || (!isFetching && !isLoading && !profileDetails)) {
    navigate(PATH_USER_PROFILES);
  }

  const updateProfile = useUpdateProfile({ onSuccess: () => navigate(PATH_USER_PROFILES) });

  const handleErrors = useProfileErrorHandler();

  const updateProfileHandler: UseFormOnSubmitHandler<ProfileFormValues> = async (formData, { setErrors, setSubmitting }) =>
    updateProfile.mutate(
      {
        id: id,
        name: formData.name,
        adult: formData.adult === 'true',
        avatar_url: formData.avatar_url || profileDetails?.avatar_url,
      },
      {
        onError: (e: unknown) => handleErrors(e, setErrors),
        onSettled: () => {
          setSubmitting(false);
        },
      },
    );

  if (isLoading || isFetching) return <LoadingOverlay />;

  return (
    <div className={classNames(styles.user, contained && profileStyles.contained)}>
      <div className={classNames(styles.mainColumn)}>
        <Form
          initialValues={initialValues}
          formHandler={updateProfileHandler}
          selectedAvatar={{
            set: setSelectedAvatar,
            value: selectedAvatar || '',
          }}
          showCancelButton={!contained}
          isMobile={isMobile}
        />
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>{t('profile.delete')}</h2>
          </div>
          <div className={profileStyles.profileInfo}>{t(profileDetails?.default ? 'profile.delete_main' : 'profile.delete_description')}</div>
          {!profileDetails?.default && (
            <Button
              onClick={() => navigate(createURLFromLocation(location, { action: 'delete-profile' }))}
              label={t('profile.delete')}
              variant="contained"
              color="delete"
              fullWidth={isMobile}
            />
          )}
        </div>
      </div>
      <DeleteProfile />
    </div>
  );
};

export default EditProfile;
