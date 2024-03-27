import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import useBreakpoint, { Breakpoint } from '@jwp/ott-ui-react/src/hooks/useBreakpoint';
import type { UseFormOnSubmitHandler } from '@jwp/ott-hooks-react/src/useForm';
import { useCreateProfile, useProfileErrorHandler, useProfiles } from '@jwp/ott-hooks-react/src/useProfiles';
import type { ProfileFormValues } from '@jwp/ott-common/types/profiles';
import { createURL } from '@jwp/ott-common/src/utils/urlFormatting';
import { PATH_USER_PROFILES } from '@jwp/ott-common/src/paths';

import styles from '../../pages/User/User.module.scss';
import LoadingOverlay from '../../components/LoadingOverlay/LoadingOverlay';

import Form from './Form';
import AVATARS from './avatarUrls.json';

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

  const createProfile = useCreateProfile({
    onSuccess: (res) => {
      const id = res?.id;

      !!id && navigate(createURL(PATH_USER_PROFILES, { success: 'true', id }));
    },
  });

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
