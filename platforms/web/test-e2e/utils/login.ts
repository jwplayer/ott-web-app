export function tryToSubmitForm(I: CodeceptJS.I) {
  I.submitForm(false);
  I.seeElementInDOM('div[class*=formFeedback]'); // This element can be visually hidden through CSS
  I.dontSee('Unknown error');
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

export async function checkField(I: CodeceptJS.I, field, error: string | boolean = false) {
  const hoverColor = 'rgba(255, 255, 255, 0.7)';
  const activeColor = error ? 'rgb(255, 53, 53)' : 'rgb(255, 255, 255)';
  const restingColor = error ? 'rgb(255, 53, 53)' : 'rgba(255, 255, 255, 0.34)';

  // If error === true, there's an error, but no associated message
  if (error && error !== true) {
    const helperId = await I.grabAttributeFrom(`input[name="${field}"]`, 'aria-describedby');
    I.see(error, `[data-testid=login-${field}-input]`);
    I.seeElement(`#${helperId}[class*=helperText]`);
    I.seeAttributesOnElements(`[name="${field}"]`, { 'aria-invalid': 'true' });
    I.seeCssPropertiesOnElements(`[data-testid="login-${field}-input"] [class*=helperText]`, { color: '#FF3535' });
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
