import React from 'react';
import classNames from 'classnames';

import CollapsibleText from '../CollapsibleText/CollapsibleText';
import TruncatedText from '../TruncatedText/TruncatedText';
import useBreakpoint, { Breakpoint } from '../../hooks/useBreakpoint';

import styles from './Hero.module.scss';

const HeroDescription = ({ className, description, maximumLines = 8 }: { className?: string; description: string; maximumLines?: number }) => {
  const breakpoint: Breakpoint = useBreakpoint();
  const isMobile = breakpoint <= Breakpoint.sm;

  return isMobile ? (
    <CollapsibleText text={description} className={classNames(styles.description, className)} />
  ) : (
    <TruncatedText text={description} maximumLines={maximumLines} className={classNames(styles.description, className)} />
  );
};

export default HeroDescription;
