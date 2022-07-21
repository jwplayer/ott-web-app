export const shouldRequestPlaylist = (isAlternativeShelf: boolean, hasWatchedItem: boolean, isRecommendationsShelf: boolean) => {
  if (isRecommendationsShelf && !hasWatchedItem) {
    return false;
  }

  if (isAlternativeShelf) {
    return false;
  }

  return true;
};
