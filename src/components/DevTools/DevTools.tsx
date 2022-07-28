import { useMemo, useState } from 'react';

import styles from './DevTools.module.scss';

import Dropdown from '#src/components/Dropdown/Dropdown';
import IconButton from '#src/components/IconButton/IconButton';
import Sidebar from '#src/components/Sidebar/Sidebar';
import Settings from '#src/icons/Settings';
import { getStoredConfig, setStoredConfig } from '#src/utils/configOverride';
import { CONFIG_DEFAULT_SOURCE, INCLUDE_CONFIGS } from '#src/env';
import { logDev } from '#src/utils/common';
import { useConfigStore } from '#src/stores/ConfigStore';

// Dynamic value doesn't work for some reason
const getConfigs = () => {
  switch (INCLUDE_CONFIGS) {
    case 'test':
      return import.meta.glob(`../../../configs/test/*.json`);
    case 'prod':
      return import.meta.glob(`../../../configs/prod/*.json`);
    default:
      return [];
  }
};

/**
 * avod-subs--config.json -> Blender Avod Subs
 *
 * We transform the stored config names into readable ones to show in a Select control
 *
 * 1. We remove '--config' part
 * 2. We split words by '-' and add uppercase to the first word's letter
 * 3. We add siteName to the config
 * */
const getReadableConfigName = (siteName: string | undefined, configName: string | undefined | null) => {
  if (!configName) {
    return '';
  }

  const name = configName
    ?.split('--')[0]
    .split('-')
    .map((str) => str.charAt(0).toUpperCase() + str.slice(1))
    .join(' ');

  return siteName ? `${siteName} ${name}` : name;
};

/**
 * Blender Avod Subs  -> avod-subs--config.json
 *
 * 1. We remove siteName from the config
 * 2. We combine words with '-' looking at word breaks
 * 3. We add '--config' part
 *
 */
const getSystemConfigName = (siteName: string | undefined, configName: string | undefined) =>
  configName
    ?.replace(siteName || '', '')
    .trim()
    .toLowerCase()
    .split(' ')
    .join('-') + '--config';

const getConfigOptions = (siteName: string | undefined) =>
  Object.entries(getConfigs()).reduce<string[]>((acc, [pth]) => {
    let configName = '';

    try {
      const parts = pth.split('/');
      const fileName = parts.pop();
      configName = getReadableConfigName(siteName, fileName);
    } catch (err: unknown) {
      logDev('Config file could not be processed: ' + err);
    }

    return configName ? [...acc, configName] : acc;
  }, []);

const DevTools = () => {
  const [showConfigs, setShowConfigs] = useState(false);
  const siteName = useConfigStore((s) => s.config.siteName);

  const configOptions = useMemo(() => getConfigOptions(siteName), [siteName]);
  const selectedConfig = getReadableConfigName(siteName, getStoredConfig() || CONFIG_DEFAULT_SOURCE) || '';
  const defaultLabel = !configOptions.includes(selectedConfig || '') ? getReadableConfigName(siteName, selectedConfig) : undefined;

  const onChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setStoredConfig(getSystemConfigName(siteName, event.target.value));
    window.location.reload();
  };

  return (
    <div>
      <Sidebar isOpen={showConfigs} onClose={() => setShowConfigs(false)}>
        <div className={styles.container}>
          <Dropdown
            label="Select config"
            required
            className={styles.dropdown}
            size="small"
            options={configOptions}
            defaultLabel={defaultLabel}
            name="config-select"
            value={selectedConfig}
            onChange={onChange}
          />
        </div>
      </Sidebar>
      <IconButton className={styles.button} aria-label="show-configs-switcher" onClick={() => setShowConfigs(true)}>
        <Settings />
      </IconButton>
    </div>
  );
};

export default DevTools;
