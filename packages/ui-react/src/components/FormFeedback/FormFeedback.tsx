import React from 'react';
import classNames from 'classnames';

import styles from './FormFeedback.module.scss';

type Props = {
  visible?: boolean;
  children?: React.ReactNode;
  variant: 'info' | 'success' | 'warning' | 'error';
};

const variantAriaMap = {
  info: 'polite',
  success: 'assertive',
  warning: 'polite',
  error: 'assertive',
} as const;

const FormFeedback: React.FC<Props> = ({ children, variant = 'error', visible = true }: Props) => {
  const className = classNames(styles.formFeedback, {
    [styles.error]: variant === 'error',
    [styles.warning]: variant === 'warning',
    [styles.success]: variant === 'success',
    [styles.info]: variant === 'info',
    hidden: !visible,
  });

  const ariaLive = variantAriaMap[variant];

  return (
    <div aria-live={ariaLive} className={className}>
      {children}
    </div>
  );
};

export default FormFeedback;
