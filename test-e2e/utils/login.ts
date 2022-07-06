const formFeedback = 'div[class*=formFeedback]';

export function tryToSubmitForm(I: CodeceptJS.I) {
  I.submitForm(false);
  I.dontSeeElement(formFeedback);
  I.dontSee('Incorrect email/password combination');
}

export function fillAndCheckField(I: CodeceptJS.I, field, value, error: string | boolean = false) {
  if (value === '') {
    // For some reason the Codecept/playwright clear and fillField with empty string do not fire the change events
    // so use key presses to clear the field to avoid test-induced bugs
    I.click(`input[name="${field}"]`);
    I.pressKey(['CommandOrControl', 'a']);
    I.pressKey('Backspace');
  } else {
    I.fillField(field, value);
  }

  checkField(I, field, error);
}

export function checkField(I: CodeceptJS.I, field, error: string | boolean = false) {
  const hoverColor = 'rgba(255, 255, 255, 0.7)';
  const activeColor = error ? 'rgb(255, 12, 62)' : 'rgb(255, 255, 255)';
  const restingColor = error ? 'rgb(255, 12, 62)' : 'rgba(255, 255, 255, 0.34)';

  // If error === true, there's an error, but no associated message
  if (error && error !== true) {
    I.see(error, `[data-testid=login-${field}-input]`);
    I.seeCssPropertiesOnElements(`[data-testid="login-${field}-input"] [class*=helperText]`, { color: '#ff0c3e' });
  } else {
    I.dontSeeElement(`[class*=helperText] [data-testid="${field}-input"]`);
  }

  // There are 3 css states for the input fields, hover, active, and 'resting'. Check all 3.
  // This isn't so much for testing functionality, as it is to avoid test bugs caused by codecept placing the mouse
  // different places and accidentally triggering the wrong css color
  // Hover:
  I.click(`input[name="${field}"]`);
  I.seeCssPropertiesOnElements(`[data-testid="login-${field}-input"] [class*=container]`, { 'border-color': hoverColor });
  // Active (no hover):
  I.moveCursorTo('button[type=submit]');
  I.seeCssPropertiesOnElements(`[data-testid="login-${field}-input"] [class*=container]`, { 'border-color': activeColor });
  // Resting:
  I.click('div[class*=banner]');
  I.seeCssPropertiesOnElements(`[data-testid="login-${field}-input"] [class*=container]`, { 'border-color': restingColor });
}
