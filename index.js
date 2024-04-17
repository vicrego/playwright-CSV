// EDIT THIS FILE TO COMPLETE ASSIGNMENT QUESTION 1
const { chromium } = require("playwright");
const os = require('os');
const path = require('path');


async function saveHackerNewsArticles() {
  // launch browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // go to Hacker News
  await page.goto("https://news.ycombinator.com");

  // Asynchronously locate all anchor children of titleline class
  const urlLocator = page.locator('.titleline > a');

  // Awaits promise from urlLocator
  const urlElements = await urlLocator.all();

  // Extract text and url into an array
  const titleUrlPairs = [];
  let count = 0;
  for (let i = 0; i < urlElements.length; i++) {
    count++;
    if(count <= 10){
      const title = await urlElements[i].textContent();
      const url = await urlElements[i].getAttribute('href');
      titleUrlPairs.push({ title, url });
    }
  }

  // Format data as CSV
  const csvContent = `Title,URL\n${titleUrlPairs.map(entry => `"${entry.title.replace(/"/g, '""')}",${entry.url}`).join('\n')}`;
  const csvDataUrl = `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`;
  
  // Trigger download on plawright context
  await page.evaluate((csvDataUrl) => {
    // Mocks a downloadable tag and click
    const anchor = document.createElement('a');
    anchor.href = csvDataUrl;
    anchor.download = 'victor_baptista_task.csv';
    anchor.click();
  }, csvDataUrl);

  // Uses playwright's context download to actual download on Download's folder
  const download = await page.waitForEvent('download');
  const downloadsPath = path.join(os.homedir(), 'Downloads');
  const filePath = path.join(downloadsPath, 'victor_baptista_task.csv');
  await download.saveAs(filePath);
  await browser.close();  
}

(async () => {
  await saveHackerNewsArticles();
})();

