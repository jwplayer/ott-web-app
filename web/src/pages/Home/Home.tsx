import React from 'react';
import shallow from 'zustand/shallow';
import type { Content } from '@jwplayer/ott-common/types/Config';
import { useConfigStore } from '@jwplayer/ott-common/src/stores/ConfigStore';

import ShelfList from '../../containers/ShelfList/ShelfList';

const Home = () => {
  const { config } = useConfigStore(({ config, accessModel }) => ({ config, accessModel }), shallow);
  const content: Content[] = config?.content;

  return <ShelfList rows={content} />;
};

export default Home;
