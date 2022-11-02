import Dropdown from '../Dropdown/Dropdown';

import styles from './DevConfigSelector.module.scss';

import { configQueryKey, getConfigLocation } from '#src/utils/configOverride';
import { jwDevEnvConfigs, testConfigs } from '#test/constants';

const configs = import.meta.env.MODE === 'jwdev' ? jwDevEnvConfigs : testConfigs;
const configOptions: { value: string; label: string }[] = Object.values(configs).map(({ id, label }) => ({ value: id, label: `${id} - ${label}` }));

const DevConfigSelector = () => {
  const selectedConfig = getConfigLocation() || '';

  const onChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const url = new URL(window.location.href);

    url.searchParams.set(configQueryKey, event.target.value);
    window.location.href = url.toString();
  };

  return <Dropdown className={styles.dropdown} size="small" options={configOptions} name="config-select" value={selectedConfig} onChange={onChange} />;
};

export default DevConfigSelector;
