import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import profileStyles from './Profiles.module.scss';
import Form from './Form';
import type { ProfileFormValues } from './types';
import AVATARS from './avatarUrls.json';

import styles from '#src/pages/User/User.module.scss';
import { useAccountStore } from '#src/stores/AccountStore';
import LoadingOverlay from '#src/components/LoadingOverlay/LoadingOverlay';
import type { UseFormOnSubmitHandler } from '#src/hooks/useForm';
import { createProfile } from '#src/stores/AccountController';
import { useListProfiles } from '#src/hooks/useProfiles';

const CreateProfile = () => {
  const navigate = useNavigate();
  const { canManageProfiles } = useAccountStore.getState();
  const [fullName, setFullName] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string>(AVATARS[Math.floor(Math.random() * AVATARS.length)]);

  useEffect(() => {
    if (!canManageProfiles) navigate('/');
  }, [canManageProfiles, navigate]);

  // this is only needed so we can set different avatar url which will be temporary
  const listProfiles = useListProfiles();

  const initialValues = {
    name: '',
    adult: 'true',
    avatar_url: avatarUrl,
    pin: undefined,
  };
  
  const createProfileHandler: UseFormOnSubmitHandler<ProfileFormValues> = async (formData, { setSubmitting, setErrors }) => {
    try {
      const profile = (
        await createProfile({
          name: formData.name,
          adult: formData.adult === 'true',
          avatar_url: formData.avatar_url,
        })
      )?.responseData;
      if (profile?.id) {
        listProfiles.refetch();
        setSubmitting(false);
        navigate('/u/profiles');
      } else {
        setErrors({ form: 'Something went wrong. Please try again later.' });
        setSubmitting(false);
      }
    } catch {
      setErrors({ form: 'Something went wrong. Please try again later.' });
      setSubmitting(false);
    }
  };

  if (listProfiles.isLoading) return <LoadingOverlay inline />;

  return (
    <div className={styles.user}>
      <div className={styles.leftColumn}>
        <div className={styles.panel}>
          <div className={profileStyles.avatar}>
            <h2>Howdy{`${fullName && ','} ${fullName}`}</h2>
            <img src={avatarUrl} />
          </div>
        </div>
      </div>
      <div className={styles.mainColumn}>
        <Form
          initialValues={initialValues}
          formHandler={createProfileHandler}
          setFullName={setFullName}
          selectedAvatar={{
            set: setAvatarUrl,
            value: avatarUrl,
          }}
        />
      </div>
    </div>
  );
};

export default CreateProfile;