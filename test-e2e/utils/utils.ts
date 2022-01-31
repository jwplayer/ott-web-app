const openMobileDrawer = 'div[aria-label="Open menu"]'

export const constants =  {
    username: '12345@test.org',
    password: 'Ax854bZ!$',
  };

export const selectors = {
    closeButton: 'div[aria-label="Close"]',
    loginForm: 'form[data-testid="login-form"]',
    openMobileDrawer: openMobileDrawer,
    registrationForm: 'form[data-testid="registration-form"]',
  };

export const functions = {
    openDrawer: function (I, isLoggedIn = false) {
      I.click(openMobileDrawer);

      if (isLoggedIn) {
        I.see('Account');
        I.see('Favorites');
        I.see('Log out');
      } else {
        I.see('Sign in');
        I.see('Sign up');
      }
    }
  };