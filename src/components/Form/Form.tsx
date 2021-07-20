import React, { useState } from 'react';

type Return = {
  values: FormValues;
  onChange?: (event: React.FormEvent<HTMLInputElement>) => void;
  handleSubmit?: () => void;
};

type Props = {
  initialValues: FormValues;
  editing?: boolean;
  children: ({ values, onChange }: Return) => JSX.Element;
  onSubmit: (values: FormValues) => void;
};

const Form = ({ initialValues, editing = true, children, onSubmit }: Props): JSX.Element => {
  const [values, setValues] = useState<FormValues>(initialValues);

  const onChange = (event: React.FormEvent<HTMLInputElement>) => {
    if (!event.currentTarget) return;
    setValues({ ...values, [event.currentTarget.name]: event.currentTarget.value });
  };

  const handleSubmit = (event?: React.FormEvent) => {
    event && event.preventDefault();
    onSubmit(values);
  };

  if (!editing) {
    return children({ values });
  }

  return <form onSubmit={handleSubmit}>{children({ values, onChange, handleSubmit })}</form>;
};

export default Form;
