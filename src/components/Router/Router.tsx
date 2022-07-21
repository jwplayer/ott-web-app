import React from 'react';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import type { BrowserRouterProps, HashRouterProps } from 'react-router-dom';

import { GITHUB_PUBLIC_BASE_URL } from '#src/env';

export default function Router(props: BrowserRouterProps | HashRouterProps) {
  if (GITHUB_PUBLIC_BASE_URL) {
    return <HashRouter {...props} />;
  }
  return <BrowserRouter {...props} />;
}
