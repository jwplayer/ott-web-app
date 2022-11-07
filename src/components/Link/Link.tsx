import React, { MouseEventHandler } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import classNames from 'classnames';

import styles from './Link.module.scss';

type Props = {
  className?: string;
  href?: string;
  to?: string;
  target?: string;
  children?: React.ReactNode;
  onClick?: MouseEventHandler<HTMLElement>;
};

const Link: React.FC<Props> = ({ to, href, children, className, onClick, ...rest }: Props) => {
  const linkClassName = classNames(styles.link, className);

  if (to) {
    return (
      <RouterLink to={to} className={linkClassName} onClick={onClick}>
        {children}
      </RouterLink>
    );
  }

  return (
    <a href={href} className={linkClassName} onClick={onClick} {...rest}>
      {children}
    </a>
  );
};

export default Link;
