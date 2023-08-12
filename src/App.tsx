import React, { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';

import QueryProvider from '#src/containers/QueryProvider/QueryProvider';
import '#src/screenMapping';
import '#src/styles/main.scss';
import initI18n from '#src/i18n/config';
import Root from '#components/Root/Root';
import { ErrorPageWithoutTranslation } from '#components/ErrorPage/ErrorPage';
import LoadingOverlay from '#components/LoadingOverlay/LoadingOverlay';

interface State {
  isLoading: boolean;
  error?: Error;
}

export default function App() {
  const [i18nState, seti18nState] = useState<State>({ isLoading: true });

  useEffect(() => {
    initI18n()
      .then(() => seti18nState({ isLoading: false }))
      .catch((e) => seti18nState({ isLoading: false, error: e as Error }));
  }, []);

  if (i18nState.isLoading) {
    return <LoadingOverlay />;
  }

  if (i18nState.error) {
    // Don't be tempted to translate these strings. If i18n fails to load, translations won't work anyhow
    return (
      <ErrorPageWithoutTranslation
        title={'Unable to load translations'}
        message={'Check your language settings and try again later. If the problem persists contact technical support.'}
        error={i18nState.error}
      />
    );
  }

  return (
    <QueryProvider>
      <BrowserRouter>
        <Root />
      </BrowserRouter>
    </QueryProvider>
  );
}
