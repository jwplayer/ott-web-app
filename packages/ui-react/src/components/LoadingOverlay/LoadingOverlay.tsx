import React from 'react';
import classNames from 'classnames';

import Spinner from '../Spinner/Spinner';

import styles from './LoadingOverlay.module.scss';

type Props = {
  transparentBackground?: boolean;
  inline?: boolean;
  profileImageUrl?: string;
};

const LoadingOverlay = ({ transparentBackground = false, inline = false, profileImageUrl = '' }: Props): JSX.Element => {
  const className = classNames(styles.loadingOverlay, {
    [styles.transparent]: transparentBackground,
    [styles.fixed]: !inline,
    [styles.inline]: inline,
    [styles.profile]: profileImageUrl,
  });

  return (
    <div className={className}>
      {profileImageUrl && <img src={profileImageUrl} alt="Profile Avatar" />}
      <Spinner size={profileImageUrl ? 'large' : 'medium'} />
    </div>
  );
};
export default LoadingOverlay;
