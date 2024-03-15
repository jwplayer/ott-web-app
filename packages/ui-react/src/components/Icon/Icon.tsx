import classNames from 'classnames';
import React, { type FC, type SVGProps } from 'react';

import styles from './Icon.module.scss';

export type Props = {
  icon: FC<SVGProps<SVGSVGElement>>;
  className?: string;
};

const Icon: FC<Props> = ({ icon: IconComponent, className }) => {
  return <IconComponent className={classNames(styles.icon, className)} aria-hidden="true" />;
};

export default Icon;
