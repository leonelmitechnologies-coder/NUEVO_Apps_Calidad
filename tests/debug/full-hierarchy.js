const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Clear and login
  await context.clearCookies();
  await page.goto('http://localhost:8080/src/pages/index1000.html');
  await page.evaluate(() => localStorage.clear());
  await page.goto('http://localhost:8080/src/pages/index1000.html');
  await page.fill('#username', 'admin');
  await page.fill('#password', 'admin123');
  await page.click('.btn-login');
  await page.waitForURL('**/dashboard1000.html');
  await page.click('a[href="usuarios1000.html"]');
  await page.waitForTimeout(500);
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Create user
  await page.fill('#nombre', 'Test');
  await page.fill('#apellido', 'Debug');
  await page.fill('#password', 'pass');
  await page.selectOption('#puesto', 'Administrador');
  await page.selectOption('#departamento', 'Calidad');
  page.once('dialog', dialog => dialog.accept());
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);

  console.log('\n=== FULL DOM HIERARCHY ===');
  const hierarchy = await page.evaluate(() => {
    const getInfo = (selector) => {
      const el = document.querySelector(selector);
      if (!el) return { error: 'not found' };
      const style = window.getComputedStyle(el);
      return {
        selector,
        display: style.display,
        position: style.position,
        height: style.height,
        minHeight: style.minHeight,
        maxHeight: style.maxHeight,
        flex: style.flex,
        flexDirection: style.flexDirection,
        flexGrow: style.flexGrow,
        flexShrink: style.flexShrink,
        overflow: style.overflow,
        offsetHeight: el.offsetHeight,
        scrollHeight: el.scrollHeight,
        className: el.className
      };
    };

    return {
      body: getInfo('body'),
      dashboardPage: getInfo('.dashboard-page'),
      dashboardMain: getInfo('.dashboard-main'),
      dashboardContainer: getInfo('.dashboard-container'),
      tabsContent: getInfo('.tabs-content'),
      tabPanel: getInfo('.tab-panel.active'),
      listSection: getInfo('.list-section'),
      listCard: getInfo('.list-card'),
      cardHeader: getInfo('.list-card .card-header'),
      listControls: getInfo('.list-controls'),
      usersList: getInfo('#usersList'),
      userCard: getInfo('.user-card')
    };
  });

  console.log(JSON.stringify(hierarchy, null, 2));

  // Check if dashboard-page has specific styles
  console.log('\n=== CHECKING DASHBOARD CSS ===');
  const dashboardCss = await page.evaluate(() => {
    const sheets = Array.from(document.styleSheets);
    const rules = [];

    sheets.forEach(sheet => {
      try {
        const sheetRules = Array.from(sheet.cssRules || []);
        sheetRules.forEach(rule => {
          if (rule.selectorText && (
            rule.selectorText.includes('.dashboard-page') ||
            rule.selectorText.includes('.dashboard-main') ||
            rule.selectorText.includes('.dashboard-container')
          )) {
            rules.push({
              selector: rule.selectorText,
              cssText: rule.cssText
            });
          }
        });
      } catch (e) {}
    });

    return rules;
  });

  console.log(JSON.stringify(dashboardCss, null, 2));

  await page.screenshot({
    path: '.dev/screenshots/usuarios/debug-hierarchy.png',
    fullPage: true
  });

  await browser.close();
})();
