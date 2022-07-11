import { useTranslation } from 'react-i18next';

import Dropdown from '../Dropdown/Dropdown';

import styles from './ConfigSelect.module.scss';

import { getStoredConfig, setStoredConfig } from '#src/utils/configOverride';

const configs = import.meta.glob('../../../test-e2e/data/*.json');

const configOptions = Object.entries(configs).reduce<string[]>((acc, [pth]) => {
  const parts = pth.split('/');
  const fileName = parts.pop();
  const configName = fileName?.split('.')[1] as string;

  return [...acc, configName];
}, []);

const ConfigSelect = () => {
  const { t } = useTranslation('common');

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
      aria-label={t('select_config')}
    />
  );
};

export default ConfigSelect;
