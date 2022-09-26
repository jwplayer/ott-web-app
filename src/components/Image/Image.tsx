import React, { useEffect, useState } from 'react';
import classNames from 'classnames';

import styles from './Image.module.scss';

import { addQueryParams } from '#src/utils/formatting';
import type { ImageData } from '#types/playlist';

type Props = {
  className?: string;
  image?: ImageData;
  onLoad?: () => void;
  alt?: string;
  width?: number;
};

const setWidth = (url: string, width: number) => {
  return addQueryParams(url, { width });
};

const Image = ({ className, image, onLoad, alt = '', width = 640 }: Props) => {
  const [imgSrc, setImgSrc] = useState(image?.image);

  const handleLoad = () => {
    if (onLoad) onLoad();
  };

  const handleError = () => {
    if (image?.fallbackImage && image.fallbackImage !== image.image) {
      setImgSrc(image?.fallbackImage);
    }
  };

  useEffect(() => {
    setImgSrc(image?.image);
  }, [image]);

  if (!imgSrc) return null;

  return <img className={classNames(className, styles.image)} src={setWidth(imgSrc, width)} onLoad={handleLoad} onError={handleError} alt={alt} />;
};

export default React.memo(Image);
