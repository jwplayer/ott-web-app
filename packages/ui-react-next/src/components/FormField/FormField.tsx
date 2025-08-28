import React from 'react';
import classNames from 'classnames';
import useOpaqueId from '@jwp/ott-hooks-react-next/src/useOpaqueId';

import HelperText from '../HelperText/HelperText';
import type { FormControlProps } from '../../types/form';

import styles from './FormField.module.scss';

type RenderInputProps = {
  helperTextId: string;
  id: string;
};

type Props = {
  helperText?: React.ReactNode;
  renderInput: (fieldProps: RenderInputProps) => React.ReactElement;
} & Omit<FormControlProps, 'value' | 'placeholder'>;

export const FormField = ({ className, renderInput, required, label, error, helperText, testId, editing = true, name }: Props) => {
  const formFieldClassName = classNames(styles.formField, className);
  const id = useOpaqueId('text-field', name);
  const helperTextId = useOpaqueId('helper_text', name);

  return (
    <div className={formFieldClassName} data-testid={testId}>
      {!!label && (
        <label htmlFor={id} className={styles.label}>
          {label}
          {required && editing ? <span aria-hidden="true">*</span> : null}
        </label>
      )}
      {renderInput({ helperTextId, id })}
      {editing && (
        <HelperText id={helperTextId} error={error}>
          {helperText}
        </HelperText>
      )}
    </div>
  );
};
