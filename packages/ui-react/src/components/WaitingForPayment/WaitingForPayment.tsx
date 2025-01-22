import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import useCheckAccess from '@jwp/ott-hooks-react/src/useCheckAccess';
import { modalURLFromLocation } from '@jwp/ott-ui-react/src/utils/location';

import Spinner from '../Spinner/Spinner';
import { useAriaAnnouncer } from '../../containers/AnnouncementProvider/AnnoucementProvider';
import useQueryParam from '../../hooks/useQueryParam';

import styles from './WaitingForPayment.module.scss';

const WaitingForPayment = () => {
  const { t } = useTranslation('account');
  const offerId = useQueryParam('offerId') || undefined;
  const location = useLocation();
  const navigate = useNavigate();
  const announce = useAriaAnnouncer();
  const { intervalCheckAccess, errorMessage } = useCheckAccess();

  useEffect(() => {
    intervalCheckAccess({
      interval: 3000,
      iterations: 5,
      offerId,
      callback: ({ hasAccess, offerId }) => {
        if (!hasAccess) return;

        announce(t('checkout.payment_success'), 'success');

        // close the modal for PPV/TVOD offers
        if (offerId.startsWith('C') || offerId.startsWith('P')) {
          // @TODO should we show a dedicated modal for TVOD access?
          navigate(modalURLFromLocation(location, null));
        } else {
          navigate(modalURLFromLocation(location, 'welcome'));
        }
      },
    });
    //eslint-disable-next-line
  }, []);
  return (
    <div className={styles.center}>
      {errorMessage ? (
        <h2>{errorMessage}</h2>
      ) : (
        <>
          <Spinner />
          <h2>{t('checkout.waiting_for_payment')}</h2>
        </>
      )}
    </div>
  );
};

export default WaitingForPayment;
