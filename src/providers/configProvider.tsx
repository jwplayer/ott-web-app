import React, {
  createContext,
  FunctionComponent,
  ReactNode,
  useEffect,
  useState,
} from 'react';

import loadConfig, { validateConfig } from '../services/config.service';
import type { Config, Options } from '../../types/Config';

const defaultConfig: Config = {
  id: '',
  siteName: '',
  description: '',
  footerText: '',
  player: '',
  assets: {},
  content: [],
  menu: [],
  options: {},
};

export const ConfigContext = createContext<Config>(defaultConfig);

export type ProviderProps = {
  children: ReactNode;
  configLocation: string;
  onLoading: (isLoading: boolean) => void;
  onValidationError: (error: Error) => void;
};

const ConfigProvider: FunctionComponent<ProviderProps> = ({
  children,
  configLocation,
  onLoading,
  onValidationError,
}) => {
  const [config, setConfig] = useState<Config>(defaultConfig);

  useEffect(() => {
    const loadAndValidateConfig = async (configLocation: string) => {
      onLoading(true);
      const config = await loadConfig(configLocation);
      validateConfig(config)
        .then((configValidated) => {
          setConfig(configValidated);
          setCssVariables(configValidated.options);
          onLoading(false);
        })
        .catch((error: Error) => {
          onValidationError(error);
          onLoading(false);
        });
    };
    loadAndValidateConfig(configLocation);
  }, [configLocation, onLoading, onValidationError]);

  const setCssVariables = ({
    backgroundColor = '#000',
    highlightColor = '#fff',
  }: Options) => {
    const root = document.querySelector(':root') as HTMLElement;

    if (root) {
      root.style.setProperty('--background-color', backgroundColor);
      root.style.setProperty('--highlight-color', highlightColor);
    }
  };

  return (
    <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
  );
};

export default ConfigProvider;
