import React, { useState } from 'react';
import { ValidationError, AnySchema } from 'yup';

type UseFormChangeHandler = React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
type UseFormSubmitHandler = React.FormEventHandler<HTMLFormElement>;

export type GenericFormErrors = { form: string };
export type FormErrors<T> = Partial<T & GenericFormErrors>;

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
  setValue: (key: keyof T, value: string) => void;
  setErrors: (errors: FormErrors<T>) => void;
  setSubmitting: (submitting: boolean) => void;
};

export type UseFormOnSubmitHandler<T> = (values: T, formMethods: UseFormMethods<T>) => void;

export default function useForm<T extends FormValues>(
  initialValues: T,
  onSubmit: UseFormOnSubmitHandler<T>,
  validationSchema?: AnySchema,
): UseFormReturnValue<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors<T>>({});

  const setValue = (name: keyof T, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
  };

  const handleChange: UseFormChangeHandler = (event) => {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit: UseFormSubmitHandler = (event) => {
    event.preventDefault();

    if (!onSubmit || submitting) return;

    // reset errors before submitting
    setErrors({});

    // start submitting
    setSubmitting(true);

    // validate values with schema
    if (validationSchema) {
      try {
        validationSchema.validateSync(values, { abortEarly: false });
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

        return;
      }
    }

    onSubmit(values, { setValue, setErrors, setSubmitting });
  };

  return { values, errors, handleChange, handleSubmit, submitting, setValue, setErrors, setSubmitting };
}
