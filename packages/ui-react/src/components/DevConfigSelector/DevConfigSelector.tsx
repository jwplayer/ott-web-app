import { type ChangeEvent, useCallback } from 'react';
import { createURL } from '@jwp/ott-common/src/utils/urlFormatting';
import { CONFIG_QUERY_KEY } from '@jwp/ott-common/src/constants';
import { jwDevEnvConfigs, testConfigs } from '@jwp/ott-testing/constants';

import Dropdown from '../Dropdown/Dropdown';

import styles from './DevConfigSelector.module.scss';

interface Props {
  selectedConfig: string | undefined;
}

const configs = __mode__ === 'jwdev' ? jwDevEnvConfigs : testConfigs;
const configOptions: { value: string; label: string }[] = [
  { label: 'Select an App Config', value: '' },
  ...Object.values(configs).map(({ id, label }) => ({ value: id, label: `${id.length > 8 ? 'ext-json' : id} - ${label}` })),
];

const DevConfigSelector = ({ selectedConfig }: Props) => {
  const onChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    window.location.href = createURL(window.location.href, { [CONFIG_QUERY_KEY]: event.target.value });
  }, []);

  return (
    <Dropdown
      className={styles.dropdown}
      size="small"
      options={configOptions}
      name="config-select"
      value={selectedConfig || ''}
      onChange={onChange}
      required={true}
      aria-hidden={true}
    />
  );
};

export default DevConfigSelector;
