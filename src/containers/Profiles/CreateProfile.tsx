import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import Form from './Form';
import AVATARS from './avatarUrls.json';
import type { ProfileFormValues } from './types';

import LoadingOverlay from '#src/components/LoadingOverlay/LoadingOverlay';
import useBreakpoint, { Breakpoint } from '#src/hooks/useBreakpoint';
import type { UseFormOnSubmitHandler } from '#src/hooks/useForm';
import { useCreateProfile, useProfiles } from '#src/hooks/useProfiles';
import styles from '#src/pages/User/User.module.scss';

const CreateProfile = () => {
  const navigate = useNavigate();
  const { profilesEnabled } = useProfiles();

  const [avatarUrl, setAvatarUrl] = useState<string>(AVATARS[Math.floor(Math.random() * AVATARS.length)]);

  const { t } = useTranslation('user');

  const breakpoint: Breakpoint = useBreakpoint();
  const isMobile = breakpoint === Breakpoint.xs;

  useEffect(() => {
    if (!profilesEnabled) navigate('/');
  }, [profilesEnabled, navigate]);

  const { isLoading: loadingProfilesList } = useProfiles();

  const initialValues = {
    name: '',
    adult: 'true',
    avatar_url: avatarUrl,
    pin: undefined,
  };

  const createProfile = useCreateProfile();

  const createProfileHandler: UseFormOnSubmitHandler<ProfileFormValues> = async (formData, { setSubmitting, setErrors }) =>
    createProfile.mutate(
      {
        name: formData.name,
        adult: formData.adult === 'true',
        avatar_url: formData.avatar_url,
      },
      {
        onError: () => {
          setErrors({ form: t('profile.form_error') });
        },
        onSettled: () => {
          setSubmitting(false);
        },
      },
    );

  if (loadingProfilesList) return <LoadingOverlay inline />;

  return (
    <div className={styles.user}>
      <div className={styles.mainColumn}>
        <Form
          initialValues={initialValues}
          formHandler={createProfileHandler}
          selectedAvatar={{
            set: setAvatarUrl,
            value: avatarUrl,
          }}
          isMobile={isMobile}
        />
      </div>
    </div>
  );
};

export default CreateProfile;
