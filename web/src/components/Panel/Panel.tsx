import React from 'react';

import styles from './Panel.module.scss';

type Props = {
  children?: React.ReactNode;
};

const Panel: React.FC<Props> = ({ children }) => {
  return <div className={styles.panel}>{children}</div>;
};

export default Panel;
