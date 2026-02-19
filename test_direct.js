const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  page.on('console', msg => console.log(`[${msg.type()}]`, msg.text()));
  page.on('pageerror', error => console.error('[PAGE ERROR]', error.message));

  console.log('Navigating directly to http://localhost:8081/(tabs)/index ...');
  await page.goto('http://localhost:8081/(tabs)/index', { waitUntil: 'networkidle0', timeout: 30000 });

  const url = page.url();
  console.log('Current URL:', url);

  const rootText = await page.evaluate(() => document.getElementById('root').innerText);
  console.log('Root text:', rootText);

  if (rootText.includes('Dashboard Debug')) {
    console.log('✅ DIRECT ACCESS: /(tabs)/index works!');
  } else {
    console.log('❌ DIRECT ACCESS: /(tabs)/index failed');
  }

  await browser.close();
})();