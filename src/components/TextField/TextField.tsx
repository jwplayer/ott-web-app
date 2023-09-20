import React, { RefObject } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import styles from './TextField.module.scss';

import HelperText from '#components/HelperText/HelperText';
import { testId as getTestId } from '#src/utils/common';
import useOpaqueId from '#src/hooks/useOpaqueId';

type InputProps = Omit<React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, 'id' | 'ref' | 'className'>;
type TextAreaProps = Omit<React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>, 'id' | 'ref' | 'className'>;

type InputOrTextAreaProps =
  | ({ multiline?: never; inputRef?: RefObject<HTMLInputElement>; textAreaRef?: never } & InputProps)
  | ({ multiline: true; inputRef?: never; textAreaRef?: RefObject<HTMLTextAreaElement> } & TextAreaProps);

type Props = {
  className?: string;
  label?: string;
  helperText?: React.ReactNode;
  leftControl?: React.ReactNode;
  rightControl?: React.ReactNode;
  error?: boolean;
  editing?: boolean;
  testId?: string;
  multiline?: boolean;
} & InputOrTextAreaProps;

const TextField: React.FC<Props> = ({
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
  const id = useOpaqueId('text-field', inputProps.name);
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

  return (
    <div className={textFieldClassName} data-testid={getTestId(testId)}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {!inputProps.required && editing ? <span>{t('optional')}</span> : null}
      </label>
      {editing ? (
        <div className={styles.container}>
          {leftControl ? <div className={styles.control}>{leftControl}</div> : null}
          {isTextArea(inputProps) ? (
            <textarea id={id} className={styles.input} rows={3} ref={textAreaRef} {...inputProps} />
          ) : (
            <input id={id} className={styles.input} type={'text'} ref={inputRef} {...inputProps} />
          )}
          {rightControl ? <div className={styles.control}>{rightControl}</div> : null}
        </div>
      ) : (
        <p>{inputProps.value}</p>
      )}
      <HelperText error={error}>{helperText}</HelperText>
    </div>
  );
};

export default TextField;
