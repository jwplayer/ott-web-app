import React from 'react';
import classNames from 'classnames';
import useOpaqueId from '@jwp/ott-hooks-react/src/useOpaqueId';

import styles from './HelperText.module.scss';

type Props = {
  children: React.ReactNode;
  className?: string;
  error?: boolean;
  id?: string;
};

const HelperText: React.FC<Props> = ({ children, className, error, id }: Props) => {
  const helperId = useOpaqueId('helper_text', undefined, id);

  return children ? (
    <div id={helperId} className={classNames(styles.helperText, { [styles.error]: error }, className)}>
      {children}
    </div>
  ) : null;
};

export default HelperText;
