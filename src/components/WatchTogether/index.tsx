import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { v4 as uuidv4 } from 'uuid';

import styles from './WatchTogether.module.scss';

import useBreakpoint, { Breakpoint } from '#src/hooks/useBreakpoint';
import Button from '#components/Button/Button';
import { addQueryParam } from '#src/utils/location';
import type { PlaylistItem } from '#types/playlist';
import { useAccountStore } from '#src/stores/AccountStore';
import Dialog from '#components/Dialog/Dialog';
import Dropdown from '#components/Dropdown/Dropdown';

const users = [
    { value: 'alice.smith@example.com', label: 'Alice Smith' },
    { value: 'bob.johnson@example.com', label: 'Bob Johnson' },
    { value: 'charlie.brown@example.com', label: 'Charlie Brown' },
    { value: 'diana.lee@example.com', label: 'Diana Lee' },
    { value: 'ethan.parker@example.com', label: 'Ethan Parker' },
    { value: 'fiona.davis@example.com', label: 'Fiona Davis' },
    { value: 'george.chen@example.com', label: 'George Chen' },
    { value: 'haley.kim@example.com', label: 'Haley Kim' },
    { value: 'ian.lee@example.com', label: 'Ian Lee' },
    { value: 'julia.wang@example.com', label: 'Julia Wang' },
    { value: 'kevin.patel@example.com', label: 'Kevin Patel' },
    { value: 'lily.chen@example.com', label: 'Lily Chen' },
    { value: 'michael.johnson@example.com', label: 'Michael Johnson' },
    { value: 'nina.singh@example.com', label: 'Nina Singh' },
    { value: 'oliver.davis@example.com', label: 'Oliver Davis' }
];

type Props = {
  item: PlaylistItem;
  playUrl: string;
  disabled?: boolean;
};

const WatchTogether: React.VFC<Props> = ({ item, playUrl, disabled = false }) => {
  const { t } = useTranslation('video');
  const navigate = useNavigate();
  const location = useLocation();
  const breakpoint = useBreakpoint();

  // account
  const auth = useAccountStore((state) => state.auth);
  const isLoggedIn = !!auth;

  const [formIsOpen, setFormOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [roomId, setRoomId] = useState<string>("");
  const [alertOpen, setAlertOpen] = useState<boolean>(false)
  const closeForm = () => {
    setFormOpen(false);
  }
  const closeAlert = () => {
    setAlertOpen(false)
  }


  const handleButtonClick = useCallback(() => {
    if (!isLoggedIn) return navigate(addQueryParam(location, 'u', 'create-account'));
    setFormOpen(true);
  }, [ navigate, isLoggedIn, location ]);

  const handleSelectUser = (e) => {
    setSelectedUser(e.target.value);
  }

  const inviteAndCreateChat = () => {
    closeForm();
    if(selectedUser) {
        setRoomId(uuidv4());
        localStorage.setItem(`invitedUser-${selectedUser}`, roomId);
        setAlertOpen(true);
    }
  }

  return (
    <div>
        <Button
        //   color="default"
        className={styles.watchTogetherButton}
        variant="contained"
        size="large"
        label={t("Watch together")}
        onClick={handleButtonClick}
        fullWidth={breakpoint < Breakpoint.md}
        disabled={disabled}
        >
        </Button>

        <Dialog open={formIsOpen} onClose={closeForm}>
            <h2 className={styles.formTitle}>{t('Invite friends and watch together')}</h2>
            <Dropdown
                className={styles.dropDown}
                size='small'
                options={users}
                defaultLabel={"Select friends"}
                name={selectedUser ?? ""}
                value={selectedUser ?? ""}
                onChange={handleSelectUser}
                fullWidth
                aria-multiselectable
            />
            <Button label={t('Invite and Create Chat')} variant="outlined" onClick={inviteAndCreateChat} fullWidth />
        </Dialog>

        <Dialog open={alertOpen} onClose={closeAlert}>
            <h2 className={styles.alertTitle}>Success! 🎊 </h2>
            <p>{`Your friend ${selectedUser} was invited!
                 Tune in and meet them in the Chat`} 🤠 </p>
        </Dialog>
    </div>
  );
};

export default WatchTogether;
