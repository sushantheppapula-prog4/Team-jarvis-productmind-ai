const puppeteer = require('puppeteer-core');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ 
    executablePath: '/root/.cache/puppeteer/chrome-headless-shell/linux-151.0.7922.47/chrome-headless-shell-linux64/chrome-headless-shell',
    args: ['--no-sandbox'] 
  });
  const page = await browser.newPage();
  
  page.on('response', response => {
    if (response.url().includes('/login')) {
      console.log('RESPONSE:', response.status(), response.url());
      console.log('HEADERS:', response.headers());
    }
  });
  
  await page.goto('http://localhost:3000/login');
  
  const [btn] = await page.$x("//button[contains(., 'Continue with Google')]");
  if (btn) {
    console.log('Clicking...');
    await btn.click();
    await new Promise(r => setTimeout(r, 2000));
    console.log('Final URL:', page.url());
  } else {
    console.log('Button not found');
  }

  await browser.close();
})();
