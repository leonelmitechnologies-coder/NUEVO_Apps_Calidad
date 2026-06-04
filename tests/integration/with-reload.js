const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('=== STARTING TEST WITH CACHE CLEAR ===\n');

  // Clear storage
  await context.clearCookies();
  await page.goto('http://localhost:8080/src/pages/index1000.html');
  await page.evaluate(() => localStorage.clear());

  // Login
  console.log('1. Logging in...');
  await page.goto('http://localhost:8080/src/pages/index1000.html');
  await page.fill('#username', 'admin');
  await page.fill('#password', 'admin123');
  await page.click('.btn-login');
  await page.waitForURL('**/dashboard1000.html');

  // Navigate to usuarios
  console.log('2. Navigating to usuarios page...');
  await page.click('a[href="usuarios1000.html"]');
  await page.waitForTimeout(500);

  // Force reload to get fresh CSS
  console.log('3. Reloading page with cache bypass...');
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Create user
  console.log('4. Creating test user...');
  await page.fill('#nombre', 'TestUser');
  await page.fill('#apellido', 'Final');
  await page.fill('#password', 'testpass');
  await page.selectOption('#puesto', 'Administrador');
  await page.selectOption('#departamento', 'Calidad');

  page.once('dialog', dialog => {
    console.log('   Alert:', dialog.message());
    dialog.accept();
  });

  await page.click('button[type="submit"]');

  // Wait longer for tab switch and animation
  console.log('5. Waiting for tab switch and animation...');
  await page.waitForTimeout(2000);

  // Check state
  console.log('\n=== CHECKING VISIBILITY ===');
  const visibility = await page.evaluate(() => {
    const tabPanel = document.querySelector('.tab-panel.active');
    const listCard = document.querySelector('.list-card');
    const userCard = document.querySelector('.user-card');

    const style1 = window.getComputedStyle(tabPanel);
    const style2 = window.getComputedStyle(listCard);
    const style3 = userCard ? window.getComputedStyle(userCard) : null;

    return {
      tabPanel: {
        opacity: style1.opacity,
        offsetHeight: tabPanel.offsetHeight,
        animation: style1.animation
      },
      listCard: {
        opacity: style2.opacity,
        offsetHeight: listCard.offsetHeight,
        animation: style2.animation
      },
      userCard: userCard ? {
        opacity: style3.opacity,
        offsetHeight: userCard.offsetHeight,
        boundingRect: userCard.getBoundingClientRect()
      } : 'not found'
    };
  });

  console.log(JSON.stringify(visibility, null, 2));

  // Take screenshot
  console.log('\n6. Taking screenshot...');
  await page.screenshot({
    path: '.dev/screenshots/usuarios/test-with-reload.png',
    fullPage: true
  });

  console.log('\n=== TEST COMPLETE ===');
  console.log('Screenshot: .dev/screenshots/usuarios/test-with-reload.png');

  await browser.close();
})();
