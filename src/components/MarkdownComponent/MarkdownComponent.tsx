import classNames from 'classnames';
import React from 'react';
import ReactMarkdown from 'react-markdown';

import styles from './MarkdownComponent.module.scss';

type Props = {
  markdownString: string;
  className?: string;
  disallowedElements?: string[];
};

const MarkdownComponent: React.FC<Props> = ({ markdownString, className, disallowedElements }: Props) => {
  return (
    <ReactMarkdown
      className={classNames(styles.markdown, className)}
      components={{
        a: ({ node, href, children, ...props }) => {
          const externalLink = /^(https?|www\.|\/\/)/.test(href || '');
          const target = externalLink ? '_blank' : undefined;
          const rel = externalLink ? 'noopener' : undefined;
          return (
            <a {...props} href={href} target={target} rel={rel}>
              {children}
            </a>
          );
        },
      }}
      disallowedElements={disallowedElements}
      unwrapDisallowed
    >
      {markdownString}
    </ReactMarkdown>
  );
};

export default MarkdownComponent;
