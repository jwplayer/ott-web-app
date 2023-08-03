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
import { useProfileStore } from '#src/stores/ProfileStore';

type Props = {
  initialValues: ProfileFormValues;
  formHandler: UseFormOnSubmitHandler<ProfileFormValues>;
  selectedAvatar?: {
    set: (avatarUrl: string) => void;
    value: string;
  };
  showCancelButton?: boolean;
  showContentRating?: boolean;
  isMobile?: boolean;
};

const Form = ({ initialValues, formHandler, selectedAvatar, showCancelButton = true, showContentRating = false, isMobile = false }: Props) => {
  const navigate = useNavigate();
  const { t } = useTranslation('user');
  const { profile } = useProfileStore();

  const options: { value: string; label: string }[] = [
    { label: t('profile.adult'), value: 'true' },
    { label: t('profile.kids'), value: 'false' },
  ];

  const validationSchema: SchemaOf<{ name: string }> = object().shape({
    name: string().required(t('profile.validation.name.required')).min(2, t('profile.validation.name.too_short')),
  });

  const { handleSubmit, handleChange, values, errors, submitting, setValue } = useForm(initialValues, formHandler, validationSchema);
  const isDirty = Object.entries(values).some(([k, v]) => v !== initialValues[k as keyof typeof initialValues]);
  useEffect(() => {
    setValue('avatar_url', selectedAvatar?.value || profile?.avatar_url || '');
  }, [profile?.avatar_url, selectedAvatar?.value, setValue]);

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
          <h2 className={profileStyles.nameHeading}>Name</h2>
          <TextField
            required
            name="name"
            label={t('profile.name')}
            value={values?.name}
            onChange={handleChange}
            error={!!errors.name || !!errors.form}
            helperText={errors.name}
          />
          {showContentRating && (
            <Dropdown
              fullWidth
              required
              name="adult"
              label={t('profile.content_rating')}
              className={styles.dropdown}
              options={options}
              value={values?.adult?.toString() || 'true'}
              onChange={handleChange}
            />
          )}
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
                adult={true}
                image={avatarUrl}
              />
            ))}
          </div>
        </div>
        <>
          <Button type="submit" label={t('account.save')} variant="outlined" disabled={!isDirty || submitting} fullWidth={isMobile} />
          {showCancelButton && <Button onClick={() => navigate('/u/profiles')} label={t('account.cancel')} variant="text" fullWidth={isMobile} />}
        </>
      </div>
    </form>
  );
};

export default Form;
