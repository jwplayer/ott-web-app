import React from 'react';
import classNames from 'classnames';

import styles from './Image.module.scss';

import { addQueryParams } from '#src/utils/formatting';

type Props = {
  className?: string;
  image?: string;
  onLoad?: () => void;
  alt?: string;
  width?: number;
};

const setWidth = (url: string, width: number) => {
  return addQueryParams(url, { width });
};

const Image = ({ className, image, onLoad, alt = '', width = 640 }: Props) => {
  const handleLoad = () => {
    if (onLoad) onLoad();
  };

  if (!image) return null;

  return <img className={classNames(className, styles.image)} src={setWidth(image, width)} onLoad={handleLoad} alt={alt} />;
};

export default React.memo(Image);
