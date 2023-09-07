import i18next from 'i18next';

import type { Config } from '#types/Config';
import { configSchema } from '#src/utils/configSchema';

export const loadConfig = async (configLocation: string) => {
  if (!configLocation) {
    throw new Error('No config location found');
  }

  const response = await fetch(configLocation, {
    headers: {
      Accept: 'application/json',
    },
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Failed to load the config. Please check the config path and the file availability.');
  }

  const data = await response.json();

  if (!data) {
    throw new Error('No config found');
  }

  return enrichConfig(data);
};

const enrichConfig = (config: Config): Config => {
  const { content, siteName } = config;
  const updatedContent = content.map((content) => Object.assign({ featured: false }, content));

  return { ...config, siteName: siteName || i18next.t('common:default_site_name'), content: updatedContent };
};

export const validateConfig = (config?: Config): Promise<Config> => {
  return configSchema.validate(config, {
    strict: true,
  }) as Promise<Config>;
};
