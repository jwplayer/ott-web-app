import { type PropsWithChildren } from 'react';
import Hero from '@jwp/ott-ui-react/src/components/Hero/Hero';
import useBreakpoint, { Breakpoint } from '@jwp/ott-ui-react/src/hooks/useBreakpoint';

import styles from './MediaHero.module.scss';

const MediaHero = ({ image, children }: PropsWithChildren<{ image?: string }>) => {
  const breakpoint = useBreakpoint();

  return (
    <header id="video-details">
      <Hero image={image} infoClassName={breakpoint < Breakpoint.md ? styles.infoSmallScreenReorder : undefined}>
        {children}
      </Hero>
    </header>
  );
};

export default MediaHero;
