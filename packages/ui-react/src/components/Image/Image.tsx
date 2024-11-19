import React, { forwardRef, useEffect, useState } from 'react';
import { createURL } from '@jwp/ott-common/src/utils/urlFormatting';
import { logInfo } from '@jwp/ott-common/src/logger';

import styles from './Image.module.scss';

type Props = {
  className?: string;
  image?: string;
  onLoad?: () => void;
  alt?: string;
  width?: number;
};

const setWidth = (url: string, width: number) => {
  return createURL(url, { width });
};

const cache = new Map();

const resolveImageURL = async (imgUrl: string, width: number) => {
  const requestUrl = setWidth(imgUrl, width);
  let url = requestUrl;

  if (cache.has(requestUrl)) {
    return cache.get(requestUrl);
  }

  try {
    const response = await fetch(requestUrl);

    // if redirected, cache and return resolved URL
    if (response.redirected) {
      url = response.url.replace('-1920', `-${width}`);
    }

    cache.set(requestUrl, url);
  } catch (error) {
    logInfo('Image', 'Failed to fetch image', { error, url });
  }

  return url;
};

const Image = forwardRef<HTMLImageElement, Props>(({ className, image, onLoad, alt = '', width = 640 }, ref) => {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!image) return;

    const loadImage = async () => {
      const resolvedImage = await resolveImageURL(image, width);

      setSrc(resolvedImage);
      onLoad?.();
    };

    if (__mode__ === 'test') {
      setSrc(setWidth(image, width));
      onLoad?.();
    } else {
      loadImage();
    }
  }, [image, width, onLoad]);

  if (!src) return null;

  return <img ref={ref} className={`${className} ${styles.image}`} src={src} alt={alt} />;
});

export default React.memo(Image);
