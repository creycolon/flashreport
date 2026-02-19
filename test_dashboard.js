const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  page.on('console', msg => console.log(`[${msg.type()}]`, msg.text()));
  page.on('pageerror', error => console.error('[PAGE ERROR]', error.message));

  console.log('Navigating to http://localhost:8081 ...');
  await page.goto('http://localhost:8081', { waitUntil: 'networkidle0', timeout: 30000 });

  await page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {});

  const url = page.url();
  console.log('Current URL:', url);

  const rootText = await page.evaluate(() => document.getElementById('root').innerText);
  console.log('Root text:', rootText);

  if (rootText.includes('Dashboard Debug')) {
    console.log('✅ SUCCESS: Dashboard route works! App is functional.');
    console.log('✅ Route: /(tabs)/dashboard');
  } else {
    console.log('❌ FAILED: Dashboard routing not working');
    if (rootText.includes('Ruta no encontrada')) {
      console.log('Route unmatched');
    }
  }

  await browser.close();
})();