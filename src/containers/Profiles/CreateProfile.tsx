import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import AVATARS from './avatarUrls.json';
import Form from './Form';
import type { ProfileFormValues } from './types';

import LoadingOverlay from '#src/components/LoadingOverlay/LoadingOverlay';
import useBreakpoint, { Breakpoint } from '#src/hooks/useBreakpoint';
import type { UseFormOnSubmitHandler } from '#src/hooks/useForm';
import { useCreateProfile, useProfileErrorHandler, useProfiles } from '#src/hooks/useProfiles';
import styles from '#src/pages/User/User.module.scss';

const CreateProfile = () => {
  const navigate = useNavigate();
  const {
    query: { isLoading: loadingProfilesList },
    profilesEnabled,
  } = useProfiles();

  const [avatarUrl, setAvatarUrl] = useState<string>(AVATARS[Math.floor(Math.random() * AVATARS.length)]);

  const breakpoint: Breakpoint = useBreakpoint();
  const isMobile = breakpoint === Breakpoint.xs;

  useEffect(() => {
    if (!profilesEnabled) navigate('/');
  }, [profilesEnabled, navigate]);

  const initialValues = {
    name: '',
    adult: 'true',
    avatar_url: avatarUrl,
    pin: undefined,
  };

  const createProfile = useCreateProfile();

  const handleErrors = useProfileErrorHandler();

  const createProfileHandler: UseFormOnSubmitHandler<ProfileFormValues> = async (formData, { setSubmitting, setErrors }) =>
    createProfile.mutate(
      {
        name: formData.name,
        adult: formData.adult === 'true',
        avatar_url: formData.avatar_url,
      },
      {
        onError: (e: unknown) => handleErrors(e, setErrors),
        onSettled: () => {
          setSubmitting(false);
        },
      },
    );

  if (loadingProfilesList) return <LoadingOverlay />;

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
