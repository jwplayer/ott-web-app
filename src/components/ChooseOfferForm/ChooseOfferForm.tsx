import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import type { ChooseOfferFormData } from 'types/account';

import Button from '../Button/Button';
import CheckCircle from '../../icons/CheckCircle';
import { ConfigContext } from '../../providers/ConfigProvider';
import type { FormErrors } from '../../hooks/useForm';
import type { Offer } from '../../../types/checkout';
import FormFeedback from '../FormFeedback/FormFeedback';
import { getOfferPrice } from '../../utils/subscription';
import DialogBackButton from '../DialogBackButton/DialogBackButton';

import styles from './ChooseOfferForm.module.scss';

type Props = {
  values: ChooseOfferFormData;
  errors: FormErrors<ChooseOfferFormData>;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  onBackButtonClickHandler?: () => void;
  monthlyOffer?: Offer;
  yearlyOffer?: Offer;
  submitting: boolean;
};

const ChooseOfferForm: React.FC<Props> = ({
  values,
  errors,
  onChange,
  onSubmit,
  submitting,
  yearlyOffer,
  monthlyOffer,
  onBackButtonClickHandler,
}: Props) => {
  const { siteName } = useContext(ConfigContext);
  const { t } = useTranslation('account');

  const getFreeTrialText = (offer: Offer) => {
    if (offer.freeDays > 0) {
      return t('choose_offer.benefits.first_days_free', { count: offer.freeDays });
    } else if (offer.freePeriods) {
      // t('periods.day')
      // t('periods.week')
      // t('periods.month')
      // t('periods.year')
      const period = t(`periods.${offer.period}`, { count: offer.freePeriods });

      return t('choose_offer.benefits.first_periods_free', { count: offer.freePeriods, period });
    }

    return null;
  };

  return (
    <form onSubmit={onSubmit} data-testid="choose-offer-form" noValidate>
      {onBackButtonClickHandler  ? <DialogBackButton onClick={onBackButtonClickHandler} /> : null}
      <h2 className={styles.title}>{t('choose_offer.subscription')}</h2>
      <h3 className={styles.subtitle}>{t('choose_offer.all_movies_and_series_of_platform', { siteName })}</h3>
      {errors.form ? <FormFeedback variant="error">{errors.form}</FormFeedback> : null}
      <div className={styles.offers}>
        {monthlyOffer ? (
          <div className={styles.offer}>
            <input
              className={styles.radio}
              onChange={onChange}
              type="radio"
              name="periodicity"
              value="monthly"
              id="monthly"
              checked={values.periodicity === 'monthly'}
              aria-label={t('choose_offer.monthly_subscription')}
            />
            <label className={styles.label} htmlFor="monthly">
              <h4 className={styles.offerTitle}>{t('choose_offer.monthly')}</h4>
              <hr className={styles.offerDivider} />
              <ul className={styles.offerBenefits}>
                {monthlyOffer.freeDays > 0 || monthlyOffer.freePeriods > 0 ? (
                  <li>
                    <CheckCircle /> {getFreeTrialText(monthlyOffer)}
                  </li>
                ) : null}
                <li>
                  <CheckCircle /> {t('choose_offer.benefits.cancel_anytime')}
                </li>
                <li>
                  <CheckCircle /> {t('choose_offer.benefits.watch_on_all_devices')}
                </li>
              </ul>
              <div className={styles.offerPrice}>
                {getOfferPrice(monthlyOffer)} <small>/{t('periods.month')}</small>
              </div>
            </label>
          </div>
        ) : null}
        {yearlyOffer ? (
          <div className={styles.offer}>
            <input
              className={styles.radio}
              onChange={onChange}
              type="radio"
              name="periodicity"
              value="yearly"
              id="yearly"
              checked={values.periodicity === 'yearly'}
              aria-label={t('choose_offer.yearly_subscription')}
            />
            <label className={styles.label} htmlFor="yearly">
              <h4 className={styles.offerTitle}>{t('choose_offer.yearly')}</h4>
              <hr className={styles.offerDivider} />
              <ul className={styles.offerBenefits}>
                {yearlyOffer.freeDays > 0 || yearlyOffer.freePeriods > 0 ? (
                  <li>
                    <CheckCircle /> {getFreeTrialText(yearlyOffer)}
                  </li>
                ) : null}
                <li>
                  <CheckCircle /> {t('choose_offer.benefits.cancel_anytime')}
                </li>
                <li>
                  <CheckCircle /> {t('choose_offer.benefits.watch_on_all_devices')}
                </li>
              </ul>
              <div className={styles.offerPrice}>
                {getOfferPrice(yearlyOffer)} <small>/{t('periods.year')}</small>
              </div>
            </label>
          </div>
        ) : null}
      </div>
      <Button label={t('choose_offer.continue')} disabled={submitting} variant="contained" color="primary" type="submit" fullWidth />
    </form>
  );
};
export default ChooseOfferForm;
