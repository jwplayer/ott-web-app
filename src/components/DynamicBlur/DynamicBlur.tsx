import React, { memo, useEffect, useRef, useState } from 'react';

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
  const [imgState, setImgState] = useState<ImgState>(defaultImgState);
  const loadImgRef = useRef(debounce((url: string, imgState: ImgState) => loadImage(url, imgState), 350));

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
    if (url !== imgState.srcFirst && url !== imgState.srcSecond) loadImgRef.current(url, imgState);
  }, [url, imgState]);

  return (
    <React.Fragment>
      <div
        style={{
          background: `url('${imgState.srcFirst}')`,
          opacity: imgState.current === 'first' ? 0.3 : 0,
          transition: `opacity ${transitionTime}s ease-in-out`,
        }}
        className={styles.BlurBackground}
      />
      <div
        style={{
          background: `url('${imgState.srcSecond}')`,
          opacity: imgState.current === 'second' ? 0.3 : 0,
          transition: `opacity ${transitionTime}s ease-in-out`,
        }}
        className={styles.BlurBackground}
      />
    </React.Fragment>
  );
};

export default memo(DynamicBlur);
