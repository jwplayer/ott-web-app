import React, { useContext, useEffect, useState } from 'react';
import type { Config } from 'types/Config';
import type { PlaylistItem } from 'types/playlist';

import { ConfigContext } from '../../providers/ConfigProvider';
import { addScript } from '../../utils/dom';

import styles from './Cinema.module.scss';

type Props = {
  item: PlaylistItem;
  onPlay: () => void;
  onPause: () => void;
};

const Cinema: React.FC<Props> = ({ item, onPlay, onPause }: Props) => {
  const config: Config = useContext(ConfigContext);
  const file = item?.sources[0]?.file;
  const scriptUrl = `https://content.jwplatform.com/libraries/${config.player}.js`;
  const [init, setInit] = useState(true);

  useEffect(() => {
    const getPlayer = () => window.jwplayer && (window.jwplayer('cinema') as jwplayer.JWPlayer);
    const setupMedia = () => {
      if (init) {
        const player = getPlayer();
        player.setup({ file });
        player.on('ready', () => console.info('Player ready'));
        player.on('play', () => onPlay());
        player.on('pause', () => onPause());
        setInit(false);
      }
    };

    if (config.player) {
      if (!window.jwplayer) addScript(scriptUrl, setupMedia);
      else setupMedia();
    }
  }, [config.player, file, scriptUrl, onPlay, onPause, init]);

  return <div className={styles.Cinema} id="cinema" />;
};

export default Cinema;
