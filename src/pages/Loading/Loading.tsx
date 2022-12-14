import styles from './Loading.module.scss';

import Spinner from '#components/Spinner/Spinner';

const Loading = () => {
  return (
    <div className={styles.loading}>
      <Spinner />
    </div>
  );
};

export default Loading;
