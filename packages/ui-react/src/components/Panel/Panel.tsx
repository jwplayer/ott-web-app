import React from 'react';

import styles from './Panel.module.scss';

type Props = {
  id?: string;
  children?: React.ReactNode;
};

const Panel: React.FC<Props> = ({ children, ...rest }) => {
  return (
    <div className={styles.panel} {...rest}>
      {children}
    </div>
  );
};

export default Panel;
