const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Listen to console messages
  page.on('console', msg => console.log('BROWSER:', msg.text()));

  await page.goto('http://localhost:8080/src/pages/index1000.html');
  await page.fill('#username', 'admin');
  await page.fill('#password', 'admin123');
  await page.click('.btn-login');
  await page.waitForURL('**/dashboard1000.html');
  await page.click('a[href="usuarios1000.html"]');
  await page.waitForTimeout(500);

  console.log('\n=== BEFORE TAB CLICK ===');
  const beforeClick = await page.evaluate(() => {
    const usersList = document.getElementById('usersList');
    return {
      usersListHTML: usersList ? usersList.innerHTML.substring(0, 100) : 'NOT FOUND',
      cardsCount: document.querySelectorAll('.user-card').length
    };
  });
  console.log('Before click:', JSON.stringify(beforeClick, null, 2));

  console.log('\n=== CLICKING LIST TAB ===');
  await page.click('.tab-btn[data-tab="list"]');

  console.log('\n=== IMMEDIATELY AFTER CLICK (0ms) ===');
  const after0ms = await page.evaluate(() => {
    const usersList = document.getElementById('usersList');
    const tabPanel = document.getElementById('tab-list');
    return {
      tabPanelDisplay: tabPanel ? window.getComputedStyle(tabPanel).display : 'NOT FOUND',
      usersListHTML: usersList ? usersList.innerHTML.substring(0, 100) : 'NOT FOUND',
      cardsCount: document.querySelectorAll('.user-card').length
    };
  });
  console.log('After 0ms:', JSON.stringify(after0ms, null, 2));

  await page.waitForTimeout(100);
  console.log('\n=== AFTER 100ms ===');
  const after100ms = await page.evaluate(() => {
    const usersList = document.getElementById('usersList');
    const cards = document.querySelectorAll('.user-card');
    return {
      usersListHTML: usersList ? usersList.innerHTML.substring(0, 200) : 'NOT FOUND',
      cardsCount: cards.length,
      firstCardHeight: cards[0] ? cards[0].offsetHeight : 'N/A',
      usersListHeight: usersList ? usersList.offsetHeight : 'N/A'
    };
  });
  console.log('After 100ms:', JSON.stringify(after100ms, null, 2));

  await page.waitForTimeout(500);
  console.log('\n=== AFTER 600ms TOTAL ===');
  const after600ms = await page.evaluate(() => {
    const usersList = document.getElementById('usersList');
    const cards = document.querySelectorAll('.user-card');
    const firstCard = cards[0];

    return {
      cardsCount: cards.length,
      usersListOffsetHeight: usersList ? usersList.offsetHeight : 'N/A',
      firstCardInfo: firstCard ? {
        offsetHeight: firstCard.offsetHeight,
        clientHeight: firstCard.clientHeight,
        scrollHeight: firstCard.scrollHeight,
        display: window.getComputedStyle(firstCard).display,
        height: window.getComputedStyle(firstCard).height,
        visibility: window.getComputedStyle(firstCard).visibility,
        innerHTML: firstCard.innerHTML.substring(0, 150)
      } : 'NO CARD FOUND'
    };
  });
  console.log('After 600ms:', JSON.stringify(after600ms, null, 2));

  // Take screenshot
  await page.screenshot({
    path: '.dev/screenshots/usuarios/debug-tab-switch.png',
    fullPage: true
  });
  console.log('\nScreenshot saved to .dev/screenshots/usuarios/debug-tab-switch.png');

  await browser.close();
})();
