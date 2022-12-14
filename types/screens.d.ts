import React from 'react';

export type ScreenComponent<T> = React.VFC<{ data: T; isLoading: boolean }>;
