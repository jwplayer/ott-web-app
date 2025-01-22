import classNames from 'classnames';
import React, { useEffect, useRef, useState } from 'react';
import ChevronRight from '@jwp/ott-theme/assets/icons/chevron_right.svg?react';

import IconButton from '../IconButton/IconButton';
import Icon from '../Icon/Icon';
import useBreakpoint from '../../hooks/useBreakpoint';
import MarkdownComponent from '../MarkdownComponent/MarkdownComponent';

import styles from './CollapsibleText.module.scss';

type Props = {
  text: string;
  className?: string;
};

const CollapsibleText: React.FC<Props> = ({ text, className }: Props) => {
  const divRef = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLDivElement>;
  const breakpoint = useBreakpoint();
  const [doesFlowOver, setDoesFlowOver] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const ariaLabel = expanded ? 'Collapse' : 'Expand';

  const clippablePixels = 4;
  const maxHeight = 60;

  useEffect(() => {
    if (divRef.current) {
      setDoesFlowOver(divRef.current.scrollHeight > divRef.current.offsetHeight + clippablePixels || maxHeight < divRef.current.offsetHeight);
    }
  }, [maxHeight, text, breakpoint]);

  return (
    <div className={classNames(styles.collapsibleText)}>
      <p
        ref={divRef}
        id="collapsible-content"
        className={classNames(styles.textContainer, className, { [styles.collapsed]: !expanded && doesFlowOver })}
        style={{ maxHeight: expanded ? divRef.current.scrollHeight : maxHeight }}
      >
        <MarkdownComponent tag="span" markdownString={text} inline />
      </p>
      {doesFlowOver && (
        <IconButton
          aria-label={ariaLabel}
          aria-expanded={expanded}
          aria-controls="collapsible-content"
          className={classNames(styles.chevron, { [styles.expanded]: expanded })}
          onClick={() => setExpanded(!expanded)}
        >
          <Icon icon={ChevronRight} />
        </IconButton>
      )}
    </div>
  );
};

export default CollapsibleText;
