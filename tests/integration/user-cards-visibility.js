const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Listen to console messages
  page.on('console', msg => console.log('BROWSER:', msg.text()));

  console.log('=== STARTING TEST ===\n');

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

  // Create user
  console.log('3. Creating test user...');
  await page.fill('#nombre', 'TestUser');
  await page.fill('#apellido', 'Visibility');
  await page.fill('#password', 'testpass');
  await page.selectOption('#puesto', 'Administrador');
  await page.selectOption('#departamento', 'Calidad');

  // Accept alert
  page.once('dialog', dialog => {
    console.log('   Alert:', dialog.message());
    dialog.accept();
  });

  await page.click('button[type="submit"]');
  await page.waitForTimeout(1000);

  // Take screenshot after user creation
  console.log('4. Taking screenshot after user creation...');
  await page.screenshot({
    path: '.dev/screenshots/usuarios/after-user-creation.png',
    fullPage: true
  });

  // Inspect user cards visibility
  console.log('\n=== INSPECTING USER CARDS ===');
  const visibility = await page.evaluate(() => {
    const usersList = document.getElementById('usersList');
    const cards = document.querySelectorAll('.user-card');
    const listCard = usersList.closest('.list-card');
    const listSection = usersList.closest('.list-section');
    const tabPanel = usersList.closest('.tab-panel');
    const dashboardContainer = document.querySelector('.dashboard-container');

    const getElementInfo = (el, name) => {
      if (!el) return { name, error: 'not found' };
      const style = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return {
        name,
        display: style.display,
        visibility: style.visibility,
        opacity: style.opacity,
        height: style.height,
        minHeight: style.minHeight,
        maxHeight: style.maxHeight,
        flex: style.flex,
        flexShrink: style.flexShrink,
        overflow: style.overflow,
        offsetHeight: el.offsetHeight,
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight,
        boundingRect: {
          top: rect.top,
          bottom: rect.bottom,
          height: rect.height,
          width: rect.width
        }
      };
    };

    const result = {
      dashboardContainer: getElementInfo(dashboardContainer, 'dashboard-container'),
      tabPanel: getElementInfo(tabPanel, 'tab-panel'),
      listSection: getElementInfo(listSection, 'list-section'),
      listCard: getElementInfo(listCard, 'list-card'),
      usersList: getElementInfo(usersList, 'users-grid'),
      cardsCount: cards.length,
      cards: []
    };

    // Get info for first 3 cards
    cards.forEach((card, i) => {
      if (i < 3) {
        result.cards.push(getElementInfo(card, `user-card-${i}`));
      }
    });

    return result;
  });

  console.log(JSON.stringify(visibility, null, 2));

  // Check if cards are actually visible in viewport
  console.log('\n=== CHECKING VIEWPORT VISIBILITY ===');
  const viewportCheck = await page.evaluate(() => {
    const cards = document.querySelectorAll('.user-card');
    const results = [];

    cards.forEach((card, i) => {
      const rect = card.getBoundingClientRect();
      const isInViewport = (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= window.innerHeight &&
        rect.right <= window.innerWidth
      );

      results.push({
        index: i,
        isInViewport,
        rect: {
          top: rect.top,
          bottom: rect.bottom,
          height: rect.height,
          width: rect.width
        },
        windowHeight: window.innerHeight,
        windowWidth: window.innerWidth
      });
    });

    return results;
  });

  console.log(JSON.stringify(viewportCheck, null, 2));

  // Try to scroll to user card
  console.log('\n=== ATTEMPTING TO SCROLL TO CARD ===');
  const scrollResult = await page.evaluate(() => {
    const card = document.querySelector('.user-card');
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return 'Scrolled to card';
    }
    return 'No card found';
  });
  console.log(scrollResult);

  await page.waitForTimeout(1000);

  // Take final screenshot
  console.log('\n5. Taking final screenshot...');
  await page.screenshot({
    path: '.dev/screenshots/usuarios/final-state.png',
    fullPage: true
  });

  console.log('\n=== TEST COMPLETE ===');
  console.log('Screenshots saved:');
  console.log('  - .dev/screenshots/usuarios/after-user-creation.png');
  console.log('  - .dev/screenshots/usuarios/final-state.png');

  await browser.close();
})();
