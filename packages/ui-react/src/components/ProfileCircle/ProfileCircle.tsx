import styles from './ProfileCircle.module.scss';

type ProfileCircleProps = {
  src: string;
  alt: string;
};

const ProfileCircle = ({ src, alt }: ProfileCircleProps) => <img className={styles.profileIcon} src={src} alt={alt} />;

export default ProfileCircle;
