import React, { memo, useEffect, useRef, useState } from 'react';

import { debounce } from '../../utils/common';

import styles from './DynamicBlur.module.scss';

type Props = {
  url: string;
  transitionTime?: number;
  debounceTime?: number;
};

const DynamicBlur = ({ url, transitionTime = 1, debounceTime = 350 }: Props): JSX.Element => {
  const [currentUrl, setCurrentUrl] = useState<string>();
  const [currentImg, setCurrentImg] = useState<number>();
  const firstImage = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLDivElement>;
  const secondImage = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLDivElement>;
  const loadImgDebounced = useRef(debounce((url: string, currentImg: number) => loadImage(url, currentImg), debounceTime));

  const loadImage = (url: string, currentImg: number) => {
    const img = document.createElement('img');
    img.onload = () => {
      if (!firstImage.current || !secondImage.current) {
        return;
      }
      if (currentImg !== 1) {
        firstImage.current.style.backgroundImage = `url('${url}')`;
        firstImage.current.style.opacity = '1';
        secondImage.current.style.opacity = '0';
        return setCurrentImg(1);
      } else {
        secondImage.current.style.backgroundImage = `url('${url}')`;
        firstImage.current.style.opacity = '0';
        secondImage.current.style.opacity = '1';
        return setCurrentImg(2);
      }
    };
    img.src = url;
  };

  useEffect(() => {
    if (url && url !== currentUrl) {
      setCurrentUrl(url);
      loadImgDebounced.current(url, currentImg);
    }
  }, [url, currentUrl, currentImg]);

  return (
    <React.Fragment>
      <div ref={firstImage} style={{ transition: `opacity ${transitionTime}s ease-in-out` }} className={styles.BlurBackground} />
      <div ref={secondImage} style={{ transition: `opacity ${transitionTime}s ease-in-out` }} className={styles.BlurBackground} />
    </React.Fragment>
  );
};

export default memo(DynamicBlur);
