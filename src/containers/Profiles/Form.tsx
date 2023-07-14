import { useEffect } from 'react';
import { type SchemaOf, object, string } from 'yup';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

import profileStyles from './Profiles.module.scss';
import type { ProfileFormValues } from './types';
import AVATARS from './avatarUrls.json';

import Button from '#src/components/Button/Button';
import Dropdown from '#src/components/Dropdown/Dropdown';
import FormFeedback from '#src/components/FormFeedback/FormFeedback';
import TextField from '#src/components/TextField/TextField';
import useForm, { UseFormOnSubmitHandler } from '#src/hooks/useForm';
import styles from '#src/pages/User/User.module.scss';
import LoadingOverlay from '#src/components/LoadingOverlay/LoadingOverlay';
import ProfileBox from '#components/ProfileBox/ProfileBox';
import { useAccountStore } from '#src/stores/AccountStore';

type Props = {
  initialValues: ProfileFormValues;
  formHandler: UseFormOnSubmitHandler<ProfileFormValues>;
  setFullName?: (name: string) => void;
  selectedAvatar?: {
    set: (avatarUrl: string) => void;
    value: string;
  };
  showCancelButton?: boolean;
};

const Form = ({ initialValues, formHandler, setFullName, selectedAvatar, showCancelButton = true }: Props) => {
  const navigate = useNavigate();
  const { t } = useTranslation('user');
  const profile = useAccountStore((s) => s.profile);

  const options: { value: string; label: string }[] = [
    { label: t('profile.adult'), value: 'true' },
    { label: t('profile.kids'), value: 'false' },
  ];

  const validationSchema: SchemaOf<{ name: string }> = object().shape({
    name: string().required('You must enter your full name').min(2, 'You must include at least 2 characters'),
  });

  const { handleSubmit, handleChange, values, errors, submitting, setValue } = useForm(initialValues, formHandler, validationSchema);

  useEffect(() => {
    setValue('avatar_url', selectedAvatar?.value || profile?.avatar_url || '');
  }, [profile?.avatar_url, selectedAvatar?.value, setValue]);

  useEffect(() => {
    setFullName?.(values.name);
  }, [values, setFullName]);

  const formLabel = values?.id ? t('profile.info') : t('profile.create');

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h3>{formLabel}</h3>
        </div>
        <div className={profileStyles.profileInfo}>{t('profile.description')}</div>
        <div className={profileStyles.formFields}>
          {errors.form ? <FormFeedback variant="error">{errors.form}</FormFeedback> : null}
          {submitting && <LoadingOverlay inline />}
          <TextField
            required
            name="name"
            label={t('profile.name')}
            value={values?.name}
            onChange={handleChange}
            error={!!errors.name || !!errors.form}
            helperText={errors.name}
          />
          <Dropdown
            fullWidth
            required
            name="adult"
            label={t('profile.content_rating')}
            helperText={t('profile.content_rating_helper')}
            className={styles.dropdown}
            options={options}
            value={values?.adult?.toString() || 'true'}
            onChange={handleChange}
          />
        </div>
        <hr className={profileStyles.divider} />
        <div className={classNames(styles.panelHeader, profileStyles.noBottomBorder)}>
          <h3>{t('profile.avatar')}</h3>
          <div className={profileStyles.avatarsContainer}>
            {AVATARS.map((avatarUrl) => (
              <ProfileBox
                editMode={false}
                onEdit={() => null}
                onClick={() => selectedAvatar?.set(avatarUrl)}
                selected={selectedAvatar?.value === avatarUrl}
                key={avatarUrl}
                name={''}
                adult={true}
                image={avatarUrl}
              />
            ))}
          </div>
        </div>
        <>
          <Button type="submit" label="Save" variant="outlined" disabled={submitting} />
          {showCancelButton && <Button onClick={() => navigate('/u/profiles')} label="Cancel" variant="text" />}
        </>
      </div>
    </form>
  );
};

export default Form;
