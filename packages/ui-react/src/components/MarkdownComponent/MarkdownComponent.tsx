import React, { useMemo } from 'react';
import DOMPurify from 'dompurify';
import { marked, Renderer, type Tokens } from 'marked';
import classNames from 'classnames';

import styles from './MarkdownComponent.module.scss';

const defaultRenderer = new Renderer();
const renderer = {
  link(this: Renderer, { href, title, tokens }: Tokens.Link): string {
    const text = this.parser.parseInline(tokens); // this parses the link content as well (e.g. images)
    const externalLink = /^(https?|www\.|\/\/)/.test(href || '');
    const targetAttr = externalLink ? 'target="_blank"' : undefined;
    const relAttr = externalLink ? 'rel="noopener"' : undefined;
    const titleAttr = title ? `title="${title}"` : undefined;
    const attributes = [targetAttr, relAttr, titleAttr].filter(Boolean);

    return `<a href="${href}" ${attributes.join(' ')}>${text}</a>`;
  },
  image(this: Renderer, tokens: Tokens.Image) {
    // prevent rendering images when gfm is disabled (for inline markdown)
    return this.options.gfm ? defaultRenderer.image(tokens) : '';
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
    const dirtyHTMLString = inline ? marked.parseInline(markdownString, { async: false }) : marked.parse(markdownString, { async: false });

    return DOMPurify.sanitize(dirtyHTMLString, { ADD_ATTR: ['target'] });
  }, [inline, markdownString]);

  return React.createElement(tag, {
    dangerouslySetInnerHTML: { __html: sanitizedHTMLString },
    className: classNames(styles.markdown, inline && styles.inline, className),
  });
};

export default MarkdownComponent;
