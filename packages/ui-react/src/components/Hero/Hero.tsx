import classNames from 'classnames';
import React from 'react';

import useBreakpoint, { Breakpoint } from '../../hooks/useBreakpoint';
import CollapsibleText from '../CollapsibleText/CollapsibleText';
import Image from '../Image/Image';

import styles from './Hero.module.scss';

type Props = {
  title: string;
  description: string;
  image?: string;
};

const Hero = ({ title, description, image }: Props) => {
  const breakpoint: Breakpoint = useBreakpoint();
  const isMobile = breakpoint === Breakpoint.xs;
  const alt = ''; // intentionally empty for a11y, because adjacent text alternative

  return (
    <div className={classNames(styles.hero, styles.heroPadding)}>
      <Image className={styles.poster} image={image} width={1280} alt={alt} />
      <div className={styles.posterFade} />
      <div className={styles.info}>
        <h1 className={styles.title}>{title}</h1>
        <CollapsibleText text={description} className={styles.description} maxHeight={isMobile ? 60 : 'none'} />
      </div>
    </div>
  );
};

export default Hero;
