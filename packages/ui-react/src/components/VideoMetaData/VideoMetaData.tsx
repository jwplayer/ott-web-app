import React from 'react';

import styles from './VideoMetaData.module.scss';

type Props = {
  attributes: string[];
  separator?: string;
};

const VideoMetaData: React.FC<Props> = ({ attributes, separator = '•' }: Props) => {
  return (
    <>
      {attributes.map((value, index) => (
        <>
          <span key={index}>{value}</span>
          {index < attributes.length - 1 && (
            <span className={styles.separator} aria-hidden="true">
              {separator}
            </span>
          )}
        </>
      ))}
    </>
  );
};

export default VideoMetaData;
