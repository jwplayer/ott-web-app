import React, { type FC } from 'react';

import { container } from './container';

// This HOC is used to override a component top-level, using Inversify
// More info: platforms/web/src/modules/register.ts
const createInjectableComponent = <Props extends object>(identifier: symbol, DefaultComponent: FC<Props>) => {
  return (props: Props) => {
    const isOverridden = container.isBound(identifier);

    if (isOverridden) {
      const OverriddenComponent = container.get<FC<Props>>(identifier);

      return <OverriddenComponent {...props} />;
    }

    return <DefaultComponent {...props} />;
  };
};

export default createInjectableComponent;
