const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const errors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push({ url: page.url(), text: msg.text() });
      console.error(`[CONSOLE ERROR] ${page.url()}: ${msg.text()}`);
    }
  });

  page.on('pageerror', error => {
    errors.push({ url: page.url(), text: error.message });
    console.error(`[PAGE ERROR] ${page.url()}: ${error.message}`);
  });

  const routes = ['dashboard', 'list', 'add', 'reports', 'settings'];
  
  for (const route of routes) {
    console.log(`\n=== Testing /${route} ===`);
    try {
      await page.goto(`http://localhost:8081/${route}`, { waitUntil: 'networkidle0', timeout: 10000 });
      await page.waitForSelector('body', { timeout: 5000 });
      const bodyText = await page.evaluate(() => document.body.innerText);
      if (bodyText.includes('Error') && bodyText.includes('useTheme')) {
        console.error(`Theme error on ${route}`);
      }
      console.log(`Loaded ${route}, body length: ${bodyText.length}`);
    } catch (err) {
      console.error(`Failed to load ${route}:`, err.message);
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  await browser.close();

  console.log('\n=== SUMMARY ===');
  if (errors.length === 0) {
    console.log('No console errors detected.');
  } else {
    console.log(`Found ${errors.length} errors:`);
    errors.forEach(err => console.log(`  ${err.url}: ${err.text}`));
  }
})();