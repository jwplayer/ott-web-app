// in this file you can append custom step methods to 'I' object

module.exports = function() {
  return actor({

    // Define custom steps here, use 'this' to access default methods of I.
    // It is recommended to place a general 'login' function here.

    login: function (email = '12345@test.org', password = 'Ax854bZ!$') {
      this.amOnPage('/');
      this.click('Sign in');
      this.fillField('Email', email);
      this.fillField('password', password);
      this.click('button[type="submit"]');
      this.wait(5);
    },
    loginMobile: function (email = '12345@test.org', password = 'Ax854bZ!$') {
      this.amOnPage('/');
      this.click('div[aria-label="Open menu"]');
      this.click('Sign in');
      this.fillField('Email', email);
      this.fillField('password', password);
      this.click('button[type="submit"]');
      this.wait(5);
    }
  });
}
