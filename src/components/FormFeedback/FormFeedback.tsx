import React from 'react';
import classNames from 'classnames';

import styles from './FormFeedback.module.scss';

type Props = {
  children?: React.ReactNode;
  variant: 'success' | 'warning' | 'error';
};

const FormFeedback: React.FC<Props> = ({ children, variant = 'error' }: Props) => {
  const className = classNames(styles.formFeedback, {
    [styles.error]: variant === 'error',
    [styles.warning]: variant === 'warning',
    [styles.success]: variant === 'success',
  });
  return <div className={className}>{children}</div>;
};

export default FormFeedback;
