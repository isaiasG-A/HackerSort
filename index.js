const { chromium } = require("playwright");
const _ = require("lodash");

async function sortHackerNewsArticles() {
  let browser = await chromium.launch({ headless: false });
  let context = await browser.newContext();
  let page = await context.newPage();

  async function restartBrowser() {
    console.log("Restarting browser...");
    if (browser && browser.isConnected()) await browser.close();
    browser = await chromium.launch({ headless: false});
    context = await browser.newContext();
    page = await context.newPage();
    await page.goto("https://news.ycombinator.com/newest", { timeout: 60000 });
  }

  try {
    await page.goto("https://news.ycombinator.com/newest", { timeout: 60000 });

    let articles = [];
    let totalRetries = 3;

    while (articles.length < 100 && totalRetries > 0) {
      try {
        if (!page.isClosed()) {
          console.log("Fetching articles...");
          const newArticles = await page.$$eval(".athing", (nodes) =>
            nodes.map((node) => ({
              id: parseInt(node.getAttribute("id")),
            }))
          );
          console.log(`Fetched ${newArticles.length} articles from the current page.`);
          //articles = articles.concat(newArticles);
          articles = _.uniqBy([...articles, ...newArticles], "id");
    
          if (articles.length < 100) {
            const link = await page.$("a.morelink");
            if (link) {
              await link.scrollIntoViewIfNeeded(); // Ensure link is visible
              await page.waitForSelector("a.morelink", { state: "visible" }); // Confirm visibility
    
              console.log("Found 'More' link. Clicking...");
              const currentURL = page.url();
              await link.click();
    
              await page.waitForLoadState("networkidle"); // Wait for network requests
              const newURL = page.url();
              console.log("URL after click:", newURL);
    
              if (currentURL === newURL) {
                throw new Error("Pagination failed: URL did not change.");
              }
    
              await page.waitForSelector(".athing", { timeout: 10000 }); // Wait for new articles
              console.log("Navigation to next page successful.");
            } else {
              console.warn("No 'More' link found. Exiting pagination.");
              break;
            }
          }
        } else {
          console.warn("Page is closed. Restarting...");
          await restartBrowser();
        }
      } catch (err) {
        totalRetries--;
        console.warn("Retrying after failure, attempts left:", totalRetries);
        if (totalRetries === 0) {
          throw new Error("Max retries reached. Exiting.");
        }
        await restartBrowser();
      }
    }

    articles = articles.slice(0, 100);

    if (articles.length !== 100) {
      throw new Error(`100 articles were not found. Found: ${articles.length}`);
    }
    console.log("100 articles found");

    const ids = articles.map((article) => article.id);
    const sortedIds = _.sortBy(ids).reverse();

    if (!_.isEqual(ids, sortedIds)) {
      throw new Error("Articles are not sorted in the right order: From newest to oldest");
    }

    console.log("Articles are sorted correctly");
  } catch (error) {
    console.error("Validation error:", error.message);
  } finally {
    console.log("Browser will remain open.");
    // Browser not closed to allow further inspection
  }
}

(async () => {
  await sortHackerNewsArticles();
})();