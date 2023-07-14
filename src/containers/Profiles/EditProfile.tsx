import React, { useMemo, useState } from 'react';
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
import FormFeedback from '#src/components/FormFeedback/FormFeedback';
import { getProfileDetails, updateProfile } from '#src/stores/AccountController';
import { useListProfiles } from '#src/hooks/useProfiles';

type EditProfileProps = {
  contained?: boolean;
};

const EditProfile = ({ contained = false }: EditProfileProps) => {
  const params = useParams();
  const { id } = params;
  const location = useLocation();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState<string>('');
  const { t } = useTranslation('user');

  const listProfiles = useListProfiles();

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
  }, [profileDetails]);

  const [selectedAvatar, setSelectedAvatar] = useState<string | undefined>(initialValues.avatar_url);

  if (!id) {
    navigate('/u/profiles');
  }

  const updateProfileHandler: UseFormOnSubmitHandler<ProfileFormValues> = async (formData, { setErrors, setSubmitting }) => {
    try {
      const response = await updateProfile({
        id: id,
        name: formData.name,
        adult: formData.adult === 'true',
        avatar_url: formData.avatar_url || profileDetails?.avatar_url,
      });

      const profile = response?.responseData;

      if (profile?.id) {
        setSubmitting(false);
        listProfiles.refetch();
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

  if (isLoading || isFetching) return <LoadingOverlay inline />;

  return (
    <div className={classNames(styles.user, contained && profileStyles.contained)}>
      {!contained && (
        <div className={styles.leftColumn}>
          <div className={styles.panel}>
            <div className={profileStyles.avatar}>
              <h2>
                {t('profile.greeting')}
                {`${fullName && ','} ${fullName}`}
              </h2>
              <img src={profileDetails?.avatar_url} />
            </div>
          </div>
        </div>
      )}
      <div className={classNames(styles.mainColumn)}>
        <Form
          initialValues={initialValues}
          formHandler={updateProfileHandler}
          setFullName={setFullName}
          selectedAvatar={{
            set: setSelectedAvatar,
            value: selectedAvatar || '',
          }}
        />
        <div className={styles.panel}>
          <h2 className={styles.panelHeader}>{t('profile.delete')}</h2>
          {profileDetails?.default && <FormFeedback variant="info">{t('profile.delete_main')}</FormFeedback>}
          <Button
            onClick={() => navigate(addQueryParam(location, 'action', 'delete-profile'))}
            label={t('profile.delete')}
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
