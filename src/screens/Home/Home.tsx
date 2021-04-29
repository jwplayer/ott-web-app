import React from 'react';

import Layout from '../../components/Layout/Layout';

type HomeProps = {
  dummy?: string;
};

const Home: React.FC<HomeProps> = ({ dummy = 'defaultValue' }) => {
  return (
    <Layout>
      <p>{dummy}</p>
    </Layout>
  );
};

export default Home;
