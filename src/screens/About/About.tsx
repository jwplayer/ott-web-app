import React from 'react';

import MarkdownComponent from '../../components/MarkdownComponent/MarkdownComponent';

import styles from './About.module.scss';

const About = () => {
  const markdownPage = `# Lorem Ipsum

## Dolr Sit Amet

- consectetur
- adipiscing
- elit
`;

  return (
    <div className={styles.about}>
      <MarkdownComponent markdownString={markdownPage} />
    </div>
  );
};

export default About;
