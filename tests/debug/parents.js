const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto('http://localhost:8080/src/pages/index1000.html');
  await page.fill('#username', 'admin');
  await page.fill('#password', 'admin123');
  await page.click('.btn-login');
  await page.waitForURL('**/dashboard1000.html');
  await page.click('a[href="usuarios1000.html"]');
  await page.waitForTimeout(500);
  await page.click('.tab-btn[data-tab="list"]');
  await page.waitForTimeout(500);

  // Check all parents
  const parentStyles = await page.evaluate(() => {
    const usersList = document.getElementById('usersList');
    const listCard = usersList.closest('.list-card');
    const listSection = usersList.closest('.list-section');
    const tabPanel = usersList.closest('.tab-panel');

    const getStyles = (el, name) => {
      if (!el) return { name, error: 'not found' };
      const style = window.getComputedStyle(el);
      return {
        name,
        display: style.display,
        height: style.height,
        maxHeight: style.maxHeight,
        overflow: style.overflow,
        visibility: style.visibility,
        offsetHeight: el.offsetHeight
      };
    };

    return {
      usersList: getStyles(usersList, 'usersList'),
      listCard: getStyles(listCard, 'listCard'),
      listSection: getStyles(listSection, 'listSection'),
      tabPanel: getStyles(tabPanel, 'tabPanel')
    };
  });

  console.log(JSON.stringify(parentStyles, null, 2));
  await browser.close();
})();
