import React, {ReactElement, ReactNode, useContext} from 'react';

import Button from '../Button/Button';
import type { GenericFormValues } from '../../../types/form';
import LoadingOverlay from '../LoadingOverlay/LoadingOverlay';
import useOpaqueId from '../../hooks/useOpaqueId';

import { FormContext } from './Form';
import styles from './Form.module.scss';

export interface FormSectionContentArgs<T extends GenericFormValues, TErrors> {
  values: T;
  isEditing: boolean;
  isBusy: boolean;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  errors?: TErrors | undefined;
}

export interface FormSectionProps<TData extends GenericFormValues, TErrors> {
  className?: string;
  panelHeaderClassName?: string;
  label: string;
  editButton?: string | ReactElement;
  saveButton?: string;
  cancelButton?: string;
  canSave?: (values: TData) => boolean;
  submit?: (values: TData) => Promise<{ errors?: string[] }> | void;
  children?: never;
  content: (args: FormSectionContentArgs<TData, TErrors>) => ReactNode;
}

export function FormSection<TData extends GenericFormValues>(props: FormSectionProps<TData, string[]>): ReactElement<FormSectionProps<TData, string[]>> | null {
  const sectionId = useOpaqueId(props.label);
  const {
    formState: { values, activeSectionId, isDirty, errors: formErrors, isBusy },
    setFormState,
    isLoading,
    cancel,
  } = useContext(FormContext) as FormContext<TData>;

  function onChange(event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) {
    if (!event.currentTarget) return;

    const name = event.currentTarget.name;
    const value = event.currentTarget.type === 'checkbox' ? (event.currentTarget as HTMLInputElement).checked : event.currentTarget.value;

    if (activeSectionId !== sectionId) {
      cancel();
    }

    setFormState((oldState) => {
      const newValues = { ...oldState.values };

      // This logic handles nested names like 'consents.terms'
      name.split('.').reduce((parent, field, index, arr) => {
        if (index === arr.length - 1) {
          parent[field] = value;
        } else {
          parent[field] = { ...parent[field] } || {};
        }

        return parent[field];
      }, newValues);

      return {
        ...oldState,
        values: newValues,
        isDirty: true,
        activeSectionId: sectionId,
      };
    });
  }

  async function handleSubmit(event?: React.FormEvent) {
    event && event.preventDefault();

    if (props.submit) {
      let response: { errors?: string[] } | void;

      try {
        setFormState((s) => {
          return { ...s, isBusy: true };
        });
        response = await props.submit(values);
      } catch (error: unknown) {
        response = { errors: Array.of(error as string) };
      }

      // Don't leave edit mode if there are errors
      if (response?.errors?.length) {
        setFormState((s) => {
          return {
            ...s,
            errors: response?.errors,
            isBusy: false,
          };
        });

        return;
      }
    }

    setFormState((s) => {
      return {
        ...s,
        activeSectionId: undefined,
        isDirty: false,
        isBusy: false,
      };
    });
  }

  function edit() {
    if (activeSectionId !== sectionId) {
      cancel();

      setFormState((s) => {
        return {
          ...s,
          activeSectionId: sectionId,
        };
      });
    }
  }

  const isEditing = sectionId === activeSectionId;

  return (
    <div className={props.className}>
      <div className={props.panelHeaderClassName}>
        <h3>{props.label}</h3>
      </div>
      {isBusy && isEditing && <LoadingOverlay transparentBackground />}
      {isEditing ? (
        <form className={styles.flexBox} noValidate onSubmit={(event) => event.preventDefault()}>
          {props.content({ values, isEditing, isBusy, onChange, errors: formErrors })}
        </form>
      ) : (
        <div className={styles.flexBox}>{props.content({ values, isEditing, isBusy, onChange })}</div>
      )}
      {(props.saveButton || props.editButton || props.cancelButton) && (
        <div className={styles.controls}>
          {isEditing ? (
            <>
              {props.saveButton && (
                <Button
                  label={props.saveButton}
                  type="submit"
                  onClick={handleSubmit}
                  disabled={!isDirty || isLoading || (props.canSave && !props.canSave(values))}
                />
              )}
              {props.cancelButton && <Button label={props.cancelButton} type="reset" variant="text" onClick={cancel} />}
            </>
          ) : (
            props.editButton &&
            (typeof props.editButton === 'object' ? (
              (props.editButton as ReactElement)
            ) : (
              <Button label={props.editButton as string} type="button" onClick={edit} disabled={isLoading} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
