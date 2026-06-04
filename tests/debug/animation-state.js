const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Login
  await page.goto('http://localhost:8080/src/pages/index1000.html');
  await page.fill('#username', 'admin');
  await page.fill('#password', 'admin123');
  await page.click('.btn-login');
  await page.waitForURL('**/dashboard1000.html');

  // Navigate to usuarios
  await page.click('a[href="usuarios1000.html"]');
  await page.waitForTimeout(500);

  // Create user
  await page.fill('#nombre', 'TestUser');
  await page.fill('#apellido', 'AnimTest');
  await page.fill('#password', 'testpass');
  await page.selectOption('#puesto', 'Administrador');
  await page.selectOption('#departamento', 'Calidad');

  page.once('dialog', dialog => dialog.accept());
  await page.click('button[type="submit"]');

  // Wait for tab switch to complete
  await page.waitForTimeout(2000);

  console.log('\n=== CHECKING ANIMATION STATE ===');
  const animState = await page.evaluate(() => {
    const tabPanel = document.querySelector('.tab-panel.active');
    const listCard = document.querySelector('.list-card');
    const usersList = document.getElementById('usersList');
    const userCard = document.querySelector('.user-card');

    const getAnimInfo = (el, name) => {
      if (!el) return { name, error: 'not found' };
      const style = window.getComputedStyle(el);
      return {
        name,
        className: el.className,
        display: style.display,
        opacity: style.opacity,
        animation: style.animation,
        animationName: style.animationName,
        animationDuration: style.animationDuration,
        animationTimingFunction: style.animationTimingFunction,
        animationDelay: style.animationDelay,
        animationIterationCount: style.animationIterationCount,
        animationDirection: style.animationDirection,
        animationFillMode: style.animationFillMode,
        animationPlayState: style.animationPlayState,
        offsetHeight: el.offsetHeight,
        scrollHeight: el.scrollHeight
      };
    };

    return {
      tabPanel: getAnimInfo(tabPanel, 'tab-panel'),
      listCard: getAnimInfo(listCard, 'list-card'),
      usersList: getAnimInfo(usersList, 'users-grid'),
      userCard: getAnimInfo(userCard, 'user-card')
    };
  });

  console.log(JSON.stringify(animState, null, 2));

  // Check CSS rules applied
  console.log('\n=== CHECKING CSS RULES ===');
  const cssRules = await page.evaluate(() => {
    const tabPanel = document.querySelector('.tab-panel.active');
    if (!tabPanel) return { error: 'tab-panel not found' };

    // Get all stylesheets
    const sheets = Array.from(document.styleSheets);
    const matchingRules = [];

    sheets.forEach(sheet => {
      try {
        const rules = Array.from(sheet.cssRules || []);
        rules.forEach(rule => {
          if (rule.selectorText && rule.selectorText.includes('.tab-panel')) {
            matchingRules.push({
              selector: rule.selectorText,
              cssText: rule.cssText
            });
          }
        });
      } catch (e) {
        // Can't access cross-origin stylesheets
      }
    });

    return matchingRules;
  });

  console.log(JSON.stringify(cssRules, null, 2));

  // Wait a bit longer to see if animation completes
  console.log('\n=== WAITING 3 SECONDS FOR ANIMATION TO COMPLETE ===');
  await page.waitForTimeout(3000);

  const afterWait = await page.evaluate(() => {
    const tabPanel = document.querySelector('.tab-panel.active');
    const style = window.getComputedStyle(tabPanel);
    return {
      opacity: style.opacity,
      offsetHeight: tabPanel.offsetHeight,
      display: style.display
    };
  });

  console.log('After wait:', JSON.stringify(afterWait, null, 2));

  // Take screenshot
  await page.screenshot({
    path: '.dev/screenshots/usuarios/debug-animation.png',
    fullPage: true
  });
  console.log('\nScreenshot saved to .dev/screenshots/usuarios/debug-animation.png');

  await browser.close();
})();
