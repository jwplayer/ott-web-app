import { ChangeEvent, useCallback } from 'react';
import { useNavigate } from 'react-router';

import styles from './DevConfigSelector.module.scss';

import Dropdown from '#components/Dropdown/Dropdown';
import { getConfigNavigateCallback } from '#src/utils/configOverride';
import { jwDevEnvConfigs, testConfigs } from '#test/constants';

interface Props {
  selectedConfig: string | undefined;
}

const configs = import.meta.env.MODE === 'jwdev' ? jwDevEnvConfigs : testConfigs;
const configOptions: { value: string; label: string }[] = [
  { label: 'Select an App Config', value: '' },
  ...Object.values(configs).map(({ id, label }) => ({ value: id, label: `${id.length > 8 ? 'ext-json' : id} - ${label}` })),
];

const DevConfigSelector = ({ selectedConfig }: Props) => {
  const configNavigate = getConfigNavigateCallback(useNavigate());

  const onChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      configNavigate(event.target.value);
    },
    [configNavigate],
  );

  return (
    <Dropdown
      className={styles.dropdown}
      size="small"
      options={configOptions}
      name="config-select"
      value={selectedConfig || ''}
      onChange={onChange}
      required={true}
    />
  );
};

export default DevConfigSelector;
