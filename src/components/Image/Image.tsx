import React, { useEffect, useState } from 'react';
import classNames from 'classnames';

import styles from './Image.module.scss';

import { addQueryParams } from '#src/utils/formatting';

type Props = {
  className?: string;
  src?: string;
  fallbackSrc?: string;
  onLoad?: () => void;
  alt?: string;
  width?: number;
};

const setWidth = (url: string, width: number) => {
  return addQueryParams(url, { width });
};

const Image = ({ className, src, fallbackSrc, onLoad, alt = '', width = 640 }: Props) => {
  const [imgSrc, setImgSrc] = useState(src);

  const handleLoad = () => {
    if (onLoad) onLoad();
  };

  const handleError = () => {
    if (fallbackSrc && fallbackSrc !== src) {
      setImgSrc(fallbackSrc);
    }
  };

  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  if (!imgSrc) return null;

  return <img className={classNames(className, styles.image)} src={setWidth(imgSrc, width)} onLoad={handleLoad} onError={handleError} alt={alt} />;
};

export default React.memo(Image);
