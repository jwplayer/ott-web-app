import { useState } from 'react';
import type { FormErrors, GenericFormValues, UseFormChangeHandler, UseFormSubmitHandler } from 'types/form';
import { ValidationError, AnySchema } from 'yup';

export type UseFormReturnValue<T> = {
  values: T;
  errors: FormErrors<T>;
  submitting: boolean;
  handleChange: UseFormChangeHandler;
  handleSubmit: UseFormSubmitHandler;
  setValue: (key: keyof T, value: string) => void;
  setErrors: (errors: FormErrors<T>) => void;
  setSubmitting: (submitting: boolean) => void;
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
): UseFormReturnValue<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors<T>>({});

  const setValue = (name: keyof T, value: string | boolean) => {
    setValues((current) => ({ ...current, [name]: value }));
  };

  const handleChange: UseFormChangeHandler = (event) => {
    const value = event.target instanceof HTMLInputElement && event.target.type === 'checkbox' ? event.target.checked : event.target.value;

    setValues((current) => ({ ...current, [event.target.name]: value }));
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

    // start submitting
    setSubmitting(true);

    // validate values with schema
    if (validationSchema && !validate(validationSchema)) {
      return;
    }

    onSubmit(values, { setValue, setErrors, setSubmitting, validate });
  };

  return { values, errors, handleChange, handleSubmit, submitting, setValue, setErrors, setSubmitting };
}
