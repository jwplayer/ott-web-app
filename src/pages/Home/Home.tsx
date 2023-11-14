import React from 'react';
import shallow from 'zustand/shallow';

import { useConfigStore } from '#src/stores/ConfigStore';
import type { Content } from '#types/Config';
import ShelfList from '#src/containers/ShelfList/ShelfList';

const Home = () => {
  const { config } = useConfigStore(({ config, accessModel }) => ({ config, accessModel }), shallow);
  const content: Content[] = config?.content;

  return <ShelfList rows={content} />;
};

export default Home;
