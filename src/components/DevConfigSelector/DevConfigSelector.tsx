import Dropdown from '../Dropdown/Dropdown';

import styles from './DevConfigSelector.module.scss';

import { useConfigNavigate, useConfigSource } from '#src/utils/configOverride';
import { jwDevEnvConfigs, testConfigs } from '#test/constants';
import type { Settings } from '#src/stores/SettingsStore';

interface Props {
  settings: Settings | undefined;
}

const configs = import.meta.env.MODE === 'jwdev' ? jwDevEnvConfigs : testConfigs;
const configOptions: { value: string; label: string }[] = Object.values(configs).map(({ id, label }) => ({ value: id, label: `${id} - ${label}` }));

const DevConfigSelector = ({ settings }: Props) => {
  const selectedConfig = useConfigSource(settings) || '';
  const configNavigate = useConfigNavigate();

  const onChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    configNavigate(event.target.value);
  };

  return <Dropdown className={styles.dropdown} size="small" options={configOptions} name="config-select" value={selectedConfig} onChange={onChange} />;
};

export default DevConfigSelector;
