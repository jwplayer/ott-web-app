import React, { useEffect, useState } from 'react';
import { useQuery, UseQueryResult } from 'react-query';
import { useNavigate } from 'react-router';

import profileStyles from './Profiles.module.scss';
import Form from './Form';
import type { ProfileFormValues } from './types';

import styles from '#src/pages/User/User.module.scss';
import { useAccountStore } from '#src/stores/AccountStore';
import type { ListProfilesResponse } from '#types/account';
import { createProfile, listProfiles } from '#src/stores/AccountController';
import LoadingOverlay from '#src/components/LoadingOverlay/LoadingOverlay';
import type { UseFormOnSubmitHandler } from '#src/hooks/useForm';

const AVATARS = [
  'https://gravatar.com/avatar/5e62c8c13582f94b74ae21cfeb83e28a?s=400&d=robohash&r=x',
  'https://gravatar.com/avatar/a82dc2482b1ae8d9070462a37b5e19e9?s=400&d=robohash&r=x',
  'https://gravatar.com/avatar/236030198309afe28c9fce9c3ebfec3b?s=400&d=robohash&r=x',
  'https://gravatar.com/avatar/c97a042d43cc5cc28802f2bc7bf2e5ab?s=400&d=robohash&r=x',
];

const CreateProfile = () => {
  const navigate = useNavigate();
  const { canManageProfiles } = useAccountStore.getState();
  const [fullName, setFullName] = useState<string>('');

  useEffect(() => {
    if (!canManageProfiles) navigate('/');
  }, [canManageProfiles, navigate]);

  // this is only needed so we can set different avatar url which will be temporary
  const { data, isLoading }: UseQueryResult<ListProfilesResponse> = useQuery(['listProfiles'], () => listProfiles(), { staleTime: 0 });
  const activeProfiles = data?.collection?.length || 0;

  const initialValues = {
    name: '',
    adult: 'true',
    avatar_url: '',
    pin: undefined,
  };

  const createProfileHandler: UseFormOnSubmitHandler<ProfileFormValues> = async (formData, { setSubmitting, setErrors }) => {
    try {
      const profile = (
        await createProfile({
          name: formData.name,
          adult: formData.adult === 'true',
          avatar_url: AVATARS[activeProfiles],
        })
      )?.responseData;
      if (profile?.id) {
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

  if (isLoading) return <LoadingOverlay inline />;

  return (
    <div className={styles.user}>
      <div className={styles.leftColumn}>
        <div className={styles.panel}>
          <div className={profileStyles.avatar}>
            <h2>Howdy{`${fullName && ','} ${fullName}`}</h2>
            <img src={AVATARS[activeProfiles]} />
          </div>
        </div>
      </div>
      <div className={styles.mainColumn}>
        <Form initialValues={initialValues} formHandler={createProfileHandler} setFullName={setFullName} />
      </div>
    </div>
  );
};

export default CreateProfile;
