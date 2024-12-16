import React, { createContext, useCallback, useEffect, useState, type SetStateAction } from 'react';
import type { GenericFormValues } from '@jwp/ott-common/types/form';

import type { FormSectionProps } from './FormSection';
import { FormSection } from './FormSection';

interface Props<TData> {
  initialValues: TData;
  isLoading?: boolean;
  onReset?: () => void;
  children?: FormSectionProps<TData, string[]>[];
}

export interface FormContext<TData> {
  isLoading?: boolean;
  onCancel: () => void;
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

  const onCancel = useCallback(
    function onCancel() {
      setState((s) => {
        return {
          ...s,
          values: initialValues,
          isDirty: false,
          activeSectionId: undefined,
          success: false,
          errors: undefined,
        };
      });
      onReset?.();
    },
    [initialValues, onReset],
  );

  useEffect(() => {
    // Don't overwrite values if a section is being edited, since that would wipe out anything the user has entered
    if (!state.activeSectionId) {
      setState((s) => {
        return {
          ...s,
          values: initialValues,
        };
      });
    }
  }, [initialValues, state.activeSectionId]);

  return (
    <FormContext.Provider
      value={{
        isLoading,
        onCancel,
        formState: state,
        setFormState: setState,
      }}
    >
      {children?.map((props, i) => (
        <FormSection<TData> key={i} {...props} />
      ))}
    </FormContext.Provider>
  );
}

export default Form;
