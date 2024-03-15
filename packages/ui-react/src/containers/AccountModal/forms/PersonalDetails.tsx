import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { mixed, object, string } from 'yup';
import { useQuery } from 'react-query';
import type { CaptureCustomAnswer, CleengCaptureQuestionField, PersonalDetailsFormData } from '@jwp/ott-common/types/account';
import { getModule } from '@jwp/ott-common/src/modules/container';
import { useConfigStore } from '@jwp/ott-common/src/stores/ConfigStore';
import AccountController from '@jwp/ott-common/src/controllers/AccountController';
import { modalURLFromLocation } from '@jwp/ott-ui-react/src/utils/location';
import { ACCESS_MODEL } from '@jwp/ott-common/src/constants';
import useForm, { type UseFormOnSubmitHandler } from '@jwp/ott-hooks-react/src/useForm';
import useOffers from '@jwp/ott-hooks-react/src/useOffers';

import PersonalDetailsForm from '../../../components/PersonalDetailsForm/PersonalDetailsForm';
import LoadingOverlay from '../../../components/LoadingOverlay/LoadingOverlay';

const yupConditional = (required: boolean, message: string) => {
  return required ? string().required(message) : mixed().notRequired();
};

const PersonalDetails = () => {
  const accountController = getModule(AccountController);

  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation('account');
  const accessModel = useConfigStore((s) => s.accessModel);
  const { data, isLoading } = useQuery('captureStatus', accountController.getCaptureStatus);
  const { mediaOffers } = useOffers();
  const hasMediaOffers = mediaOffers.length > 0;
  const [questionValues, setQuestionValues] = useState<Record<string, string>>({});
  const [questionErrors, setQuestionErrors] = useState<Record<string, string>>({});

  const fields = useMemo(() => Object.fromEntries(data?.settings.map((item) => [item.key, item]) || []), [data]);
  const questions = useMemo(
    () => (data?.settings.filter((item) => !!(item as CleengCaptureQuestionField).question) as CleengCaptureQuestionField[]) || [],
    [data],
  );

  const nextStep = useCallback(() => {
    const hasOffers = accessModel === ACCESS_MODEL.SVOD || (accessModel === ACCESS_MODEL.AUTHVOD && hasMediaOffers);

    navigate(modalURLFromLocation(location, hasOffers ? 'choose-offer' : 'welcome'), { replace: true });
  }, [navigate, location, accessModel, hasMediaOffers]);

  useEffect(() => {
    if (data && (!data.isCaptureEnabled || !data.shouldCaptureBeDisplayed)) nextStep();

    if (data && questions) {
      setQuestionValues(Object.fromEntries(questions.map((question) => [question.key, ''])));
    }
  }, [data, nextStep, questions]);

  const initialValues: PersonalDetailsFormData = {
    firstName: '',
    lastName: '',
    birthDate: '',
    companyName: '',
    phoneNumber: '',
    address: '',
    address2: '',
    city: '',
    state: '',
    postCode: '',
    country: '',
  };

  const questionChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.type === 'checkbox' && !event.target.checked ? '' : event.target.value;

    setQuestionValues((current) => ({ ...current, [event.target.name]: value }));
  };

  const PersonalDetailSubmitHandler: UseFormOnSubmitHandler<PersonalDetailsFormData> = async (
    formData,
    { setErrors, setSubmitting, setValidationSchemaError, validate },
  ) => {
    const requiredMessage = t('personal_details.this_field_is_required');
    const schema = object().shape({
      firstName: yupConditional(!!fields.firstNameLastName?.required, requiredMessage),
      lastName: yupConditional(!!fields.firstNameLastName?.required, requiredMessage),
      address1: yupConditional(!!fields.address?.required, requiredMessage),
      address2: yupConditional(!!fields.address?.required, requiredMessage),
      postCode: yupConditional(!!fields.address?.required, requiredMessage),
      state: yupConditional(!!fields.address?.required, requiredMessage),
      city: yupConditional(!!fields.address?.required, requiredMessage),
      companyName: yupConditional(!!fields.companyName?.required, requiredMessage),
      birthDate: fields.birthDate?.required
        ? string()
            .required(requiredMessage)
            .matches(/\d{4}-\d{2}-\d{2}/, t('personal_details.birth_date_not_valid'))
        : mixed().notRequired(),
      phoneNumber: yupConditional(!!fields.phoneNumber?.required, requiredMessage),
    });

    const errors: Record<string, string> = {};

    questions.forEach((question) => {
      if (question.enabled && question.required && !questionValues[question.key]) {
        errors[question.key] = t('personal_details.this_field_is_required');
      }
    });

    setQuestionErrors(errors);

    // we have validation errors
    if (!validate(schema) || Object.keys(errors).length) {
      setSubmitting(false);
      setValidationSchemaError(true);
      return;
    }

    try {
      const removeEmpty = (obj: Record<string, unknown>) =>
        Object.fromEntries(
          Object.keys(obj)
            .filter((key) => obj[key] !== '')
            .map((key) => [key, obj[key]]),
        );
      const customAnswers = questions.map(
        (question) =>
          ({
            question: question.question,
            questionId: question.key,
            value: questionValues[question.key],
          } as CaptureCustomAnswer),
      );

      await accountController.updateCaptureAnswers(removeEmpty({ ...formData, customAnswers }));

      nextStep();
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrors({ form: error.message });
      }
    }

    setSubmitting(false);
  };

  const { setValue, handleSubmit, handleChange, values, errors, validationSchemaError, submitting } = useForm<PersonalDetailsFormData>({
    initialValues,
    onSubmit: PersonalDetailSubmitHandler,
  });

  if (isLoading) {
    return (
      <div style={{ height: 400 }}>
        <LoadingOverlay inline />
      </div>
    );
  }

  return (
    <PersonalDetailsForm
      fields={fields}
      questions={questions}
      onQuestionChange={questionChangeHandler}
      questionValues={questionValues}
      questionErrors={questionErrors}
      onSubmit={handleSubmit}
      onChange={handleChange}
      setValue={setValue}
      values={values}
      errors={errors}
      validationError={validationSchemaError}
      submitting={submitting}
    />
  );
};

export default PersonalDetails;
