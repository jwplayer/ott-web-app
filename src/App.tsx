import React, { useEffect, useState } from 'react';
import { getI18n, I18nextProvider } from 'react-i18next';

import QueryProvider from '#src/providers/QueryProvider';
import '#src/screenMapping';
import '#src/styles/main.scss';
import initI18n from '#src/i18n/config';
import ErrorPage from '#src/components/ErrorPage/ErrorPage';
import Router from '#src/containers/Router/Router';
import LoadingOverlay from '#src/components/LoadingOverlay/LoadingOverlay';

interface State {
  isLoading: boolean;
  error?: Error;
}

export default function App() {
  const [{ isLoading, error }, setState] = useState<State>({ isLoading: true });

  useEffect(() => {
    initI18n()
      .then(() => setState({ isLoading: false }))
      .catch((e) => setState({ isLoading: false, error: e as Error }));
  }, []);

  if (isLoading) {
    return <LoadingOverlay />;
  }

  if (error) {
    // Don't be tempted to translate these strings. If i18n fails to load, translations won't work anyhow
    return (
      <ErrorPage
        disableFallbackTranslation={true}
        title={'Unable to load translations'}
        message={'Check your language settings and try again later. If the problem persists contact technical support.'}
        error={error}
      />
    );
  }

  return (
    <I18nextProvider i18n={getI18n()}>
      <QueryProvider>
        <Router />
      </QueryProvider>
    </I18nextProvider>
  );
}
