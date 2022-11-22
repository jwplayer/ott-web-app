import React from 'react';
import { useTranslation } from 'react-i18next';

import styles from './PersonalDetailsForm.module.scss';

import TextField from '#components/TextField/TextField';
import Button from '#components/Button/Button';
import Dropdown from '#components/Dropdown/Dropdown';
import Checkbox from '#components/Checkbox/Checkbox';
import Radio from '#components/Radio/Radio';
import DateField from '#components/DateField/DateField';
import LoadingOverlay from '#components/LoadingOverlay/LoadingOverlay';
import FormFeedback from '#components/FormFeedback/FormFeedback';
import { testId } from '#src/utils/common';
import type { FormErrors } from '#types/form';
import type { PersonalDetailsFormData, CleengCaptureField, CleengCaptureQuestionField } from '#types/account';

type Props = {
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  setValue: (key: keyof PersonalDetailsFormData, value: string) => void;
  error?: string;
  errors: FormErrors<PersonalDetailsFormData>;
  values: PersonalDetailsFormData;
  submitting: boolean;
  fields: Record<string, CleengCaptureField>;
  questions: CleengCaptureQuestionField[];
  onQuestionChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  questionValues: Record<string, string>;
  questionErrors: Record<string, string>;
};

const PersonalDetailsForm: React.FC<Props> = ({
  onSubmit,
  onChange,
  setValue,
  values,
  errors,
  submitting,
  fields,
  questions,
  onQuestionChange,
  questionValues,
  questionErrors,
}: Props) => {
  const { t } = useTranslation('account');
  const renderQuestion = ({ value, key, question, required }: CleengCaptureQuestionField) => {
    const values = value?.split(';') || [];
    const props = {
      name: key,
      onChange: onQuestionChange,
      error: !!questionErrors[key],
      helperText: questionErrors[key],
      required,
      key,
    };

    if (values.length === 1) {
      return <Checkbox checked={!!questionValues[key]} value={values[0]} header={question} label={values[0]} {...props} />;
    } else if (values.length === 2) {
      return <Radio values={values} value={questionValues[key]} header={question} {...props} />;
    } else if (values.length > 2) {
      return <Dropdown options={values} value={questionValues[key]} label={question} defaultLabel={t('personal_details.select_answer')} {...props} fullWidth />;
    }

    return null;
  };

  return (
    <form onSubmit={onSubmit} data-testid={testId('personal_details-form')} noValidate>
      <h2 className={styles.title}>{t('personal_details.title')}</h2>
      {errors.form ? <FormFeedback variant="error">{errors.form}</FormFeedback> : null}
      {fields.firstNameLastName?.enabled ? (
        <React.Fragment>
          <TextField
            value={values.firstName}
            onChange={onChange}
            label={t('personal_details.fist_name')}
            placeholder={t('personal_details.fist_name')}
            error={!!errors.firstName || !!errors.form}
            helperText={errors.firstName}
            required={fields.firstNameLastName.required}
            name="firstName"
          />
          <TextField
            value={values.lastName}
            onChange={onChange}
            label={t('personal_details.last_name')}
            placeholder={t('personal_details.last_name')}
            error={!!errors.lastName || !!errors.form}
            helperText={errors.lastName}
            required={fields.firstNameLastName.required}
            name="lastName"
          />
        </React.Fragment>
      ) : null}
      {fields.companyName?.enabled ? (
        <TextField
          value={values.companyName}
          onChange={onChange}
          label={t('personal_details.company_name')}
          placeholder={t('personal_details.company_name')}
          error={!!errors.companyName || !!errors.form}
          helperText={errors.companyName}
          required={fields.companyName.required}
          name="companyName"
        />
      ) : null}
      {fields.address?.enabled ? (
        <React.Fragment>
          <TextField
            value={values.address}
            onChange={onChange}
            label={t('personal_details.address')}
            placeholder={t('personal_details.address')}
            error={!!errors.address || !!errors.form}
            helperText={errors.address}
            required={fields.address.required}
            name="address"
          />
          <TextField
            value={values.address2}
            onChange={onChange}
            label={t('personal_details.address2')}
            placeholder={t('personal_details.address2')}
            error={!!errors.address2 || !!errors.form}
            helperText={errors.address2}
            name="address2"
          />
          <TextField
            value={values.city}
            onChange={onChange}
            label={t('personal_details.city')}
            placeholder={t('personal_details.city')}
            error={!!errors.city || !!errors.form}
            helperText={errors.city}
            required={fields.address.required}
            name="city"
          />
          <TextField
            value={values.state}
            onChange={onChange}
            label={t('personal_details.state')}
            placeholder={t('personal_details.state')}
            error={!!errors.state || !!errors.form}
            helperText={errors.state}
            required={fields.address.required}
            name="state"
          />
          <TextField
            value={values.postCode}
            onChange={onChange}
            label={t('personal_details.post_code')}
            placeholder={t('personal_details.post_code')}
            error={!!errors.postCode || !!errors.form}
            helperText={errors.postCode}
            required={fields.address.required}
            name="postCode"
          />
        </React.Fragment>
      ) : null}
      {fields.phoneNumber?.enabled ? (
        <TextField
          value={values.phoneNumber}
          onChange={onChange}
          label={t('personal_details.phone_number')}
          placeholder={t('personal_details.phone_number')}
          error={!!errors.phoneNumber || !!errors.form}
          helperText={errors.phoneNumber}
          required={fields.phoneNumber.required}
          name="phoneNumber"
        />
      ) : null}
      {fields.birthDate?.enabled ? (
        <DateField
          value={values.birthDate}
          onChange={(value) => setValue('birthDate', value)}
          label={t('personal_details.birth_date')}
          placeholder={t('personal_details.birth_date')}
          error={!!errors.birthDate || !!errors.form}
          helperText={errors.birthDate}
          required={fields.birthDate.required}
          name="birthDate"
        />
      ) : null}
      {questions.map((question) => renderQuestion(question))}
      <Button
        className={styles.continue}
        type="submit"
        label={t('personal_details.continue')}
        variant="contained"
        color="primary"
        size="large"
        disabled={submitting}
        fullWidth
      />
      {submitting && <LoadingOverlay transparentBackground inline />}
    </form>
  );
};

export default PersonalDetailsForm;
