import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Capture page errors (e.g. ReferenceError)
  page.on('pageerror', error => {
    console.error('PAGE ERROR:', error.message);
    console.error(error.stack);
  });
  
  // Capture console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('CONSOLE ERROR:', msg.text());
    }
  });

  const routes = ['/', '/dashboard', '/discover', '/profile', '/matches', '/chats'];
  for (const route of routes) {
    try {
      await page.goto(`http://localhost:5173${route}`, { waitUntil: 'networkidle0' });
      console.log(`Route ${route} loaded successfully.`);
      // wait a bit
      await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      console.error(`GOTO ERROR on ${route}:`, err);
    }
  }

  await browser.close();
})();
