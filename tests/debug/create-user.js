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

  console.log('\n=== CHECKING LOCALSTORAGE BEFORE CREATING USER ===');
  const beforeStorage = await page.evaluate(() => {
    const data = localStorage.getItem('qc_users');
    return {
      raw: data,
      parsed: data ? JSON.parse(data) : null
    };
  });
  console.log('Before:', JSON.stringify(beforeStorage, null, 2));

  console.log('\n=== CREATING USER ===');
  await page.fill('#nombre', 'Test');
  await page.fill('#apellido', 'User');
  await page.fill('#password', 'testpass');
  await page.selectOption('#puesto', 'Administrador');
  await page.selectOption('#departamento', 'Calidad');

  // Accept alert before clicking submit
  page.once('dialog', dialog => {
    console.log('Alert message:', dialog.message());
    dialog.accept();
  });

  await page.click('button[type="submit"]');
  await page.waitForTimeout(1000);

  console.log('\n=== CHECKING LOCALSTORAGE AFTER CREATING USER ===');
  const afterStorage = await page.evaluate(() => {
    const data = localStorage.getItem('qc_users');
    return {
      raw: data,
      parsed: data ? JSON.parse(data) : null,
      getUsersResult: (() => {
        const users = localStorage.getItem('qc_users');
        return users ? JSON.parse(users) : [];
      })()
    };
  });
  console.log('After:', JSON.stringify(afterStorage, null, 2));

  console.log('\n=== CHECKING RENDERED USERS ===');
  const rendered = await page.evaluate(() => {
    const usersList = document.getElementById('usersList');
    const cards = document.querySelectorAll('.user-card');
    return {
      usersListHTML: usersList ? usersList.innerHTML.substring(0, 300) : 'NOT FOUND',
      cardsCount: cards.length,
      badge: document.getElementById('tabTotalUsers').textContent
    };
  });
  console.log('Rendered:', JSON.stringify(rendered, null, 2));

  // Take screenshot
  await page.screenshot({
    path: '.dev/screenshots/usuarios/debug-create-user.png',
    fullPage: true
  });
  console.log('\nScreenshot saved to .dev/screenshots/usuarios/debug-create-user.png');

  await browser.close();
})();
