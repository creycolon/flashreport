const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  page.on('console', msg => console.log(`[${msg.type()}]`, msg.text()));
  page.on('pageerror', error => console.error('[PAGE ERROR]', error.message));

  console.log('Navigating to http://localhost:8081 ...');
  await page.goto('http://localhost:8081', { waitUntil: 'networkidle0', timeout: 30000 });

  // Wait for redirect
  await page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {});

  // Check current URL
  const url = page.url();
  console.log('Current URL:', url);

  // Get root text
  const rootText = await page.evaluate(() => document.getElementById('root').innerText);
  console.log('Root text:', rootText);

  // Check if test screen appears
  if (rootText.includes('Test Screen')) {
    console.log('✅ Test route works!');
  } else {
    console.log('❌ Test route not rendered');
  }

  await browser.close();
})();