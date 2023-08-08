import React from 'react';
interface WrapperProps {
  children?: JSX.Element | JSX.Element[];
}
const AppBuilderComponent = import.meta.env.APP_BUILDER_COMPONENT;

const EmptyWrapper = ({ children }: WrapperProps) => {
  return children;
};
const AppWrapper = AppBuilderComponent
  ? //@ts-ignore
    React.lazy(() => {
      /* @vite-ignore */
      return import(`#plugins/appbuilder/AppBuilder`).catch(() => {
        return { default: EmptyWrapper };
      });
    })
  : EmptyWrapper;

export default AppWrapper;
