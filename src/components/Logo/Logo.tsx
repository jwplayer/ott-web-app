import React from 'react';
import { Link } from 'react-router-dom';

import styles from './Logo.module.scss';

type Props = {
  src: string;
  onLoad: () => void;
};

const Logo: React.FC<Props> = ({ src, onLoad }: Props) => {
  return (
    <Link to="/">
      <img className={styles.logo} alt="logo" src={src} onLoad={onLoad} onError={onLoad} />
    </Link>
  );
};

export default Logo;
