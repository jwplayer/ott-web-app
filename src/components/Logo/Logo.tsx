import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import styles from './Logo.module.scss';

type Props = {
  src: string;
  onLoad: () => void;
};

type ImgRef = {
  height?: number;
  width?: number;
};

const Logo: React.FC<Props> = ({ src, onLoad }: Props) => {
  const [imgDimensions, updateImgDimensions] = useState<ImgRef>({ height: undefined, width: undefined });

  const onLoadHandler = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const { height, width } = event.currentTarget;
    updateImgDimensions({ height, width });
    onLoad();
  };

  return (
    <Link to="/">
      <img className={styles.logo} alt="logo" src={src} height={imgDimensions.height} width={imgDimensions.width} onLoad={onLoadHandler} onError={onLoad} />
    </Link>
  );
};

export default Logo;
