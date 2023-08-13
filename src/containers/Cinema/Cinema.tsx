import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router';

import styles from './Cinema.module.scss';

import type { PlaylistItem } from '#types/playlist';
import Fade from '#components/Animation/Fade/Fade';
import IconButton from '#components/IconButton/IconButton';
import ArrowLeft from '#src/icons/ArrowLeft';
import PlayerContainer from '#src/containers/PlayerContainer/PlayerContainer';
import Button from '#components/Button/Button';
import { getAssetsData } from '#src/stores/CheckoutController';
import ChevronLeft from '#src/icons/ChevronLeft';
import ChevronRight from '#src/icons/ChevronRight';
import { formatPrice } from '#src/utils/formatting';
import { useCheckoutStore } from '#src/stores/CheckoutStore';
import type { Offer } from '#types/checkout';
import { useConfigStore } from '#src/stores/ConfigStore';

type Props = {
  open: boolean;
  item: PlaylistItem;
  seriesItem?: PlaylistItem;
  onPlay?: () => void;
  onPause?: () => void;
  onComplete?: () => void;
  onClose?: () => void;
  onNext?: () => void;
  feedId?: string;
  title: string;
  primaryMetadata: React.ReactNode;
  secondaryMetadata?: React.ReactNode;
  liveStartDateTime?: string | null;
  liveEndDateTime?: string | null;
  liveFromBeginning?: boolean;
};

const Cinema: React.FC<Props> = ({
  open,
  item,
  seriesItem,
  title,
  primaryMetadata,
  secondaryMetadata,
  onPlay,
  onPause,
  onComplete,
  onClose,
  onNext,
  feedId,
  liveStartDateTime,
  liveEndDateTime,
  liveFromBeginning,
}: Props) => {
  const { t } = useTranslation();

  // state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [userActive, setUserActive] = useState(true);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    onPlay && onPlay();
  }, [onPlay]);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
    onPause && onPause();
  }, [onPause]);

  const handleComplete = useCallback(() => {
    onComplete && onComplete();
  }, [onComplete]);

  const handleNext = useCallback(() => {
    onNext && onNext();
  }, [onNext]);

  const handleUserActive = useCallback(() => setUserActive(true), []);
  const handleUserInactive = useCallback(() => setUserActive(false), []);

  const navigate = useNavigate();

  const { config } = useConfigStore();

  const shopItemIds = item.shopIds?.split(',');
  const hasShop = shopItemIds && shopItemIds.length > 0 && config?.custom?.useWebStore;

  const [shopIsOpen, setShopIsOpen] = useState(false);

  const handleProductPurchase = useCallback(
    async (offers: Offer[], pictureUrl: string, productTitle: string) => {
      if (!offers.length) return;
      useCheckoutStore.setState({ purchasingOffers: { offers, pictureUrl, productTitle } });
      navigate('?u=choose-offer', { replace: true });
    },
    [navigate],
  );

  const { data: shopItems } = useQuery(['shopItems', shopItemIds], () => getAssetsData(shopItemIds || []));

  // effects
  useEffect(() => {
    if (open) {
      setUserActive(true);
      document.body.style.overflowY = 'hidden';
    }

    return () => {
      document.body.style.overflowY = '';
    };
  }, [open]);

  return (
    <Fade open={open} className={styles.fade}>
      <div className={styles.cinema}>
        <PlayerContainer
          item={item}
          seriesItem={seriesItem}
          feedId={feedId}
          autostart={true}
          onPlay={handlePlay}
          onPause={handlePause}
          onComplete={handleComplete}
          onUserActive={handleUserActive}
          onUserInActive={handleUserInactive}
          onNext={handleNext}
          liveEndDateTime={liveEndDateTime}
          liveFromBeginning={liveFromBeginning}
          liveStartDateTime={liveStartDateTime}
        />

        <Fade open={!isPlaying || userActive || shopIsOpen}>
          <>
            {hasShop && (
              <>
                <Fade open={shopIsOpen}>
                  <div className={styles.shop}>
                    {
                      //{t('video:shop')}
                    }
                    <div className={styles.shopHeader}>Products</div>
                    {shopItems?.map((shopItem) => (
                      <div className={styles.shopItemContainer} key={shopItem.id}>
                        <img className={styles.shopItemImage} src={shopItem.metahash.paywall_cover_photo} />
                        <div className={styles.shopItemTextContainer}>
                          <h2>{shopItem.title}</h2>
                          <div className={styles.shopItemPrice}>
                            {formatPrice(shopItem.offers[0].customerPriceInclTax, shopItem.offers[0].customerCurrency, shopItem.offers[0].customerCountry)}
                          </div>
                          <Button
                            className={styles.shopItemButton}
                            type="button"
                            label={t('video:buy')}
                            fullWidth
                            onClick={() => handleProductPurchase(shopItem.offers, shopItem.metahash.paywall_cover_photo, shopItem.title)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Fade>
                <IconButton aria-label={t('video:shop')} onClick={() => setShopIsOpen((o) => !o)} className={styles.shopToggle}>
                  {shopIsOpen ? <ChevronRight /> : <ChevronLeft />}
                </IconButton>
              </>
            )}
            <div className={styles.playerOverlay}>
              <div className={styles.playerContent}>
                <IconButton aria-label={t('common:back')} onClick={onClose} className={styles.backButton}>
                  <ArrowLeft />
                </IconButton>
                <div>
                  <h2 className={styles.title}>{title}</h2>
                  <div className={styles.metaContainer}>
                    {secondaryMetadata && <div className={styles.secondaryMetadata}>{secondaryMetadata}</div>}
                    <div className={styles.primaryMetadata}>{primaryMetadata}</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        </Fade>
      </div>
    </Fade>
  );
};

export default Cinema;
