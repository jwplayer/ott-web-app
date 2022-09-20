import React, { memo, useEffect, useMemo, useRef, useState } from 'react';

import styles from './DynamicBlur.module.scss';

import { debounce } from '#src/utils/common';
import Fade from '#src/components/Animation/Fade/Fade';
import Image from '#src/components/Image/Image';

type Props = {
  image: string;
  fallbackImage?: string;
  transitionTime?: number;
  debounceTime?: number;
};

type ImageCursor = {
  image: string;
  fallbackImage?: string;
  visible: boolean;
  loading: boolean;
  key: string;
};

const DynamicBlur = ({ image, fallbackImage, transitionTime = 1, debounceTime = 350 }: Props): JSX.Element => {
  const [images, setImages] = useState<ImageCursor[]>([]);
  const keyRef = useRef(0);
  const updateImage = useMemo(
    () =>
      debounce((image, fallbackImage) => {
        setImages((current) => [
          {
            image,
            fallbackImage,
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
    if (image) updateImage(image, fallbackImage);
  }, [updateImage, image, fallbackImage]);

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
          <Image className={styles.image} src={cursor.image} fallbackSrc={cursor.fallbackImage} onLoad={() => handleLoad(cursor.key)} />
        </Fade>
      ))}
    </div>
  );
};

export default memo(DynamicBlur);
