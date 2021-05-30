import React, { useContext, useEffect } from 'react';
import type { Config } from 'types/Config';
import type { JWPlayer } from 'types/jwplayer';
import type { PlaylistItem } from 'types/playlist';

import { ConfigContext } from '../../providers/ConfigProvider';
import { addScript } from '../../utils/dom';

import styles from './Cinema.module.scss';

type Props = {
  item: PlaylistItem;
};

const Cinema: React.FC<Props> = ({ item }: Props) => {
  const config: Config = useContext(ConfigContext);
  const file = item?.sources[0]?.file;
  const scriptUrl = `https://content.jwplatform.com/libraries/${config.player}.js`;

  useEffect(() => {
    const getPlayer = () => window.jwplayer && (window.jwplayer('cinema') as JWPlayer);
    const setupMedia = () => getPlayer().setup({ file });

    if (config.player) {
      if (!window.jwplayer) addScript(scriptUrl, setupMedia);
      else setupMedia();
    }
  }, [config.player, file, scriptUrl]);

  return <div className={styles.Cinema} id="cinema" />;
};

export default Cinema;
