export const attachAccessibilityListener = () => {
  let isTabbing = false;

  // when the user presses the Tab key, we add a `is-tabbing` className to the body element, so we can enable outline
  // focus for keyboard users
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Tab' && !isTabbing) {
      isTabbing = true;
      document.body.classList.add('is-tabbing');
    }
  });

  // remove the `is-tabbing` className when the user uses a mouse again to interact with elements
  document.addEventListener('mousedown', () => {
    if (isTabbing) {
      isTabbing = false;
      document.body.classList.remove('is-tabbing');
    }
  });
};
