import React from 'react';
import { useHistory } from 'react-router-dom';

import styles from './Logo.module.scss';

type Props = {
  src: string;
};

const Logo: React.FC<Props> = ({ src }: Props) => {
  const history = useHistory();

  const handleClick = () => {
    history.push('/');
  };

  return (
    <div className={styles.brand}>
      <img className={styles.logo} alt="logo" src={src} onClick={handleClick} />
    </div>
  );
};

export default Logo;
