import React, { useContext } from 'react';
import type { Config, Content } from 'types/Config';

import Shelf from '../../container/Shelf/Shelf';
import { ConfigContext } from '../../providers/configProvider';

import styles from './Home.module.scss';

const Home  = () : JSX.Element => {
  const config: Config     = useContext(ConfigContext);
  const content: Content[] = config?.content;

  return (
    <div className={styles['Home']}>
      {content.slice(0,1).map((contentItem: Content) => (
        <Shelf
          key={contentItem.playlistId}
          playlistId={contentItem.playlistId}
          featured={contentItem.featured === true}
        />
      ))}
    </div>
  );
};

export default Home;
