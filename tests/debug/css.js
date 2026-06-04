const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  await page.goto('http://localhost:8080/src/pages/index1000.html');
  await page.fill('#username', 'admin');
  await page.fill('#password', 'admin123');
  await page.click('.btn-login');
  await page.waitForURL('**/dashboard1000.html');
  await page.click('a[href="usuarios1000.html"]');
  await page.waitForTimeout(500);

  // Fill form
  await page.fill('#nombre', 'Debug');
  await page.fill('#apellido', 'User');
  await page.fill('#password', 'test');
  await page.selectOption('#puesto', 'Administrador');
  await page.selectOption('#departamento', 'Calidad');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);

  // Check if elemento usersList is visible
  const isVisible = await page.isVisible('#usersList');
  console.log('usersList is visible:', isVisible);

  // Get computed styles
  const styles = await page.evaluate(() => {
    const card = document.querySelector('.user-card');
    if (!card) return { error: 'No card found' };

    const computed = window.getComputedStyle(card);
    return {
      display: computed.display,
      height: computed.height,
      width: computed.width,
      padding: computed.padding,
      backgroundColor: computed.backgroundColor,
      position: computed.position,
      visibility: computed.visibility,
      opacity: computed.opacity
    };
  });

  console.log('Card styles:', JSON.stringify(styles, null, 2));

  // Take screenshot
  await page.screenshot({ path: '.dev/screenshots/usuarios/debug-final.png', fullPage: true });

  await browser.close();
})();
