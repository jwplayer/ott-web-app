import React, { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfigStore } from '@jwp/ott-common/src/stores/ConfigStore';
import { IS_DEMO_MODE, IS_DEVELOPMENT_BUILD, IS_PREVIEW_MODE } from '@jwp/ott-common/src/utils/common';

import DevStackTrace from '../DevStackTrace/DevStackTrace';

import styles from './ErrorPage.module.scss';

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
  const alt = ''; // intentionally empty for a11y, because adjacent text alternative

  return (
    <div className={styles.errorPage}>
      <div className={styles.box}>
        <img className={styles.image} src={logo || '/images/logo.png'} alt={alt} />
        <h1 className={styles.title}>{title || 'An error occurred'}</h1>
        <div className={styles.main}>
          <p className={styles.message}>{message || 'Try refreshing this page or come back later.'}</p>
          {children}
          {(IS_DEVELOPMENT_BUILD || IS_DEMO_MODE || IS_PREVIEW_MODE) && helpLink && (
            <div className={styles.links}>
              <a href={helpLink} target={'_blank'} rel={'noreferrer'}>
                {learnMoreLabel || 'Learn More'}
              </a>
              {(IS_DEVELOPMENT_BUILD || IS_PREVIEW_MODE) && error?.stack && (
                <span className={styles.stack}>
                  <DevStackTrace error={error} />
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
