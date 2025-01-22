import React, { type FC, type SVGProps } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import type { FormErrors } from '@jwp/ott-common/types/form';
import type { Offer, ChooseOfferFormData } from '@jwp/ott-common/types/checkout';
import { useConfigStore } from '@jwp/ott-common/src/stores/ConfigStore';
import { getOfferPrice, isSVODOffer } from '@jwp/ott-common/src/utils/offers';
import { testId } from '@jwp/ott-common/src/utils/common';
import CheckCircle from '@jwp/ott-theme/assets/icons/check_circle.svg?react';

import Button from '../Button/Button';
import FormFeedback from '../FormFeedback/FormFeedback';
import DialogBackButton from '../DialogBackButton/DialogBackButton';
import LoadingOverlay from '../LoadingOverlay/LoadingOverlay';
import Icon from '../Icon/Icon';

import styles from './ChooseOfferForm.module.scss';

type OfferBoxProps = {
  offer: Offer;
  selected: boolean;
} & Pick<Props, 'onChange'>;

const OfferBox: React.FC<OfferBoxProps> = ({ offer, selected, onChange }: OfferBoxProps) => {
  const { t } = useTranslation('account');

  const getFreeTrialText = (offer: Offer) => {
    if (offer.freeDays) {
      return t('choose_offer.benefits.first_days_free', { count: offer.freeDays });
    } else if (offer.freePeriods) {
      // t('periods.day', { count })
      // t('periods.week', { count })
      // t('periods.month', { count })
      // t('periods.year', { count })
      const period = t(`periods.${offer.period}`, { count: offer.freePeriods });

      return t('choose_offer.benefits.first_periods_free', { count: offer.freePeriods, period });
    }

    return null;
  };

  const renderListItem = (text: string, icon: FC<SVGProps<SVGSVGElement>>) => (
    <li>
      <Icon icon={icon} />
      {text}
      <span className="hidden">.</span>
    </li>
  );

  const renderOption = ({ title, periodString, secondBenefit }: { title: string; periodString?: string; secondBenefit?: string }) => (
    <div className={styles.offer} aria-labelledby={`title-${offer.offerId}`}>
      <input
        className={styles.radio}
        onChange={onChange}
        type="radio"
        name={'selectedOfferId'}
        value={offer.offerId}
        id={offer.offerId}
        checked={selected}
        data-testid={testId(offer.offerId)}
      />
      <div className={styles.label}>
        <label htmlFor={offer.offerId}>
          <h2 className={styles.offerTitle} id={`title-${offer.offerId}`}>
            {title}
          </h2>
          <span className="hidden">.</span>
          <hr className={styles.offerDivider} aria-hidden={true} />
          <ul className={styles.offerBenefits}>
            {offer.freeDays || offer.freePeriods ? renderListItem(getFreeTrialText(offer) || '', CheckCircle) : null}
            {!!secondBenefit && renderListItem(secondBenefit, CheckCircle)}
            {renderListItem(t('choose_offer.benefits.watch_on_all_devices'), CheckCircle)}
          </ul>
          <div className={styles.fill} />
          <div className={styles.offerPrice}>
            {getOfferPrice(offer)} {!!periodString && <small>/{periodString}</small>}
          </div>
        </label>
      </div>
    </div>
  );

  if (isSVODOffer(offer)) {
    const isMonthly = offer.period === 'month';

    return renderOption({
      title: isMonthly ? t('choose_offer.monthly') : t('choose_offer.yearly'),
      secondBenefit: t('choose_offer.benefits.cancel_anytime'),
      periodString: isMonthly ? t('periods.month') : t('periods.year'),
    });
  }

  return renderOption({
    title: offer.offerTitle,
    secondBenefit:
      !!offer.durationPeriod && !!offer.durationAmount
        ? t('choose_offer.tvod_access', { period: offer.durationPeriod, count: offer.durationAmount })
        : undefined,
  });
};

type Props = {
  values: ChooseOfferFormData;
  errors: FormErrors<ChooseOfferFormData>;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  onBackButtonClickHandler?: () => void;
  offers: Offer[];
  showOfferTypeSwitch: boolean;
  submitting: boolean;
};

const ChooseOfferForm: React.FC<Props> = ({ values, errors, submitting, offers, showOfferTypeSwitch, onChange, onSubmit, onBackButtonClickHandler }: Props) => {
  const siteName = useConfigStore((s) => s.config.siteName);
  const { t } = useTranslation('account');
  const { selectedOfferType, selectedOfferId } = values;

  return (
    <form onSubmit={onSubmit} data-testid={testId('choose-offer-form')} noValidate>
      {onBackButtonClickHandler ? <DialogBackButton onClick={onBackButtonClickHandler} /> : null}
      <h1 className={styles.title}>{t('choose_offer.title')}</h1>
      <p className={styles.subtitle}>{t('choose_offer.watch_this_on_platform', { siteName })}</p>
      {errors.form ? <FormFeedback variant="error">{errors.form}</FormFeedback> : null}
      {showOfferTypeSwitch && (
        <div className={styles.offerGroupSwitch}>
          <input
            className={styles.radio}
            onChange={onChange}
            type="radio"
            name="selectedOfferType"
            id="svod"
            value="svod"
            checked={selectedOfferType === 'svod'}
          />
          <label className={classNames(styles.label, styles.offerGroupLabel)} htmlFor="svod">
            {t('choose_offer.subscription')}
          </label>
          <input
            className={styles.radio}
            onChange={onChange}
            type="radio"
            name="selectedOfferType"
            id="tvod"
            value="tvod"
            checked={selectedOfferType === 'tvod'}
          />
          <label className={classNames(styles.label, styles.offerGroupLabel)} htmlFor="tvod">
            {t('choose_offer.one_time_only')}
          </label>
        </div>
      )}
      <div className={styles.offers}>
        {!offers.length ? (
          <p>{t('choose_offer.no_pricing_available')}</p>
        ) : (
          offers.map((offer) => <OfferBox key={offer.offerId} offer={offer} selected={selectedOfferId === offer.offerId} onChange={onChange} />)
        )}
      </div>
      {submitting && <LoadingOverlay transparentBackground inline />}
      <Button label={t('choose_offer.continue')} disabled={submitting || !offers.length} variant="contained" color="primary" type="submit" fullWidth />
    </form>
  );
};
export default ChooseOfferForm;
