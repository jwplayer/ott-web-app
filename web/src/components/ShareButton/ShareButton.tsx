import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { copyToClipboard } from '@jwplayer/ott-common/src/utils/dom';

import Check from '../../icons/Check';
import Share from '../../icons/Share';
import useBreakpoint, { Breakpoint } from '../../hooks/useBreakpoint';
import Button from '../Button/Button';

type Props = {
  title: string;
  description: string;
  url: string;
};

const ShareButton = ({ title, description, url }: Props) => {
  const { t } = useTranslation();
  const breakpoint = useBreakpoint();
  const [hasShared, setHasShared] = useState<boolean>(false);

  const onShareClick = async () => {
    if (typeof navigator.share === 'function') {
      await navigator.share({ title, text: description, url });
      return;
    }

    copyToClipboard(window.location.href);
    setHasShared(true);
    setTimeout(() => setHasShared(false), 2000);
  };

  return (
    <Button
      label={hasShared ? t('video:copied_url') : t('video:share')}
      startIcon={hasShared ? <Check /> : <Share />}
      onClick={onShareClick}
      active={hasShared}
      fullWidth={breakpoint < Breakpoint.md}
    />
  );
};

export default ShareButton;
