import Spinner from '../../components/Spinner/Spinner';

import styles from './Loading.module.scss';

const Loading = () => {
  return (
    <div className={styles.loading}>
      <Spinner />
    </div>
  );
};

export default Loading;
