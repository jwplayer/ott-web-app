import React from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

import styles from './ChooseOfferForm.module.scss';

import Button from '#components/Button/Button';
import FormFeedback from '#components/FormFeedback/FormFeedback';
import DialogBackButton from '#components/DialogBackButton/DialogBackButton';
import LoadingOverlay from '#components/LoadingOverlay/LoadingOverlay';
import CheckCircle from '#src/icons/CheckCircle';
import type { Offer } from '#types/checkout';
import { getOfferPrice, isSVODOffer } from '#src/utils/subscription';
import type { FormErrors } from '#types/form';
import { testId } from '#src/utils/common';
import type { ChooseOfferFormData, OfferType } from '#types/account';
import { useConfigStore } from '#src/stores/ConfigStore';

type Props = {
  values: ChooseOfferFormData;
  errors: FormErrors<ChooseOfferFormData>;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  onBackButtonClickHandler?: () => void;
  offers: Offer[];
  submitting: boolean;
  offerType: OfferType;
  setOfferType?: (offerType: OfferType) => void;
};

type OfferBoxProps = {
  offer: Offer;
  title: string;
  ariaLabel: string;
  secondBenefit?: string;
  periodString?: string;
};

type OfferBox = ({ offer, title, ariaLabel, secondBenefit, periodString }: OfferBoxProps) => JSX.Element;

const ChooseOfferForm: React.FC<Props> = ({
  values,
  errors,
  onChange,
  onSubmit,
  submitting,
  offers,
  onBackButtonClickHandler,
  offerType,
  setOfferType,
}: Props) => {
  const siteName = useConfigStore((s) => s.config.siteName);
  const { t } = useTranslation('account');

  const getFreeTrialText = (offer: Offer) => {
    if (offer.freeDays) {
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

  const OfferBox: OfferBox = ({ offer, title, ariaLabel, secondBenefit, periodString }) => (
    <div className={styles.offer}>
      <input
        className={styles.radio}
        onChange={onChange}
        type="radio"
        name={'offerId'}
        value={offer.offerId}
        id={offer.offerId}
        checked={values.offerId === offer.offerId}
        aria-label={ariaLabel}
      />
      <label className={styles.label} htmlFor={offer.offerId}>
        <h4 className={styles.offerTitle}>{title}</h4>
        <hr className={styles.offerDivider} />
        <ul className={styles.offerBenefits}>
          {offer.freeDays || offer.freePeriods ? (
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

  const renderOfferBox = (offer: Offer) => {
    if (isSVODOffer(offer)) {
      const isMonthly = offer.period === 'month';

      return (
        <OfferBox
          offer={offer}
          key={offer.offerId}
          title={isMonthly ? t('choose_offer.monthly') : t('choose_offer.yearly')}
          ariaLabel={isMonthly ? t('choose_offer.monthly_subscription') : t('choose_offer.yearly_subscription')}
          secondBenefit={t('choose_offer.benefits.cancel_anytime')}
          periodString={isMonthly ? t('periods.month') : t('periods.year')}
        />
      );
    }

    return (
      <OfferBox
        offer={offer}
        key={offer.offerId}
        title={offer.offerTitle}
        ariaLabel={offer.offerTitle}
        secondBenefit={
          !!offer.durationPeriod && !!offer.durationAmount
            ? t('choose_offer.tvod_access', { period: offer.durationPeriod, count: offer.durationAmount })
            : undefined
        }
      />
    );
  };

  return (
    <form onSubmit={onSubmit} data-testid={testId('choose-offer-form')} noValidate>
      {onBackButtonClickHandler ? <DialogBackButton onClick={onBackButtonClickHandler} /> : null}
      <h2 className={styles.title}>{t('choose_offer.title')}</h2>
      <h3 className={styles.subtitle}>{t('choose_offer.watch_this_on_platform', { siteName })}</h3>
      {errors.form ? <FormFeedback variant="error">{errors.form}</FormFeedback> : null}
      {setOfferType && (
        <div className={styles.offerGroupSwitch}>
          <input
            className={styles.radio}
            onChange={() => setOfferType('svod')}
            type="radio"
            name="offerType"
            id="svod"
            value="svod"
            checked={offerType === 'svod'}
          />
          <label className={classNames(styles.label, styles.offerGroupLabel)} htmlFor="svod">
            {t('choose_offer.subscription')}
          </label>
          <input
            className={styles.radio}
            onChange={() => setOfferType('tvod')}
            type="radio"
            name="offerType"
            id="tvod"
            value="tvod"
            checked={offerType === 'tvod'}
          />
          <label className={classNames(styles.label, styles.offerGroupLabel)} htmlFor="tvod">
            {t('choose_offer.one_time_only')}
          </label>
        </div>
      )}
      <div className={styles.offers}>{offers.map(renderOfferBox)}</div>
      {submitting && <LoadingOverlay transparentBackground inline />}
      <Button label={t('choose_offer.continue')} disabled={submitting} variant="contained" color="primary" type="submit" fullWidth />
    </form>
  );
};
export default ChooseOfferForm;
