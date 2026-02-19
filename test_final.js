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

  const rootText = await page.evaluate(() => document.getElementById('root').innerText);
  console.log('Root text:', rootText);

  if (rootText.includes('Dashboard Debug')) {
    console.log('✅ SUCCESS: Tabs routing works! App is functional.');
    console.log('✅ Route: /(tabs)/index');
  } else {
    console.log('❌ FAILED: Tabs routing not working');
    if (rootText.includes('Ruta no encontrada')) {
      console.log('Route unmatched');
    }
  }

  // Also test other tabs if available
  console.log('\nTesting other tabs...');
  await page.goto('http://localhost:8081/(tabs)/list', { waitUntil: 'networkidle0' });
  const listText = await page.evaluate(() => document.getElementById('root').innerText);
  if (!listText.includes('Ruta no encontrada')) {
    console.log('✅ Tab /list accessible');
  }

  await page.goto('http://localhost:8081/(tabs)/add', { waitUntil: 'networkidle0' });
  const addText = await page.evaluate(() => document.getElementById('root').innerText);
  if (!addText.includes('Ruta no encontrada')) {
    console.log('✅ Tab /add accessible');
  }

  await page.goto('http://localhost:8081/test', { waitUntil: 'networkidle0' });
  const testText = await page.evaluate(() => document.getElementById('root').innerText);
  if (testText.includes('Test Screen')) {
    console.log('✅ Test route works');
  }

  await browser.close();
})();