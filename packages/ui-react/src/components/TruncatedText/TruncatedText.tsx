import React from 'react';
import classNames from 'classnames';

import MarkdownComponent from '../MarkdownComponent/MarkdownComponent';

import styles from './TruncatedText.module.scss';

type TruncatedTextProps = {
  text: string;
  maximumLines: number;
  className?: string;
};

const TruncatedText: React.FC<TruncatedTextProps> = ({ text, maximumLines, className }) => {
  return (
    <div
      className={classNames(styles.truncatedText, className)}
      style={{
        maxHeight: `calc(1.5em * ${maximumLines})`,
        WebkitLineClamp: maximumLines,
        lineClamp: maximumLines,
        display: '-webkit-box',
      }}
    >
      <MarkdownComponent markdownString={text} inline />
    </div>
  );
};

export default TruncatedText;
