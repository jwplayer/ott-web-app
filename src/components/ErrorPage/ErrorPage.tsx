import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './ErrorPage.module.scss';

import { IS_DEMO_MODE, IS_DEVELOPMENT_BUILD } from '#src/utils/common';
import Link from '#components/Link/Link';

interface PropsWithChildren {
  disableFallbackTranslation?: boolean;
  title: string | ReactNode;
  message?: never;
  children: React.ReactNode;
  error?: never;
  helpLink?: string;
}

interface PropsWithoutChildren {
  disableFallbackTranslation?: boolean;
  title?: string | ReactNode;
  message?: string | ReactNode;
  children?: never;
  error?: Error;
  helpLink?: string;
}

const ErrorPage = ({ disableFallbackTranslation, title, children, message, error, helpLink }: PropsWithChildren | PropsWithoutChildren) => {
  let learnMore = 'Learn more';

  // This is only used in 1 place, on the root component to show an error when i18n fails to load.
  // Disabling it prevents a console error. Just make sure this property is always a const value
  if (!disableFallbackTranslation) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { t } = useTranslation('error');

    title = title || t('generic_error_heading', 'An error occurred');
    message = message || t('generic_error_description', 'Try refreshing this page or come back later.');
    learnMore = t('learn_more');
  }

  return (
    <div className={styles.errorPage}>
      <div className={styles.box}>
        <header>
          <h1 className={styles.title}>{title}</h1>
        </header>
        <main className={styles.main}>
          <>
            {children || <p>{message}</p>}
            {(IS_DEVELOPMENT_BUILD || IS_DEMO_MODE) && helpLink && (
              <p>
                <Link href={helpLink} target={'_blank'}>
                  {learnMore}
                </Link>
              </p>
            )}
          </>
        </main>
        {IS_DEVELOPMENT_BUILD && error?.stack && (
          <p>
            Developer Details:
            <br />
            {error?.stack}
          </p>
        )}
      </div>
    </div>
  );
};

export default ErrorPage;
