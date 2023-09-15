import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';

import styles from './Profiles.module.scss';

import Button from '#src/components/Button/Button';
import Dialog from '#src/components/Dialog/Dialog';
import { removeQueryParam } from '#src/utils/location';
import useQueryParam from '#src/hooks/useQueryParam';
import LoadingOverlay from '#src/components/LoadingOverlay/LoadingOverlay';
import { useDeleteProfile } from '#src/hooks/useProfiles';

const DeleteProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const { t } = useTranslation('user');

  const viewParam = useQueryParam('action');
  const [view, setView] = useState(viewParam);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const closeHandler = () => {
    navigate(removeQueryParam(location, 'action'));
  };

  const deleteProfile = useDeleteProfile({
    onMutate: () => {
      closeHandler();
    },
    onError: () => {
      setIsDeleting(false);
    },
  });

  const deleteHandler = async () => id && deleteProfile.mutate({ id });

  useEffect(() => {
    // make sure the last view is rendered even when the modal gets closed
    if (viewParam) setView(viewParam);
  }, [viewParam]);

  if (!id) {
    return <Navigate to="/u/profiles" />;
  }

  if (view !== 'delete-profile') return null;
  return (
    <div>
      <Dialog open={!!viewParam} onClose={closeHandler}>
        {isDeleting && <LoadingOverlay inline />}
        <div className={styles.deleteModal}>
          <div>
            <h2>{t('profile.delete')}</h2>
            <p>{t('profile.delete_confirmation')}</p>
          </div>
          <div className={styles.deleteButtons}>
            <Button label={t('account.delete')} color="delete" variant="contained" onClick={deleteHandler} />
            <Button label={t('account.cancel')} variant="outlined" onClick={closeHandler} />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default DeleteProfile;
