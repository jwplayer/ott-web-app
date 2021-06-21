import React from 'react';

import styles from './ErrorPage.module.scss';

type Props = {
  title: string;
  children?: React.ReactNode;
};

const ErrorPage: React.FC<Props> = ({ title, children }: Props) => {
  return (
    <div className={styles.errorPage}>
      <div className={styles.box}>
        <header>
          <h1 className={styles.title}>{title}</h1>
        </header>
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
};

export default ErrorPage;
