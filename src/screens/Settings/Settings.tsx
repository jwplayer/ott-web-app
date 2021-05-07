import React from 'react';

import styles from './Settings.module.scss';

type Props = {
  prop?: string;
};

const Settings: React.FC<Props> = ({ prop }: Props) => {
  return (
    <div className={styles.Settings}>
      <p>{prop}</p>
    </div>
  );
};

export default Settings;
