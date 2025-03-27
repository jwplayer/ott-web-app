import React from 'react';
import classNames from 'classnames';

import styles from './VideoDefinitionList.module.scss';

const VideoDefinitionList = ({
  className,
  listProperties,
  splitByComma = true,
}: {
  className?: string;
  listProperties: { label: string; value: string | React.ReactElement }[];
  splitByComma?: boolean;
}) => {
  const filledProperties = listProperties.filter(({ value }) => value);

  if (filledProperties.length === 0) return null;

  return (
    <dl className={classNames([styles.definitionList, className])}>
      {filledProperties.map(({ label, value }) => (
        <div key={label}>
          <dt>{label}:</dt>
          {splitByComma && typeof value === 'string' ? value.split(',').map((val) => <dd key={val}>{val}</dd>) : <dd>{value}</dd>}
        </div>
      ))}
    </dl>
  );
};

export default VideoDefinitionList;
