const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('https://news.ycombinator.com/newest');
  await page.getByRole('link', { name: 'new', exact: true }).click();
  await page.getByRole('link', { name: 'More' }).click();
  await page.getByRole('link', { name: 'More', exact: true }).click();
  await page.getByRole('link', { name: 'More', exact: true }).click();
  await page.getByText('110.').click();

})();