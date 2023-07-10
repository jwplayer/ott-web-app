import React, { useMemo, useState } from 'react';
import { useQuery, UseQueryResult } from 'react-query';
import { useLocation, useNavigate, useParams } from 'react-router';

import profileStyles from './Profiles.module.scss';
import Form from './Form';
import DeleteProfile from './DeleteProfile';

import styles from '#src/pages/User/User.module.scss';
import { getProfileDetails, updateProfile } from '#src/services/inplayer.account.service';
import type { Profile, ProfilePayload } from '#types/account';
import LoadingOverlay from '#src/components/LoadingOverlay/LoadingOverlay';
import type { UseFormOnSubmitHandler } from '#src/hooks/useForm';
import Button from '#src/components/Button/Button';
import { addQueryParam } from '#src/utils/location';
import FormFeedback from '#src/components/FormFeedback/FormFeedback';

const EditProfile = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState<string>('');

  const {
    data: profileDetails,
    isLoading,
    isFetching,
  }: UseQueryResult<Profile> = useQuery(['getProfileDetails'], () => getProfileDetails(null, true, id), {
    staleTime: 0,
  });

  const initialValues = useMemo(() => {
    return {
      id: profileDetails?.id || '',
      name: profileDetails?.name || '',
      adult: profileDetails?.adult ?? true,
      avatar_url: profileDetails?.avatar_url || '',
      pin: null,
    };
  }, [profileDetails]);

  const updateProfileHandler: UseFormOnSubmitHandler<ProfilePayload> = async (formData, { setErrors, setSubmitting }) => {
    try {
      const adult = formData.adult.toString() === 'true' ? true : false;
      const profile = await updateProfile(null, true, {
        id: formData.id,
        name: formData.name,
        adult,
        avatar_url: formData.avatar_url,
      });

      if (profile?.id) {
        setSubmitting(false);
        navigate('/u/profiles');
      } else {
        setErrors({ form: profile?.message || 'Something went wrong. Please try again later.' });
        setSubmitting(false);
      }
    } catch {
      setErrors({ form: 'Something went wrong. Please try again later.' });
      setSubmitting(false);
    }
  };

  if (isLoading || isFetching) return <LoadingOverlay inline />;

  return (
    <div className={styles.user}>
      <div className={styles.leftColumn}>
        <div className={styles.panel}>
          <div className={profileStyles.avatar}>
            <h2>Howdy{`${fullName && ','} ${fullName}`}</h2>
            <img src={profileDetails?.avatar_url} />
          </div>
        </div>
      </div>
      <div className={styles.mainColumn}>
        <Form initialValues={initialValues} formHandler={updateProfileHandler} setFullName={setFullName} />
        <div className={styles.panel}>
          <h2 className={styles.panelHeader}>Delete profile</h2>
          {profileDetails?.default && <FormFeedback variant="info">The main profile cannot be deleted.</FormFeedback>}
          <Button
            onClick={() => navigate(addQueryParam(location, 'action', 'delete-profile'))}
            label="Delete profile"
            variant="contained"
            color="delete"
            disabled={profileDetails?.default}
          />
        </div>
      </div>
      <DeleteProfile />
    </div>
  );
};

export default EditProfile;
