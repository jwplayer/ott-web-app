import React from 'react';
import classNames from 'classnames';

import styles from './HelperText.module.scss';

type Props = {
  children: React.ReactNode;
  className?: string;
  error?: boolean;
};

const HelperText: React.FC<Props> = ({ children, className, error }: Props) => {
  return children ? <div className={classNames(styles.helperText, { [styles.error]: error }, className)}>{children}</div> : null;
};

export default HelperText;
