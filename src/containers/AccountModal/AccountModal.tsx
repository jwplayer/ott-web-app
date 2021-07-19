import React, { useContext } from 'react';

import Modal from '../../components/Modal/Modal';
import { AccountStore } from '../../stores/AccountStore';
import Button from '../../components/Button/Button';
import { ConfigContext } from '../../providers/ConfigProvider';

import styles from './AccountModal.module.scss';

const AccountModal = () => {
  const {
    assets: { banner },
  } = useContext(ConfigContext);
  const { open } = AccountStore.useState((s) => s.modal);
  const closeHandler = () =>
    AccountStore.update((s) => {
      s.modal.open = false;
    });

  return (
    <Modal open={open} onClose={closeHandler} className={styles.accountModal} closeButtonVisible>
      <div className={styles.banner}>{banner ? <img src={banner} onLoad={() => undefined} alt="" /> : null}</div>
      <h2 className={styles.title}>Login!</h2>
      <form>form</form>
      <Button label="Sign in" variant="contained" color="primary" fullWidth />
    </Modal>
  );
};

export default AccountModal;
