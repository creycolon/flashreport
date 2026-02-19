const { JSDOM } = require('jsdom');

async function testRoute(route) {
  console.log(`\n=== Testing /${route} ===`);
  const url = `http://localhost:8081/${route}`;
  const html = await fetch(url).then(r => r.text());
  const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    resources: 'usable',
    url
  });

  const window = dom.window;
  const document = window.document;

  const errors = [];
  window.console.error = (...args) => {
    errors.push(args.join(' '));
    console.error(`[BROWSER ERROR] ${route}:`, ...args);
  };
  window.onerror = (message, source, lineno, colno, error) => {
    errors.push(`${message} at ${source}:${lineno}:${colno}`);
    console.error(`[BROWSER ONERROR] ${route}:`, message, source, lineno, colno, error);
  };

  // Wait for scripts to load
  await new Promise(resolve => {
    window.addEventListener('load', resolve);
    setTimeout(resolve, 5000);
  });

  // Wait a bit more for React to mount
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Check for any React root or content
  const root = document.getElementById('root');
  const bodyText = document.body.innerText;
  console.log(`Body text length: ${bodyText.length}`);
  if (bodyText.includes('Error') && bodyText.includes('useTheme')) {
    console.error(`Theme error detected on ${route}`);
    errors.push('Theme error');
  }

  // Close window
  dom.window.close();

  return { errors, bodyText };
}

async function main() {
  const routes = ['dashboard', 'list', 'add', 'reports', 'settings'];
  let totalErrors = 0;
  for (const route of routes) {
    const result = await testRoute(route);
    totalErrors += result.errors.length;
    console.log(`Errors on ${route}: ${result.errors.length}`);
  }
  console.log(`\n=== TOTAL ERRORS: ${totalErrors} ===`);
  if (totalErrors === 0) {
    console.log('SUCCESS: All routes loaded without console errors.');
  } else {
    console.log('FAIL: Some routes have errors.');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});