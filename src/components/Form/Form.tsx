import React, {useState, useEffect, createContext, SetStateAction} from 'react';
import type { GenericFormValues } from 'types/form';

import type {FormSectionProps} from "./FormSection";
import {FormSection} from "./FormSection";

interface Props<TData> {
  initialValues: TData;
  isLoading?: boolean;
  onReset?: () => void;
  children?: FormSectionProps<TData, string[]>[];
}

export interface FormContext<TData> {
  isLoading?: boolean;
  cancel: () => void;
  formState: FormState<TData>;
  setFormState: React.Dispatch<SetStateAction<FormState<TData>>>;
}

interface FormState<TData> {
  values: TData;
  activeSectionId: string | undefined;
  isDirty: boolean;
  isBusy: boolean;
  errors?: string[];
}

export const FormContext = createContext<FormContext<GenericFormValues> | undefined>(undefined);

function Form<TData extends GenericFormValues>({ isLoading, initialValues, onReset, children }: Props<TData>): JSX.Element {
  const [state, setState] = useState<FormState<TData>>({
    values: initialValues,
    activeSectionId: undefined,
    isDirty: false,
    isBusy: false,
  });

  function cancel() {
    setState((s) => {
      return {
        ...s,
        values: initialValues,
        isDirty: false,
        activeSectionId: undefined,
        errors: undefined,
      };
    });
    onReset && onReset();
  }

  useEffect(() => {
    setState((s) => {
      return {
        ...s,
        values: initialValues,
      };
    });
  }, [initialValues]);

  return (
    <FormContext.Provider
      value={{
        isLoading,
        cancel,
        formState: state,
        setFormState: setState,
      }}
    >
      {children?.map((props, i) => (
          <FormSection key={i} {...props} />
      ))}
    </FormContext.Provider>
  );
}

export default Form;
