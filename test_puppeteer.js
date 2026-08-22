const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('response', response => {
    if (response.url().includes('/login')) {
      console.log('RESPONSE:', response.status(), response.url());
    }
  });

  await page.goto('http://localhost:3000/login');
  console.log('Page loaded');
  
  // Click the Google button
  const [googleBtn] = await page.$x("//button[contains(., 'Continue with Google')]");
  if (googleBtn) {
    console.log('Clicking Google button...');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 5000 }).catch(e => console.log('Navigation timeout')),
      googleBtn.click()
    ]);
    console.log('Clicked and waited');
    console.log('Current URL:', page.url());
  } else {
    console.log('Google button not found');
  }

  await browser.close();
})();
