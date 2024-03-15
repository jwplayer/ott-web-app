import React, { type ReactNode, type RefObject } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { testId as getTestId } from '@jwp/ott-common/src/utils/common';
import useOpaqueId from '@jwp/ott-hooks-react/src/useOpaqueId';

import HelperText from '../HelperText/HelperText';

import styles from './TextField.module.scss';

type InputProps = Omit<React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, 'id' | 'ref' | 'className' | 'name'>;
type TextAreaProps = Omit<React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>, 'id' | 'ref' | 'className' | 'name'>;

type InputOrTextAreaProps =
  | ({ multiline?: never; inputRef?: RefObject<HTMLInputElement>; textAreaRef?: never } & InputProps)
  | ({ multiline: true; inputRef?: never; textAreaRef?: RefObject<HTMLTextAreaElement> } & TextAreaProps);

type Props = {
  name: string;
  className?: string;
  label?: ReactNode;
  helperText?: React.ReactNode;
  leftControl?: React.ReactNode;
  rightControl?: React.ReactNode;
  error?: boolean;
  editing?: boolean;
  testId?: string;
  multiline?: boolean;
} & InputOrTextAreaProps;

const TextField: React.FC<Props> = ({
  name,
  className,
  label,
  error,
  helperText,
  leftControl,
  rightControl,
  editing = true,
  testId,
  inputRef,
  textAreaRef,
  multiline,
  ...inputProps
}: Props) => {
  const id = useOpaqueId('text-field', name);
  const helperTextId = useOpaqueId('helper_text', name);

  const { t } = useTranslation('common');

  const isInputOrTextArea = (item: unknown): item is InputOrTextAreaProps => !!item && typeof item === 'object';
  const isTextArea = (item: unknown): item is TextAreaProps => isInputOrTextArea(item) && !!multiline;

  const textFieldClassName = classNames(
    styles.textField,
    {
      [styles.error]: error,
      [styles.disabled]: inputProps.disabled,
      [styles.leftControl]: !!leftControl,
      [styles.rightControl]: !!rightControl,
    },
    className,
  );

  const renderInput = () => {
    const { required, disabled, value, ...otherInputProps } = inputProps;

    // Default to 'text' if 'type' property is absent, which occurs in textareas.
    const inputType = 'type' in otherInputProps ? otherInputProps.type : 'text';

    const ariaAttributes = {
      'aria-invalid': Boolean(error && !value),
      'aria-describedby': helperTextId,
    } as const;

    const commonProps = {
      id,
      name,
      value,
      disabled,
      className: styles.input,
      readOnly: !editing,
      required: !!required,
      ...ariaAttributes,
      ...otherInputProps,
    };

    return isTextArea(inputProps) ? (
      <textarea {...(commonProps as TextAreaProps)} rows={3} ref={textAreaRef} />
    ) : (
      <input {...(commonProps as InputProps)} type={inputType} ref={inputRef} />
    );
  };

  return (
    <div className={textFieldClassName} data-testid={getTestId(testId)}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {!inputProps.required && editing ? <span>{t('optional')}</span> : null}
      </label>
      {editing ? (
        <div className={styles.container}>
          {leftControl ? <div className={styles.control}>{leftControl}</div> : null}
          {renderInput()}
          {rightControl ? <div className={styles.control}>{rightControl}</div> : null}
        </div>
      ) : (
        renderInput()
      )}
      <HelperText id={helperTextId} error={error}>
        {helperText}
      </HelperText>
    </div>
  );
};

export default TextField;
