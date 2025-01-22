import { useCallback, useEffect } from 'react';

import scrollbarSize from '../utils/dom';

const removeBodyScrolling = () => {
  document.body.style.marginRight = `${scrollbarSize(true)}px`;
  document.body.style.overflowY = 'hidden';
};

const restoreBodyScrolling = () => {
  const dialogs = Array.from(document.querySelectorAll('dialog'));
  const openDialogs = dialogs.filter((dialog) => dialog.open).length;

  if (!openDialogs) {
    document.body.style.removeProperty('margin-right');
    document.body.style.removeProperty('overflow-y');
  }
};

// shared variable between `useModal` usages
let originElement: HTMLElement | undefined;

export const useModal = () => {
  const restoreFocus = useCallback(() => {
    // restore focus when the focus is "lost" to the body element
    if (!originElement || document.activeElement !== document.body) {
      return;
    }

    const dialogs = Array.from(document.querySelectorAll('dialog'));
    const openDialogs = dialogs.filter((dialog) => dialog.open).length;

    // this was the last open dialog
    if (openDialogs === 0) {
      originElement.focus();
      originElement = undefined;
    }
  }, []);

  useEffect(() => {
    return () => {
      restoreBodyScrolling();
      restoreFocus();
    };
  }, [restoreFocus]);

  const handleOpen = useCallback(() => {
    if (!originElement) {
      originElement = document.activeElement as HTMLElement;
    }

    removeBodyScrolling();
  }, []);

  const handleClose = useCallback(() => {
    restoreFocus();
    restoreBodyScrolling();
  }, [restoreFocus]);

  return { handleOpen, handleClose };
};
