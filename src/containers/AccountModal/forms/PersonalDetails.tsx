import React, { useCallback } from 'react';
import { object, SchemaOf, AnySchema } from 'yup';
import type { PersonalDetailsFormData, PersonalDetailsCustomField } from 'types/account';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router';
import type Reference from 'yup/lib/Reference';
import type Lazy from 'yup/lib/Lazy';

import { createYupSchema } from '../../../utils/yupSchemaCreator';
import PersonalDetailsForm from '../../../components/PersonalDetailsForm/PersonalDetailsForm';
import useForm, { UseFormOnSubmitHandler } from '../../../hooks/useForm';
import { addQueryParam } from '../../../utils/history';
import { deconstructCustomField, CleengCaptureField } from '../../../utils/cleengUtils';

const temp = (t: PersonalDetailsFormData) => {
  t;
};

const PersonalDetails = () => {
  const history = useHistory();
  const { t } = useTranslation('account');

  const getCaptureFields = useCallback(
    (settings: CleengCaptureField[]) => {
      const fields: PersonalDetailsCustomField[] = [];
      const initialValues: PersonalDetailsFormData = {};

      settings.forEach((field) => {
        const { key, required, answer, question, enabled } = field;

        if (!enabled) return;

        if (key === 'address' || key === 'firstNameLastName') {
          for (const nestedField in answer as Record<string, unknown>) {
            initialValues[nestedField] = '';

            fields.push({
              name: nestedField,
              label: t(`personal_details.${nestedField}`),
              validationType: 'string',
              type: 'text',
              validations: required ? [{ type: 'required', params: [t('PersonalDetails.field_required')] }] : null,
            });
          }
        }

        if (key === 'companyName') {
          initialValues[key] = '';

          fields.push({
            name: key,
            label: t(`personal_details.${key}`),
            validationType: 'string',
            type: 'text',
            validations: required ? [{ type: 'required', params: [t('PersonalDetails.field_required')] }] : null,
          });
        }

        if (key === 'birthDate') {
          initialValues[key] = '';

          fields.push({
            name: key,
            label: t(`personal_details.${key}`),
            validationType: 'string',
            type: 'date',
            validations: required ? [{ type: 'required', params: [t('PersonalDetails.field_required')] }] : null,
          });
        }

        if ('question' in field) {
          initialValues[key] = '';

          fields.push({
            name: key,
            label: key,
            type: deconstructCustomField(field).type,
            validationType: deconstructCustomField(field).type,
            validations: required ? [{ type: 'required', params: [t('PersonalDetails.field_required')] }] : null,
            value: deconstructCustomField(field).value,
            values: deconstructCustomField(field).values,
            question,
          });
        }
      });

      return { fields, initialValues };
    },
    [t],
  );

  const PersonalDetailsubmitHandler: UseFormOnSubmitHandler<PersonalDetailsFormData> = async (formData, { setErrors, setSubmitting }) => {
    try {
      await temp(formData);

      history.push(addQueryParam(history, 'u', 'personal-details'));
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.toLowerCase().includes('invalid param email')) {
          setErrors({ email: t('personal_details.invalid_email') });
        } else if (error.message.toLowerCase().includes('invalid param password')) {
          setErrors({ form: t('personal_details.invalid_password') });
        }
      }
    }

    setSubmitting(false);
  };

  const yepSchema: unknown = getCaptureFields(dummy).fields.reduce(createYupSchema, {});
  console.info(yepSchema);
  const validationSchema: SchemaOf<PersonalDetailsFormData> = object().shape(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    yepSchema as Record<string, AnySchema<any, any, any> | Lazy<any, any> | Reference<unknown>>,
  ) as SchemaOf<PersonalDetailsFormData>;

  const initialValues: PersonalDetailsFormData = getCaptureFields(dummy).initialValues;

  const { handleSubmit, handleChange, values, errors, submitting } = useForm<PersonalDetailsFormData>(
    initialValues,
    PersonalDetailsubmitHandler,
    validationSchema,
  );

  return (
    <PersonalDetailsForm
      fields={getCaptureFields(dummy).fields}
      onSubmit={handleSubmit}
      onChange={handleChange}
      values={values}
      errors={errors}
      submitting={submitting}
    />
  );
};

export default PersonalDetails;

const dummy = [
  {
    key: 'firstNameLastName',
    enabled: true,
    required: false,
    answer: {
      firstName: null,
      lastName: null,
    },
  },
  {
    key: 'birthDate',
    enabled: true,
    required: true,
    answer: null,
  },
  {
    key: 'companyName',
    enabled: false,
    required: true,
    answer: null,
  },
  {
    key: 'phoneNumber',
    enabled: true,
    required: true,
    answer: null,
  },
  {
    key: 'address',
    enabled: true,
    required: false,
    answer: {
      address: null,
      address2: null,
      city: null,
      state: null,
      postCode: null,
      country: null,
    },
  },
  {
    key: 'custom_1',
    enabled: true,
    required: true,
    value: 'one',
    question: 'Which option do you prefer?',
    answer: null,
  },
  {
    key: 'custom_2',
    enabled: true,
    required: true,
    value: 'one;two;three',
    question: 'Which option do you prefer?',
    answer: '',
  },
  {
    key: 'custom_3',
    enabled: true,
    required: true,
    value: 'one;two',
    question: 'Which option do you prefer?',
    answer: '',
  },
];
