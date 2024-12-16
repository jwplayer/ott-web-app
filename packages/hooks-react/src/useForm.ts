import { useCallback, useState } from 'react';
import { type AnySchema, ValidationError, type ObjectSchema } from 'yup';
import type { FormErrors, GenericFormValues, UseFormBlurHandler, UseFormChangeHandler, UseFormSubmitHandler } from '@jwp/ott-common/types/form';
import { FormValidationError } from '@jwp/ott-common/src/errors/FormValidationError';
import { useTranslation } from 'react-i18next';

export type UseFormReturnValue<T> = {
  values: T;
  errors: FormErrors<T>;
  validationSchemaError: boolean;
  submitting: boolean;
  handleChange: UseFormChangeHandler;
  handleBlur: UseFormBlurHandler;
  handleSubmit: UseFormSubmitHandler;
  setValue: (key: keyof T, value: T[keyof T]) => void;
  setErrors: (errors: FormErrors<T>) => void;
  setSubmitting: (submitting: boolean) => void;
  setValidationSchemaError: (error: boolean) => void;
  reset: () => void;
};

type UseFormMethods<T> = {
  setValue: (key: keyof T, value: string | boolean) => void;
  setErrors: (errors: FormErrors<T>) => void;
  setSubmitting: (submitting: boolean) => void;
  setValidationSchemaError: (error: boolean) => void;
  validate: (validationSchema: AnySchema) => boolean;
};

export type UseFormOnSubmitHandler<T> = (values: T, formMethods: UseFormMethods<T>) => void;

export default function useForm<T extends GenericFormValues>({
  initialValues,
  validationSchema,
  validateOnBlur = false,
  onSubmit,
  onSubmitSuccess,
  onSubmitError,
}: {
  initialValues: T;
  validationSchema?: ObjectSchema<T>;
  validateOnBlur?: boolean;
  onSubmit: UseFormOnSubmitHandler<T>;
  onSubmitSuccess?: (values: T) => void;
  onSubmitError?: ({ error, resetValue }: { error: unknown; resetValue: (key: keyof T) => void }) => void;
}): UseFormReturnValue<T> {
  const { t } = useTranslation('error');
  const [touched, setTouched] = useState<Record<keyof T, boolean>>(
    Object.fromEntries((Object.keys(initialValues) as Array<keyof T>).map((key) => [key, false])) as Record<keyof T, boolean>,
  );
  const [values, setValues] = useState<T>(initialValues);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [validationSchemaError, setValidationSchemaError] = useState(false);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setValidationSchemaError(false);
    setSubmitting(false);
    setTouched(Object.fromEntries((Object.keys(initialValues) as Array<keyof T>).map((key) => [key, false])) as Record<keyof T, boolean>);
  }, [initialValues]);

  const validateField = (name: string, formValues: T) => {
    if (!validationSchema) return;

    try {
      validationSchema.validateSyncAt(name, formValues);

      // clear error
      setErrors((errors) => ({ ...errors, [name]: null }));
    } catch (error: unknown) {
      if (error instanceof ValidationError) {
        const errorMessage = error.errors[0];
        setErrors((errors) => ({ ...errors, [name]: errorMessage }));
        setValidationSchemaError(true);
      }
    }
  };

  const setValue = useCallback((name: keyof T, value: string | boolean) => {
    setValues((current) => ({ ...current, [name]: value }));
  }, []);

  const handleChange: UseFormChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target instanceof HTMLInputElement && event.target.type === 'checkbox' ? event.target.checked : event.target.value;

    const newValues = { ...values, [name]: value };

    setValues(newValues);
    setTouched((current) => ({ ...current, [name]: value }));

    if (errors[name]) {
      validateField(name, newValues);
    }
  };

  const handleBlur: UseFormBlurHandler = (event) => {
    if (!validateOnBlur || !touched[event.target.name]) return;

    validateField(event.target.name, values);
  };

  const validate = (validationSchema: AnySchema) => {
    try {
      validationSchema.validateSync(values, { abortEarly: false });

      return true;
    } catch (error: unknown) {
      if (error instanceof ValidationError) {
        const newErrors: Record<string, string> = {};

        for (let index = 0; index < error.inner.length; index++) {
          const path = error.inner[index].path as string;
          const message = error.inner[index].errors[0] as string;

          if (path && message && !newErrors[path]) {
            newErrors[path] = message;
          }
        }

        if (error.inner.every((error) => error.type === 'required')) {
          newErrors.form = t('validation_form_error.required');
        } else {
          newErrors.form = t('validation_form_error.other');
        }

        setErrors(newErrors as FormErrors<T>);
      }
    }

    return false;
  };

  const handleSubmit: UseFormSubmitHandler = async (event) => {
    event.preventDefault();

    if (!onSubmit || submitting) return;

    // reset errors before submitting
    setErrors({});
    setValidationSchemaError(false);

    // validate values with schema
    if (validationSchema && !validate(validationSchema)) {
      setValidationSchemaError(true);
      return;
    }

    // start submitting
    setSubmitting(true);

    try {
      await onSubmit(values, { setValue, setErrors, setSubmitting, setValidationSchemaError, validate });
      onSubmitSuccess?.(values);
    } catch (error: unknown) {
      const newErrors: Record<string, string> = {};

      if (error instanceof FormValidationError) {
        Object.entries(error.errors).forEach(([key, value]) => {
          if (key && value && !newErrors[key]) {
            newErrors[key] = value.join(',');
          }
        });
      } else if (error instanceof Error) {
        newErrors.form = error.message;
      } else {
        newErrors.form = t('unknown_error');
      }
      setErrors(newErrors as FormErrors<T>);

      onSubmitError?.({
        error,
        resetValue: (key: keyof T) => setValue(key, ''),
      });
    }

    setSubmitting(false);
  };

  return {
    values,
    errors,
    validationSchemaError,
    handleChange,
    handleBlur,
    handleSubmit,
    submitting,
    setValue,
    setErrors,
    setSubmitting,
    setValidationSchemaError,
    reset,
  };
}
