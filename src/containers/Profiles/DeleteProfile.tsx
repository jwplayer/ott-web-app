import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';

import styles from './Profiles.module.scss';

import Button from '#src/components/Button/Button';
import Dialog from '#src/components/Dialog/Dialog';
import { removeQueryParam } from '#src/utils/location';
import useQueryParam from '#src/hooks/useQueryParam';
import LoadingOverlay from '#src/components/LoadingOverlay/LoadingOverlay';
import { deleteProfile } from '#src/stores/AccountController';
import { useListProfiles } from '#src/hooks/useProfiles';

const DeleteProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const viewParam = useQueryParam('action');
  const [view, setView] = useState(viewParam);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const listProfiles = useListProfiles();

  const closeHandler = () => {
    navigate(removeQueryParam(location, 'action'));
  };

  const deleteHandler = async () => {
    try {
      setIsDeleting(true);
      if (!id) {
        return;
      }
      const response = await deleteProfile({ id });
      if (response?.errors.length === 0) {
        closeHandler();
        listProfiles.refetch();
        setIsDeleting(false);
        navigate('/u/profiles');
      }
      closeHandler();
    } catch {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    // make sure the last view is rendered even when the modal gets closed
    if (viewParam) setView(viewParam);
  }, [viewParam]);

  if (view !== 'delete-profile') return null;
  return (
    <div>
      <Dialog open={!!viewParam} onClose={closeHandler}>
        {isDeleting && <LoadingOverlay inline />}
        <div className={styles.deleteModal}>
          <div>
            <h2>Delete profile</h2>
            <p>Are you sure you want to delete your profile? You will lose all you watch history and settings connected to this profile.</p>
          </div>
          <div className={styles.deleteButtons}>
            <Button label="Delete" color="delete" variant="contained" onClick={deleteHandler} />
            <Button className={styles.cancelButton} label="Cancel" variant="outlined" onClick={closeHandler} />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default DeleteProfile;
