import React from 'react';
import { useTranslation } from 'react-i18next';
import type { PersonalDetailsFormData, PersonalDetailsCustomField } from 'types/account';
import type { FormErrors } from 'types/form';

import TextField from '../TextField/TextField';
import Button from '../Button/Button';
import Dropdown from '../Dropdown/Dropdown';
import Checkbox from '../Checkbox/Checkbox';
import Radio from '../Radio/Radio';
import DateField from '../DateField/DateField';

import styles from './PersonalDetailsForm.module.scss';

type Props = {
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  error?: string;
  errors: FormErrors<PersonalDetailsFormData>;
  values: PersonalDetailsFormData;
  submitting: boolean;
  fields: PersonalDetailsCustomField[];
};

const PersonalDetailsForm: React.FC<Props> = ({ onSubmit, onChange, values, errors, submitting, fields }: Props) => {
  const { t } = useTranslation('account');

  const renderCustomFields = () =>
    fields.map((field, index) => {
      if (field.type === 'dropdown') {
        return (
          <Dropdown
            key={index}
            value={values[field.name]}
            onChange={onChange}
            label={field.question}
            options={field.values}
            name={field.name}
            fullWidth
          />
        );
      }

      if (field.type === 'radio') {
        return <Radio name={field.name} header={field.question} key={index} values={field.values} onChange={onChange} />;
      }

      if (field.type === 'checkbox') {
        return (
          <Checkbox
            header={field.question}
            key={index}
            checked={false}
            value={field.question ?? ''}
            onChange={onChange}
            label={field.label}
            name={field.name}
          />
        );
      }

      if (field.type === 'date') {
        return (
          <DateField
            key={index}
            value={values[field.name]}
            onChange={onChange}
            label={field.label}
            placeholder={'mm/dd/yyyy'}
            error={!!errors[field.name]}
            helperText={errors[field.name]}
            name={field.name}
          />
        );
      }

      return (
        <TextField
          key={index}
          value={values[field.name]}
          onChange={onChange}
          label={field.label}
          placeholder={field.label}
          error={!!errors[field.name] || !!errors.form}
          helperText={errors[field.name]}
          name={field.name}
          type={field.type}
        />
      );
    });

  return (
    <form className={styles.form} onSubmit={onSubmit} data-testid="personal_details-form">
      <h2 className={styles.title}>{t('personal_details.title')}</h2>
      {errors.form ? <div className={styles.error}>{errors.form}</div> : null}
      {renderCustomFields()}
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
    </form>
  );
};

export default PersonalDetailsForm;
