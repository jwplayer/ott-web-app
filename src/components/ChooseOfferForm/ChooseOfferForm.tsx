import React, { useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

import styles from './ChooseOfferForm.module.scss';

import Button from '#src/components/Button/Button';
import FormFeedback from '#src/components/FormFeedback/FormFeedback';
import DialogBackButton from '#src/components/DialogBackButton/DialogBackButton';
import LoadingOverlay from '#src/components/LoadingOverlay/LoadingOverlay';
import CheckCircle from '#src/icons/CheckCircle';
import { ConfigContext } from '#src/providers/ConfigProvider';
import type { Offer } from '#types/checkout';
import { getOfferPrice } from '#src/utils/subscription';
import type { FormErrors } from '#types/form';
import { IS_DEV_BUILD } from '#src/utils/common';
import type { ChooseOfferFormData } from '#types/account';

type Props = {
  values: ChooseOfferFormData;
  errors: FormErrors<ChooseOfferFormData>;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  onBackButtonClickHandler?: () => void;
  monthlyOffer?: Offer;
  yearlyOffer?: Offer;
  tvodOffers: Offer[];
  submitting: boolean;
};

type OfferBoxProps = {
  offer: Offer;
  radioKey: 'periodicity' | 'tvodOfferId';
  radioValue: string;
  title: string;
  ariaLabel: string;
  secondBenefit?: string;
  periodString?: string;
};
type OfferBox = ({ offer, radioKey, radioValue, title, ariaLabel, secondBenefit, periodString }: OfferBoxProps) => JSX.Element;

const ChooseOfferForm: React.FC<Props> = ({
  values,
  errors,
  onChange,
  onSubmit,
  submitting,
  yearlyOffer,
  monthlyOffer,
  tvodOffers,
  onBackButtonClickHandler,
}: Props) => {
  const { siteName } = useContext(ConfigContext);
  const { t } = useTranslation('account');

  const getFreeTrialText = useCallback(
    (offer: Offer) => {
      if (offer.freeDays && offer.freeDays > 0) {
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
    },
    [t],
  );

  const OfferBox: OfferBox = ({ offer, radioKey, radioValue, title, ariaLabel, secondBenefit, periodString }) => (
    <div className={styles.offer}>
      <input
        className={styles.radio}
        onChange={onChange}
        type="radio"
        name={radioKey}
        value={radioValue}
        id={radioValue}
        checked={values[radioKey] === radioValue}
        aria-label={ariaLabel}
      />
      <label className={styles.label} htmlFor={radioValue}>
        <h4 className={styles.offerTitle}>{title}</h4>
        <hr className={styles.offerDivider} />
        <ul className={styles.offerBenefits}>
          {(offer.freeDays && offer.freeDays > 0) || (offer.freePeriods && offer.freePeriods > 0) ? (
            <li>
              <CheckCircle /> {getFreeTrialText(offer)}
            </li>
          ) : null}

          {!!secondBenefit && (
            <li>
              <CheckCircle /> {secondBenefit}
            </li>
          )}
          <li>
            <CheckCircle /> {t('choose_offer.benefits.watch_on_all_devices')}
          </li>
        </ul>
        <div className={styles.fill} />
        <div className={styles.offerPrice}>
          {getOfferPrice(offer)} {!!periodString && <small>/{periodString}</small>}
        </div>
      </label>
    </div>
  );

  return (
    <form onSubmit={onSubmit} data-testid={IS_DEV_BUILD ? 'choose-offer-form' : undefined} noValidate>
      {onBackButtonClickHandler ? <DialogBackButton onClick={onBackButtonClickHandler} /> : null}
      <h2 className={styles.title}>{t('choose_offer.subscription')}</h2>
      <h3 className={styles.subtitle}>{t('choose_offer.all_movies_and_series_of_platform', { siteName })}</h3>
      {errors.form ? <FormFeedback variant="error">{errors.form}</FormFeedback> : null}
      {!!tvodOffers.length && (
        <div className={styles.offerGroupSwitch}>
          <input className={styles.radio} onChange={onChange} type="radio" name="offerType" id="svod" value="svod" checked={values.offerType === 'svod'} />
          <label className={classNames(styles.label, styles.offerGroupLabel)} htmlFor="svod">
            {t('choose_offer.subscription')}
          </label>
          <input className={styles.radio} onChange={onChange} type="radio" name="offerType" id="tvod" value="tvod" checked={values.offerType === 'tvod'} />
          <label className={classNames(styles.label, styles.offerGroupLabel)} htmlFor="tvod">
            {t('choose_offer.one_time_only')}
          </label>
        </div>
      )}
      {values.offerType === 'svod' ? (
        <div className={styles.offers}>
          {!!monthlyOffer && (
            <OfferBox
              offer={monthlyOffer}
              radioKey="periodicity"
              radioValue="monthly"
              title={t('choose_offer.monthly')}
              ariaLabel={t('choose_offer.monthly_subscription')}
              secondBenefit={t('choose_offer.benefits.cancel_anytime')}
              periodString={t('periods.month')}
            />
          )}
          {!!yearlyOffer && (
            <OfferBox
              offer={yearlyOffer}
              radioKey="periodicity"
              radioValue="yearly"
              title={t('choose_offer.yearly')}
              ariaLabel={t('choose_offer.yearly_subscription')}
              secondBenefit={t('choose_offer.benefits.cancel_anytime')}
              periodString={t('periods.year')}
            />
          )}
        </div>
      ) : (
        <div className={styles.offers}>
          {tvodOffers?.map((offer) => (
            <OfferBox
              offer={offer}
              radioKey="tvodOfferId"
              radioValue={offer.offerId}
              key={offer.offerId}
              title={offer.offerTitle}
              ariaLabel={offer.offerTitle}
              secondBenefit={
                !!offer.durationPeriod && !!offer.durationAmount
                  ? t('choose_offer.tvod_access', { period: offer.durationPeriod, count: offer.durationAmount })
                  : undefined
              }
            />
          ))}
        </div>
      )}

      {submitting && <LoadingOverlay transparentBackground inline />}
      <Button label={t('choose_offer.continue')} disabled={submitting} variant="contained" color="primary" type="submit" fullWidth />
    </form>
  );
};
export default ChooseOfferForm;
