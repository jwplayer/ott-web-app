import React, { memo, useEffect, useMemo, useRef, useState } from 'react';

import styles from './DynamicBlur.module.scss';

import { debounce } from '#src/utils/common';
import Fade from '#components/Animation/Fade/Fade';
import Image from '#components/Image/Image';
import type { ImageData } from '#types/playlist';

type Props = {
  image: ImageData;
  transitionTime?: number;
  debounceTime?: number;
};

type ImageCursor = {
  image: ImageData;
  visible: boolean;
  loading: boolean;
  key: string;
};

const DynamicBlur = ({ image, transitionTime = 1, debounceTime = 350 }: Props): JSX.Element => {
  const [images, setImages] = useState<ImageCursor[]>([]);
  const keyRef = useRef(0);
  const updateImage = useMemo(
    () =>
      debounce((image) => {
        setImages((current) => [
          {
            image,
            visible: true,
            loading: true,
            key: `key_${keyRef.current++}`,
          },
          ...current,
        ]);
      }, debounceTime),
    [debounceTime],
  );

  useEffect(() => {
    if (image) updateImage(image);
  }, [updateImage, image]);

  const handleClose = (key: string) => {
    setImages((current) => current.filter((image) => image.key !== key));
  };

  const handleLoad = (key: string) => {
    setImages((current) =>
      current.map((image) => {
        if (image.key === key) {
          return { ...image, loading: false };
        }
        return { ...image, visible: false };
      }),
    );
  };

  return (
    <div className={styles.dynamicBlur}>
      {images.map((cursor) => (
        <Fade
          duration={transitionTime * 1000}
          open={cursor.visible && !cursor.loading}
          delay={cursor.visible ? 100 : 0}
          key={cursor.key}
          onCloseAnimationEnd={() => handleClose(cursor.key)}
          keepMounted
        >
          <Image className={styles.image} image={cursor.image} onLoad={() => handleLoad(cursor.key)} width={1280} />
        </Fade>
      ))}
    </div>
  );
};

export default memo(DynamicBlur);
