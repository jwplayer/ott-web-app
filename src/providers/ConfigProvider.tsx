import React, { FunctionComponent, useEffect, useState } from 'react';
import merge from 'lodash.merge';

import { calculateContrastColor } from '../utils/common';
import loadConfig, { validateConfig } from '../services/config.service';
import type { AccessModel, Config, Styling } from '../../types/Config';
import LoadingOverlay from '../components/LoadingOverlay/LoadingOverlay';
import { addScript } from '../utils/dom';
import { useConfigStore } from '../stores/ConfigStore';

const defaultConfig: Config = {
  id: '',
  siteName: '',
  description: '',
  player: '',
  assets: {},
  content: [],
  menu: [],
  integrations: {
    cleeng: {
      id: null,
      useSandbox: true,
    },
  },
  styling: {
    footerText: '',
    shelfTitles: true,
  },
  features: {
    enableSharing: true,
  },
};

export type Props = {
  children: JSX.Element;
  configLocation: string;
  onLoading: (isLoading: boolean) => void;
  onValidationError: (error: Error) => void;
  onValidationCompleted: (config: Config) => void;
};

const ConfigProvider: FunctionComponent<Props> = ({ children, configLocation, onLoading, onValidationError, onValidationCompleted }) => {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadAndValidateConfig = async (configLocation: string) => {
      onLoading(true);
      setLoading(true);
      const config = await loadConfig(configLocation).catch((error) => {
        onValidationError(error);
      });

      if (!config) {
        onLoading(false);
        setLoading(false);

        return;
      }

      validateConfig(config)
        .then((configValidated) => {
          const configWithDefaults = merge({}, defaultConfig, configValidated);

          const accessModel = calculateAccessModel(configWithDefaults);
          useConfigStore.setState({
            config: configWithDefaults,
            accessModel,
          });

          setCssVariables(configValidated.styling);
          maybeInjectAnalyticsLibrary(config);
          onLoading(false);
          setLoading(false);
          onValidationCompleted(config);
        })
        .catch((error: Error) => {
          onValidationError(error);
          onLoading(false);
          setLoading(false);
        });
    };
    loadAndValidateConfig(configLocation);
  }, [configLocation, onLoading, onValidationError, onValidationCompleted]);

  const setCssVariables = ({ backgroundColor, highlightColor, headerBackground }: Styling) => {
    const root = document.querySelector(':root') as HTMLElement;

    if (root && backgroundColor) {
      root.style.setProperty('--body-background-color', backgroundColor);
      root.style.setProperty('--background-contrast-color', calculateContrastColor(backgroundColor));
    }

    if (root && highlightColor) {
      root.style.setProperty('--highlight-color', highlightColor);
      root.style.setProperty('--highlight-contrast-color', calculateContrastColor(highlightColor));
    }
    if (root && headerBackground) {
      root.style.setProperty('--header-background', headerBackground);
      root.style.setProperty('--header-contrast-color', calculateContrastColor(headerBackground));
    }
  };

  const maybeInjectAnalyticsLibrary = (config: Config) => {
    if (!config.analyticsToken) return;

    return addScript('/jwpltx.js');
  };

  const calculateAccessModel = (config: Config): AccessModel => {
    const { id, monthlyOffer, yearlyOffer } = config?.integrations?.cleeng || {};

    if (!id) return 'AVOD';
    if (!monthlyOffer && !yearlyOffer) return 'AUTHVOD';
    return 'SVOD';
  };

  return loading ? <LoadingOverlay /> : children;
};

export default ConfigProvider;
