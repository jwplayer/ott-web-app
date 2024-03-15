import React from 'react';

import styles from './VideoMetaData.module.scss';

type Props = {
  attributes: string[];
  separator?: string;
};

const VideoMetaData: React.FC<Props> = ({ attributes, separator = '•' }: Props) => {
  return (
    <div>
      {attributes.map((value, index) => (
        <React.Fragment key={value}>
          <span>{value}</span>
          {index < attributes.length - 1 && (
            <span className={styles.separator} aria-hidden="true">
              {separator}
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default VideoMetaData;
