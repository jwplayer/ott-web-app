import React from 'react';

import styles from './Hero.module.scss';

const HeroTitle = ({ title }: { title: string }) => {
  return <h1 className={styles.title}>{title}</h1>;
};

export default HeroTitle;
