import React, { createContext, FunctionComponent, ReactNode, useState } from 'react';

export type UpdateBlurImage = (image: string) => void;
export type BlurImage = string;
export type UIContext = {
  blurImage: BlurImage;
  updateBlurImage: UpdateBlurImage;
};

const defaultContext: UIContext = {
  blurImage: '',
  updateBlurImage: () => '',
};

export const UIStateContext = createContext<UIContext>(defaultContext);

export type ProviderProps = {
  children: ReactNode;
};

const UIStateProvider: FunctionComponent<ProviderProps> = ({ children }) => {
  const [blurImage, setBlurImage] = useState<BlurImage>(() => defaultContext.blurImage);
  const updateBlurImage: UpdateBlurImage = (image: BlurImage) => setBlurImage(image);

  return <UIStateContext.Provider value={{ blurImage, updateBlurImage }}>{children}</UIStateContext.Provider>;
};

export default UIStateProvider;
