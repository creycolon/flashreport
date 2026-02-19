const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  page.on('console', msg => console.log(`[${msg.type()}]`, msg.text()));
  page.on('pageerror', error => console.error('[PAGE ERROR]', error.message));

  console.log('Testing all tab routes...\n');

  // Test dashboard
  console.log('1. Testing /dashboard ...');
  await page.goto('http://localhost:8081/dashboard', { waitUntil: 'networkidle0', timeout: 30000 });
  let rootText = await page.evaluate(() => document.getElementById('root').innerText);
  if (rootText.includes('Dashboard Debug')) {
    console.log('   ✅ /dashboard works');
  } else {
    console.log('   ❌ /dashboard failed');
  }

  // Test list
  console.log('\n2. Testing /list ...');
  await page.goto('http://localhost:8081/list', { waitUntil: 'networkidle0', timeout: 30000 });
  rootText = await page.evaluate(() => document.getElementById('root').innerText);
  if (rootText.includes('TAB LIST:')) {
    console.log('   ✅ /list works');
  } else {
    console.log('   ❌ /list failed');
  }

  // Test add
  console.log('\n3. Testing /add ...');
  await page.goto('http://localhost:8081/add', { waitUntil: 'networkidle0', timeout: 30000 });
  rootText = await page.evaluate(() => document.getElementById('root').innerText);
  if (rootText.includes('TAB ADD:')) {
    console.log('   ✅ /add works');
  } else {
    console.log('   ❌ /add failed');
  }

  // Test reports
  console.log('\n4. Testing /reports ...');
  await page.goto('http://localhost:8081/reports', { waitUntil: 'networkidle0', timeout: 30000 });
  rootText = await page.evaluate(() => document.getElementById('root').innerText);
  if (rootText.includes('TAB REPORTS:')) {
    console.log('   ✅ /reports works');
  } else {
    console.log('   ❌ /reports failed');
  }

  // Test settings
  console.log('\n5. Testing /settings ...');
  await page.goto('http://localhost:8081/settings', { waitUntil: 'networkidle0', timeout: 30000 });
  rootText = await page.evaluate(() => document.getElementById('root').innerText);
  if (rootText.includes('TAB SETTINGS:')) {
    console.log('   ✅ /settings works');
  } else {
    console.log('   ❌ /settings failed');
  }

  // Test other routes
  console.log('\n6. Testing /test ...');
  await page.goto('http://localhost:8081/test', { waitUntil: 'networkidle0', timeout: 30000 });
  rootText = await page.evaluate(() => document.getElementById('root').innerText);
  if (rootText.includes('Test Screen')) {
    console.log('   ✅ /test works');
  } else {
    console.log('   ❌ /test failed');
  }

  console.log('\n✅ All tests completed!');
  await browser.close();
})();