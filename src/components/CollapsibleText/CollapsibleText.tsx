import classNames from 'classnames';
import React, { useEffect, useRef, useState } from 'react';

import IconButton from '../IconButton/IconButton';
import ChevronRight from '../../icons/ChevronRight';

import styles from './CollapsibleText.module.scss';

type Props = {
  text: string;
  className?: string;
  maxHeight?: 'none' | number;
};

const CollapsibleText: React.FC<Props> = ({ text, className, maxHeight = 'none' }: Props) => {
  const dummyDiv = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLDivElement>;
  const [doesFlowOver, setDoesFlowOver] = useState(false);
  const [collapsed, setCollapsed] = useState(true);

  const ariaLabel = collapsed ? 'Expand' : 'Collapse';

  useEffect(() => {
    dummyDiv.current && setDoesFlowOver(dummyDiv.current.scrollHeight > dummyDiv.current?.offsetHeight);
  }, [maxHeight]);

  return (
    <div className={classNames(styles.collapsibleText)}>
      <div ref={dummyDiv} className={styles.dummyDiv} style={{ maxHeight }}>
        {text}
      </div>
      <div
        className={classNames(styles.textContainer, className, { [styles.collapsed]: collapsed && doesFlowOver })}
        style={{ maxHeight: collapsed ? maxHeight : 'none' }}
      >
        {text}
      </div>
      {doesFlowOver && (
        <IconButton
          aria-label={ariaLabel}
          className={classNames(styles.chevron, { [styles.expanded]: !collapsed })}
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronRight />
        </IconButton>
      )}
    </div>
  );
};

export default CollapsibleText;
