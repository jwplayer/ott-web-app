import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './ErrorPage.module.scss';

import { IS_DEMO_MODE, IS_DEVELOPMENT_BUILD, IS_PREVIEW_MODE } from '#src/utils/common';
import DevStackTrace from '#components/DevStackTrace/DevStackTrace';
import { useConfigStore } from '#src/stores/ConfigStore';
import { getPublicUrl } from '#src/utils/domHelpers';

interface Props {
  disableFallbackTranslation?: boolean;
  title?: string | ReactNode;
  message?: string | ReactNode;
  learnMoreLabel?: string;
  children?: React.ReactNode;
  error?: Error;
  helpLink?: string;
}

const ErrorPage = ({ title, message, learnMoreLabel, ...rest }: Props) => {
  const { t } = useTranslation('error');

  return (
    <ErrorPageWithoutTranslation
      title={title || t('generic_error_heading')}
      message={message || t('generic_error_description')}
      learnMoreLabel={learnMoreLabel || t('learn_more')}
      {...rest}
    />
  );
};

export const ErrorPageWithoutTranslation = ({ title, children, message, learnMoreLabel, error, helpLink }: Props) => {
  const logo = useConfigStore((s) => s.config?.assets?.banner);

  return (
    <div className={styles.errorPage}>
      <div className={styles.box}>
        <img className={styles.image} src={getPublicUrl(logo || '/images/logo.png')} alt={'Logo'} />
        <header>
          <h1 className={styles.title}>{title || 'An error occurred'}</h1>
        </header>
        <main className={styles.main}>
          <>
            {children || <p>{message || 'Try refreshing this page or come back later.'}</p>}
            {(IS_DEVELOPMENT_BUILD || IS_DEMO_MODE || IS_PREVIEW_MODE) && helpLink && (
              <p className={styles.links}>
                <a href={helpLink} target={'_blank'} rel={'noreferrer'}>
                  {learnMoreLabel || 'Learn More'}
                </a>
                {(IS_DEVELOPMENT_BUILD || IS_PREVIEW_MODE) && error?.stack && (
                  <span className={styles.stack}>
                    <DevStackTrace error={error} />
                  </span>
                )}
              </p>
            )}
          </>
        </main>
      </div>
    </div>
  );
};

export default ErrorPage;
