import React from 'react';
import { shallow } from '@jwp/ott-common/src/utils/compare';
import type { Content } from '@jwp/ott-common/types/config';
import { useConfigStore } from '@jwp/ott-common/src/stores/ConfigStore';
import { useTranslation } from 'react-i18next';
import { useFilterContent } from '@jwp/ott-ui-react/src/hooks/useFilteredContent';
import { isTruthyCustomParamValue } from '@jwp/ott-common/src/utils/common';

import ShelfList from '../../containers/ShelfList/ShelfList';

const Home = () => {
  const { config } = useConfigStore(({ config, accessModel }) => ({ config, accessModel }), shallow);
  const content: Content[] = config?.content;
  const { t } = useTranslation('common');
  const labelsFilteringEnabled = isTruthyCustomParamValue(config?.custom?.enableLabelsFiltering);
  const configContent = useFilterContent({ content, labelsFilteringEnabled });

  return (
    <>
      <h1 className="hideUntilFocus">{t('home')}</h1>
      <ShelfList rows={configContent} />
    </>
  );
};

export default Home;
