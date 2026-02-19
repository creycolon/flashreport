const { JSDOM } = require('jsdom');

async function test() {
  console.log('Fetching HTML from http://localhost:8081 ...');
  const html = await fetch('http://localhost:8081').then(r => r.text());
  const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    resources: 'usable',
    url: 'http://localhost:8081'
  });

  const window = dom.window;
  const document = window.document;

  // Wait for scripts to load
  await new Promise(resolve => {
    window.addEventListener('load', resolve);
    setTimeout(resolve, 5000);
  });

  // Check for root element content
  const root = document.getElementById('root');
  console.log('Root element:', root ? 'found' : 'not found');
  if (root) {
    console.log('Root innerHTML length:', root.innerHTML.length);
    console.log('Root children:', root.children.length);
    Array.from(root.children).forEach((child, i) => {
      console.log(`Child ${i}:`, child.tagName, child.className);
    });
  }

  // Check console logs (we can capture console.log, error, etc.)
  const logs = [];
  window.console.log = (...args) => {
    logs.push(['log', ...args]);
    console.log('[BROWSER LOG]', ...args);
  };
  window.console.error = (...args) => {
    logs.push(['error', ...args]);
    console.error('[BROWSER ERROR]', ...args);
  };

  // Check for any errors in window.onerror
  window.onerror = (message, source, lineno, colno, error) => {
    console.error('[BROWSER ONERROR]', message, source, lineno, colno, error);
  };

  // Wait a bit more for React to mount
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Check if any React root has been rendered
  const reactRoot = root.querySelector('[data-reactroot]');
  console.log('React root element:', reactRoot ? 'found' : 'not found');

  // Output logs count
  console.log('Total console logs captured:', logs.length);

  dom.window.close();
}

test().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});