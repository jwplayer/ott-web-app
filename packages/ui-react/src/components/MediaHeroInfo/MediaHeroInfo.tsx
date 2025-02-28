import React from 'react';

import styles from './MediaHeroInfo.module.scss';

const MediaHeroInfo = ({
  title,
  description,
  metadataComponent,
  formatComponent,
  definitionComponent,
}: {
  title: string;
  description?: string | React.ReactElement | null;
  metadataComponent: React.ReactElement | null;
  formatComponent: React.ReactElement | null;
  definitionComponent: React.ReactElement | null;
}) => {
  return (
    <>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.metaContainer}>
        {formatComponent}
        {metadataComponent}
      </div>
      {description && typeof description === 'string' ? <p className={styles.description}>{description}</p> : description}
      {definitionComponent}
    </>
  );
};

export default MediaHeroInfo;
