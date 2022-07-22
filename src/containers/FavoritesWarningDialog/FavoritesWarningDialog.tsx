import React from 'react';

import { useFavoritesStore } from '#src/stores/FavoritesStore';
import Alert from '#src/components/Alert/Alert';

const FavoritesWarningDialog = () => {
  const { clearWarning, warning } = useFavoritesStore((state) => ({
    clearWarning: state.clearWarning,
    warning: state.warning,
  }));

  return <Alert open={warning !== null} message={warning} onClose={clearWarning} />;
};

export default FavoritesWarningDialog;
