import React from 'react';

import Header from '../../components/Header/Header';

import styles from './Home.module.scss';

type HomeProps = {
  dummy?: string;
};

const Home: React.FC<HomeProps> = ({ dummy = 'defaultValue' }: HomeProps) => {
  return (
    <div className={styles.Home}>
      <Header></Header>
      <p style={{ color: 'white' }}>{dummy}</p>
    </div>
  );
};

export default Home;
