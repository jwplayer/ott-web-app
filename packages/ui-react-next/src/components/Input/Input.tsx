import React, { type InputHTMLAttributes, type RefObject, type TextareaHTMLAttributes } from 'react';
import classNames from 'classnames';

import type { FormControlProps } from '../../types/form';

import styles from './Input.module.scss';

type CommonProps = {
  id?: string;
  helperTextId?: string;
  leftControl?: React.ReactNode;
  rightControl?: React.ReactNode;
  multiline?: boolean;
} & FormControlProps;

type HTMLInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>;
type HTMLTextAreaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>;

type InputProps = HTMLInputProps & {
  type?: InputHTMLAttributes<HTMLInputElement>['type'];
  multiline?: boolean;
  inputRef?: RefObject<HTMLInputElement>;
  textAreaRef?: never;
} & CommonProps;
type TextAreaProps = HTMLTextAreaProps & { type?: never; multiline: true; inputRef?: never; textAreaRef?: RefObject<HTMLTextAreaElement> } & CommonProps;

export type Props = InputProps | TextAreaProps;

const isTextArea = (_props: HTMLInputProps | HTMLTextAreaProps, multiline?: boolean): _props is HTMLTextAreaProps => !!multiline;

const Input = ({
  required,
  className,
  disabled,
  editing = true,
  value,
  id,
  name,
  multiline,
  error,
  helperTextId,
  type,
  textAreaRef,
  inputRef,
  leftControl,
  rightControl,
  ...inputProps
}: Props) => {
  // Default to 'text' if 'type' property is absent, which occurs in textareas.
  const inputType = type || 'text';
  const containerClassName = classNames(
    styles.container,
    {
      [styles.error]: error,
      [styles.disabled]: disabled,
      [styles.leftControl]: !!leftControl,
      [styles.rightControl]: !!rightControl,
    },
    className,
  );

  const ariaAttributes = {
    'aria-required': !!required,
    'aria-invalid': Boolean(required && error && value !== ''),
    'aria-describedby': helperTextId,
  } as const;

  const commonProps: HTMLInputProps | HTMLTextAreaProps = {
    id,
    name,
    value,
    disabled,
    rows: multiline ? 3 : undefined,
    className: styles.input,
    readOnly: !editing,
    required: required,
    ...ariaAttributes,
    ...inputProps,
  };

  const input = isTextArea(commonProps, multiline) ? (
    <textarea {...commonProps} ref={textAreaRef} />
  ) : (
    <input {...commonProps} type={inputType} ref={inputRef} />
  );

  return editing ? (
    <div className={containerClassName}>
      {leftControl ? <div className={styles.control}>{leftControl}</div> : null}
      {input}
      {rightControl ? <div className={styles.control}>{rightControl}</div> : null}
    </div>
  ) : (
    input
  );
};

export default Input;
