import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { useLocation, useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

import profileStyles from './Profiles.module.scss';
import Form from './Form';
import DeleteProfile from './DeleteProfile';
import type { ProfileFormValues } from './types';

import styles from '#src/pages/User/User.module.scss';
import LoadingOverlay from '#src/components/LoadingOverlay/LoadingOverlay';
import type { UseFormOnSubmitHandler } from '#src/hooks/useForm';
import Button from '#src/components/Button/Button';
import { addQueryParam } from '#src/utils/location';
import { useUpdateProfile } from '#src/hooks/useProfiles';
import useBreakpoint, { Breakpoint } from '#src/hooks/useBreakpoint';
import { getProfileDetails } from '#src/stores/ProfileController';

type EditProfileProps = {
  contained?: boolean;
};

const EditProfile = ({ contained = false }: EditProfileProps) => {
  const params = useParams();
  const { id } = params;
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation('user');

  const breakpoint: Breakpoint = useBreakpoint();
  const isMobile = breakpoint === Breakpoint.xs;

  const { data, isLoading, isFetching } = useQuery(['getProfileDetails'], () => getProfileDetails({ id: id || '' }), {
    staleTime: 0,
  });

  const profileDetails = data?.responseData;

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
    navigate('/u/profiles');
  }

  const updateProfile = useUpdateProfile();

  const updateProfileHandler: UseFormOnSubmitHandler<ProfileFormValues> = async (formData, { setErrors, setSubmitting }) =>
    updateProfile.mutate(
      {
        id: id,
        name: formData.name,
        adult: formData.adult === 'true',
        avatar_url: formData.avatar_url || profileDetails?.avatar_url,
      },
      {
        onSettled: () => {
          setSubmitting(false);
        },
        onError: () => {
          setErrors({ form: t('profile.form_error') });
        },
      },
    );

  if (isLoading || isFetching) return <LoadingOverlay inline />;

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
            <h3>{t('profile.delete')}</h3>
          </div>
          <div className={profileStyles.profileInfo}>{t(profileDetails?.default ? 'profile.delete_main' : 'profile.delete_description')}</div>
          {!profileDetails?.default && (
            <Button
              onClick={() => navigate(addQueryParam(location, 'action', 'delete-profile'))}
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
