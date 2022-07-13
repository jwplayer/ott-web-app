import Dropdown from '../Dropdown/Dropdown';

import styles from './ConfigSelect.module.scss';

import { getStoredConfig, setStoredConfig } from '#src/utils/configOverride';
import { logDev } from '#src/utils/common';

const configs = import.meta.glob('../../../test-e2e/data/*.json');

const configOptions = Object.entries(configs).reduce<string[]>((acc, [pth]) => {
  let configName = '';

  try {
    const parts = pth.split('/');
    const fileName = parts.pop();
    configName = fileName?.split('.')[1] as string;
  } catch (err: unknown) {
    logDev('Config file could not be processed: ' + err);
  }

  return configName ? [...acc, configName] : acc;
}, []);

const ConfigSelect = () => {
  const selectedConfig = getStoredConfig() || '';

  const onChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setStoredConfig(event.target.value);
    window.location.reload();
  };

  return (
    <Dropdown
      className={styles.dropdown}
      size="small"
      options={configOptions}
      defaultLabel={'Default config'}
      name="config-select"
      value={selectedConfig}
      onChange={onChange}
    />
  );
};

export default ConfigSelect;
