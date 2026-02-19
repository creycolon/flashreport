const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  // Capture console logs
  page.on('console', msg => {
    console.log(`[BROWSER ${msg.type()}]`, msg.text());
  });

  // Capture page errors
  page.on('pageerror', error => {
    console.error(`[PAGE ERROR]`, error.message);
  });

  // Capture request failures
  page.on('requestfailed', request => {
    console.error(`[REQUEST FAILED]`, request.failure().errorText, request.url());
  });

  console.log('Navigating to http://localhost:8081 ...');
  await page.goto('http://localhost:8081', { waitUntil: 'networkidle0', timeout: 30000 });

  // Wait for React to render
  await page.waitForSelector('#root', { timeout: 5000 });
  console.log('Root element found');

  // Check if root has children
  const rootChildren = await page.evaluate(() => {
    const root = document.getElementById('root');
    return root.children.length;
  });
  console.log(`Root children count: ${rootChildren}`);

  // Take a screenshot for debugging
  await page.screenshot({ path: '/tmp/expo_app_screenshot.png' });
  console.log('Screenshot saved to /tmp/expo_app_screenshot.png');

  // Get the inner text of root to see if any text appears
  const rootText = await page.evaluate(() => {
    const root = document.getElementById('root');
    return root.innerText;
  });
  console.log('Root inner text:', rootText);

  // Check for any error UI
  const errorText = await page.evaluate(() => {
    const errorEl = document.querySelector('[data-testid="error-boundary"]');
    return errorEl ? errorEl.innerText : 'No error boundary found';
  });
  console.log('Error boundary text:', errorText);

  await browser.close();
})();