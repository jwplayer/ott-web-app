import React from 'react';
import { Link } from 'react-router-dom';

import styles from './Logo.module.scss';

type Props = {
  src: string;
};

const Logo: React.FC<Props> = ({ src }: Props) => {
  return (
    <Link to="/">
      <img className={styles.logo} alt="logo" src={src} />
    </Link>
  );
};

export default Logo;
