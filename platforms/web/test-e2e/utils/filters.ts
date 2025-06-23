export async function selectFilterAndCheck(I: CodeceptJS.I, option, filters: string[]) {
  if (await I.isMobile()) {
    I.selectOption('Filter videos by genre', option);
  } else {
    I.click(option);
  }

  await checkSelectedFilterButton(I, option, filters);
}

export async function checkSelectedFilterButton(I: CodeceptJS.I, expectedButton, filters: string[]) {
  if (await I.isMobile()) {
    I.see(expectedButton);
    I.waitForAllInvisible(
      filters.filter((f) => f !== expectedButton),
      0,
    );
  } else {
    I.seeAll(filters);
    I.see(expectedButton, 'div[class*=filterRow] button[class*=active]');
    I.wait(0.1);

    // Check that the 'All' button is visually active
    await I.seeCssProperties({ xpath: `//button[contains(., "${expectedButton}")]` }, { color: 'rgb(0, 0, 0)', 'background-color': 'rgb(204, 204, 204)' });
    // Check that the other filter buttons are not visually active
    await I.seeCssProperties(
      { xpath: `//div[contains(@class, "filterRow")]/button[not(contains(., "${expectedButton}"))]` },
      { color: 'rgb(255, 255, 255)', 'background-color': 'rgba(0, 0, 0, 0.3)' },
    );
  }
}
