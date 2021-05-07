import React, { memo, useEffect, useRef } from 'react';

import { debounce } from '../../utils/common';

import styles from './DynamicBlur.module.scss';

type ImgState = {
  current: 'first' | 'second' | 'none';
  srcFirst: string;
  srcSecond: string;
};

const defaultImgState: ImgState = {
  current: 'none',
  srcFirst: '',
  srcSecond: '',
};

type Props = {
  url: string;
  transitionTime?: number;
};

const DynamicBlur: React.FC<Props> = ({ url, transitionTime = 1 }: Props) => {
  const image = useRef(defaultImgState);
  const loadImgRef = useRef(debounce((url: string, imgState: ImgState) => loadImage(url, imgState), 350));

  const getImgState = image.current;

  const setImgState = (imgState: ImgState) => {
    image.current = imgState;
  };

  const loadImage = (url: string, imgState: ImgState) => {
    const img = document.createElement('img');
    img.onload = () => {
      setImgState({
        current: imgState.current === 'first' ? 'second' : 'first',
        srcFirst: imgState.current === 'first' ? imgState.srcFirst : url,
        srcSecond: imgState.current === 'second' ? imgState.srcSecond : url,
      });
    };
    if (url) img.src = url;
  };

  useEffect(() => {
    if (url !== getImgState.srcFirst && url !== getImgState.srcSecond) loadImgRef.current(url, getImgState);
  }, [url, getImgState]);

  return (
    <React.Fragment>
      <div
        style={{
          background: `url('${getImgState.srcFirst}')`,
          opacity: getImgState.current === 'first' ? 0.3 : 0,
          transition: `opacity ${transitionTime}s ease-in-out`,
        }}
        className={styles.BlurBackground}
      />
      <div
        style={{
          background: `url('${getImgState.srcSecond}')`,
          opacity: getImgState.current === 'second' ? 0.3 : 0,
          transition: `opacity ${transitionTime}s ease-in-out`,
        }}
        className={styles.BlurBackground}
      />
    </React.Fragment>
  );
};

export default memo(DynamicBlur);
