const puppeteer = require('puppeteer');

async function run() {
  console.log('Starting debug...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Capture console logs
    page.on('console', msg => {
      console.log(`[Browser Console ${msg.type()}] ${msg.text()}`);
    });
    
    // Capture page errors
    page.on('pageerror', error => {
      console.log(`[Page Error] ${error.message}`);
    });
    
    // Capture request failures
    page.on('requestfailed', request => {
      console.log(`[Request Failed] ${request.url()} ${request.failure().errorText}`);
    });
    
    console.log('Navigating to http://localhost:8081...');
    await page.goto('http://localhost:8081', { waitUntil: 'networkidle0', timeout: 30000 });
    
    console.log('Page loaded, checking content...');
    
    // Check if root has children
    const rootContent = await page.evaluate(() => {
      const root = document.getElementById('root');
      return {
        hasChildren: root?.children?.length > 0,
        html: root?.innerHTML,
        computedStyle: window.getComputedStyle(root)
      };
    });
    
    console.log('Root element:', rootContent);
    
    // Wait a bit for React to render
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check again
    const rootContentAfter = await page.evaluate(() => {
      const root = document.getElementById('root');
      return {
        hasChildren: root?.children?.length > 0,
        html: root?.innerHTML,
        textContent: root?.textContent
      };
    });
    
    console.log('Root element after 2s:', rootContentAfter);
    
    // Take a screenshot
    await page.screenshot({ path: 'debug_screenshot.png', fullPage: true });
    console.log('Screenshot saved to debug_screenshot.png');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
    console.log('Browser closed');
  }
}

run().catch(console.error);