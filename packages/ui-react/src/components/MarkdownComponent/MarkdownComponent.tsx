import React, { useMemo } from 'react';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import classNames from 'classnames';

import styles from './MarkdownComponent.module.scss';

const renderer = {
  link(href: string, title: string, text: string) {
    const externalLink = /^(https?|www\.|\/\/)/.test(href || '');
    const targetAttr = externalLink ? 'target="_blank"' : undefined;
    const relAttr = externalLink ? 'rel="noopener"' : undefined;
    const titleAttr = title ? `title="${title}"` : undefined;
    const attributes = [targetAttr, relAttr, titleAttr].filter(Boolean);

    return `<a href="${href}" ${attributes.join(' ')}>${text}</a>`;
  },
};

marked.use({ renderer });

type Props = {
  markdownString: string;
  className?: string;
  inline?: boolean;
  tag?: string;
};

const MarkdownComponent: React.FC<Props> = ({ markdownString, className, tag = 'div', inline = false }) => {
  const sanitizedHTMLString = useMemo(() => {
    const parseDelegate = inline ? marked.parseInline : marked.parse;
    const dirtyHTMLString = parseDelegate(markdownString);

    return DOMPurify.sanitize(dirtyHTMLString, { ADD_ATTR: ['target'] });
  }, [inline, markdownString]);

  return React.createElement(tag, { dangerouslySetInnerHTML: { __html: sanitizedHTMLString }, className: classNames(styles.markdown, className) });
};

export default MarkdownComponent;
