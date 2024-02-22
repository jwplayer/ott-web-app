import React from 'react';
import classNames from 'classnames';
import { IS_DEVELOPMENT_BUILD } from '@jwp/ott-common/src/utils/common';

import MarkdownComponent from '../MarkdownComponent/MarkdownComponent';

import styles from './Footer.module.scss';

type Props = {
  text: string;
};

const Footer: React.FC<Props> = ({ text }) => {
  const chunks = text.split('|').map((chuck) => chuck.trim());
  const footerContent = chunks.map((value, index) => <MarkdownComponent key={index} markdownString={value} inline tag={chunks.length > 1 ? 'li' : 'div'} />);
  const wrapper = chunks.length > 1 ? <ul className={styles.list}>{footerContent}</ul> : footerContent;

  return (
    // The extra style below is just to fix the footer on mobile when the dev selector is shown
    <footer className={classNames(styles.footer, { [styles.testFixMargin]: IS_DEVELOPMENT_BUILD })}>{wrapper}</footer>
  );
};

export default Footer;
