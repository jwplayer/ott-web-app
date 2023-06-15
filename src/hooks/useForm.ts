import { useCallback, useState } from 'react';
import { ValidationError, AnySchema } from 'yup';

import type { FormErrors, GenericFormValues, UseFormChangeHandler, UseFormBlurHandler, UseFormSubmitHandler } from '#types/form';

export type UseFormReturnValue<T> = {
  values: T;
  errors: FormErrors<T>;
  submitting: boolean;
  handleChange: UseFormChangeHandler;
  handleBlur: UseFormBlurHandler;
  handleSubmit: UseFormSubmitHandler;
  setValue: (key: keyof T, value: string) => void;
  setErrors: (errors: FormErrors<T>) => void;
  setSubmitting: (submitting: boolean) => void;
  reset: () => void;
};

type UseFormMethods<T> = {
  setValue: (key: keyof T, value: string | boolean) => void;
  setErrors: (errors: FormErrors<T>) => void;
  setSubmitting: (submitting: boolean) => void;
  validate: (validationSchema: AnySchema) => boolean;
};

export type UseFormOnSubmitHandler<T> = (values: T, formMethods: UseFormMethods<T>) => void;

export default function useForm<T extends GenericFormValues>(
  initialValues: T,
  onSubmit: UseFormOnSubmitHandler<T>,
  validationSchema?: AnySchema,
  validateOnBlur: boolean = false,
): UseFormReturnValue<T> {
  const [touched, setTouched] = useState<Record<keyof T, boolean>>(
    Object.fromEntries((Object.keys(initialValues) as Array<keyof T>).map((key) => [key, false])) as Record<keyof T, boolean>,
  );
  const [values, setValues] = useState<T>(initialValues);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors<T>>({});

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
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

        setErrors(newErrors as FormErrors<T>);
      }
    }

    return false;
  };

  const handleSubmit: UseFormSubmitHandler = (event) => {
    event.preventDefault();

    if (!onSubmit || submitting) return;

    // reset errors before submitting
    setErrors({});

    // validate values with schema
    if (validationSchema && !validate(validationSchema)) {
      return;
    }

    // start submitting
    setSubmitting(true);

    onSubmit(values, { setValue, setErrors, setSubmitting, validate });
  };

  return { values, errors, handleChange, handleBlur, handleSubmit, submitting, setValue, setErrors, setSubmitting, reset };
}
