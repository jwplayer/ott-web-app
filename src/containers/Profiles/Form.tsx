import { useEffect } from 'react';
import { type SchemaOf, object, string } from 'yup';
import { useNavigate } from 'react-router';

import profileStyles from './Profiles.module.scss';

import Button from '#src/components/Button/Button';
import Dropdown from '#src/components/Dropdown/Dropdown';
import FormFeedback from '#src/components/FormFeedback/FormFeedback';
import TextField from '#src/components/TextField/TextField';
import useForm, { UseFormOnSubmitHandler } from '#src/hooks/useForm';
import styles from '#src/pages/User/User.module.scss';
import type { ProfilePayload } from '#types/account';
import LoadingOverlay from '#src/components/LoadingOverlay/LoadingOverlay';

type Props = {
  initialValues: ProfilePayload;
  formHandler: UseFormOnSubmitHandler<ProfilePayload>;
  setFullName?: (name: string) => void;
};

const Form = ({ initialValues, formHandler, setFullName }: Props) => {
  const navigate = useNavigate();

  const options: { value: string; label: string }[] = [
    { label: 'Adult', value: 'true' },
    { label: 'Kids', value: 'false' },
  ];

  const validationSchema: SchemaOf<{ name: string }> = object().shape({
    name: string().required('You must enter your full name').min(2, 'You must include at least 2 characters'),
  });

  const { handleSubmit, handleChange, values, errors, submitting } = useForm(initialValues, formHandler, validationSchema);

  useEffect(() => {
    setFullName?.(values.name);
  }, [values, setFullName]);

  const formLabel = values?.id ? 'Edit your profile' : 'Create your profile';

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className={styles.panel}>
        <h2 className={styles.panelHeader}>{formLabel}</h2>
        <div className={profileStyles.formFields}>
          {errors.form ? <FormFeedback variant="error">{errors.form}</FormFeedback> : null}
          {submitting && <LoadingOverlay inline />}
          <TextField
            required
            name="name"
            label="Full name"
            value={values?.name}
            onChange={handleChange}
            error={!!errors.name || !!errors.form}
            helperText={errors.name}
          />
          <Dropdown
            fullWidth
            required
            name="adult"
            label="Content rating"
            helperText="Content 12+ will not be available for kids profiles"
            className={styles.dropdown}
            options={options}
            value={values?.adult?.toString() || 'true'}
            onChange={handleChange}
          />
        </div>
        <>
          <Button type="submit" label="Save" variant="outlined" disabled={submitting} />
          <Button onClick={() => navigate('/u/profiles')} label="Cancel" variant="text" />
        </>
      </div>
    </form>
  );
};

export default Form;
