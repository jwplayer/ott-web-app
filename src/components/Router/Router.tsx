import React from 'react';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import type { BrowserRouterProps, HashRouterProps } from 'react-router-dom';

export default function Router(props: BrowserRouterProps | HashRouterProps) {
  if (import.meta.env.APP_PUBLIC_GITHUB_PAGES) {
    return <HashRouter {...props} />;
  }
  return <BrowserRouter {...props} />;
}
