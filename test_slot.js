const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  const logs = [];
  page.on('console', msg => {
    logs.push(msg.text());
    console.log(`[${msg.type()}]`, msg.text());
  });
  page.on('pageerror', error => console.error('[PAGE ERROR]', error.message));

  console.log('Navigating to http://localhost:8081 ...');
  await page.goto('http://localhost:8081', { waitUntil: 'networkidle0', timeout: 30000 });

  await page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {});

  const url = page.url();
  console.log('Current URL:', url);

  // Check logs for TABS LAYOUT
  if (logs.some(l => l.includes('TABS LAYOUT'))) {
    console.log('✅ Tabs layout rendered!');
  } else {
    console.log('❌ Tabs layout not rendered');
  }

  const rootText = await page.evaluate(() => document.getElementById('root').innerText);
  console.log('Root text preview:', rootText.substring(0, 200));

  await browser.close();
})();