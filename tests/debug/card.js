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

  // Check the actual user card element
  const cardInfo = await page.evaluate(() => {
    const card = document.querySelector('.user-card');
    if (!card) return { error: 'No card found' };

    const computed = window.getComputedStyle(card);
    return {
      exists: true,
      display: computed.display,
      height: computed.height,
      width: computed.width,
      minHeight: computed.minHeight,
      maxHeight: computed.maxHeight,
      padding: computed.padding,
      margin: computed.margin,
      boxSizing: computed.boxSizing,
      position: computed.position,
      visibility: computed.visibility,
      opacity: computed.opacity,
      overflow: computed.overflow,
      // Actual dimensions
      offsetHeight: card.offsetHeight,
      offsetWidth: card.offsetWidth,
      clientHeight: card.clientHeight,
      clientWidth: card.clientWidth,
      scrollHeight: card.scrollHeight,
      // Check if it has content
      innerHTML: card.innerHTML.substring(0, 200),
      childrenCount: card.children.length
    };
  });

  console.log('User Card Info:');
  console.log(JSON.stringify(cardInfo, null, 2));

  await browser.close();
})();
