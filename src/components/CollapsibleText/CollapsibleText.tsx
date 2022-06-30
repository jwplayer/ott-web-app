import classNames from 'classnames';
import React, { useEffect, useRef, useState } from 'react';

import useBreakpoint from '../../hooks/useBreakpoint';
import IconButton from '../IconButton/IconButton';
import ChevronRight from '../../icons/ChevronRight';

import styles from './CollapsibleText.module.scss';

type Props = {
  text: string;
  className?: string;
  maxHeight?: 'none' | number;
};

const CollapsibleText: React.FC<Props> = ({ text, className, maxHeight = 'none' }: Props) => {
  const divRef = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLDivElement>;
  const breakpoint = useBreakpoint();
  const [doesFlowOver, setDoesFlowOver] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const ariaLabel = expanded ? 'Collapse' : 'Expand';

  const clippablePixels = 4;

  useEffect(() => {
    divRef.current &&
      setDoesFlowOver(
        divRef.current.scrollHeight > divRef.current.offsetHeight + clippablePixels || (maxHeight < divRef.current.offsetHeight && maxHeight !== 'none'),
      );
  }, [maxHeight, text, breakpoint]);

  return (
    <div className={classNames(styles.collapsibleText)}>
      <div
        ref={divRef}
        className={classNames(styles.textContainer, className, { [styles.collapsed]: !expanded && doesFlowOver })}
        style={{ maxHeight: expanded ? divRef.current.scrollHeight : maxHeight }}
      >
        {text}
      </div>
      {doesFlowOver && (
        <IconButton aria-label={ariaLabel} className={classNames(styles.chevron, { [styles.expanded]: expanded })} onClick={() => setExpanded(!expanded)}>
          <ChevronRight />
        </IconButton>
      )}
    </div>
  );
};

export default CollapsibleText;
