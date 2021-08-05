import React, { useState, useEffect } from 'react';
import type { GenericFormValues } from 'types/form';

type Return = {
  values: GenericFormValues;
  handleChange?: (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, options?: HandleChangeOptions | undefined) => void;
  handleSubmit?: () => void;
  handleReset?: () => void;
  hasChanged?: boolean;
};

type Props = {
  initialValues: GenericFormValues;
  editing?: boolean;
  children: ({ values, handleChange }: Return) => JSX.Element;
  onSubmit: (values: GenericFormValues) => void;
};

type HandleChangeOptions = {
  nestInto: string;
};

const Form = ({ initialValues, editing = true, children, onSubmit }: Props): JSX.Element => {
  const [values, setValues] = useState<GenericFormValues>(initialValues);
  const [hasChanged, setHasChanged] = useState(false);

  const handleChange = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, options?: HandleChangeOptions) => {
    if (!event.currentTarget) return;

    const name = event.currentTarget.name;
    const value = event.currentTarget.type === 'checkbox' ? (event.currentTarget as HTMLInputElement).checked : event.currentTarget.value;

    setHasChanged(true);

    if (options?.nestInto) {
      const oldSubValues = values[options.nestInto];
      const subValues = { ...oldSubValues, [name]: value };
      return setValues({ ...values, [options.nestInto]: subValues });
    }

    setValues({ ...values, [name]: value });
  };

  const handleSubmit = (event?: React.FormEvent) => {
    event && event.preventDefault();
    onSubmit && onSubmit(values);
    setHasChanged(false);
  };

  const handleReset = () => {
    setValues(initialValues);
    setHasChanged(false);
  };

  useEffect(() => {
    // todo: only update new key/values?
    setValues(initialValues);
  }, [initialValues]);

  if (!editing) {
    return children({ values });
  }

  return <form noValidate>{children({ values, handleChange, handleSubmit, handleReset, hasChanged })}</form>;
};

export default Form;
