import { chromium } from "playwright";
import _ from "lodash";
import { assert } from "chai";

// Version 2.0: Modularized code version(Code broken down into smaller and reusable functions.)

//Function to restart th browser
async function restartBrowser(browser, context, page) {
  console.log("Restarting browser...");

  if(browser && browser.isConnected()) await browser.close();
  browser = await chromium.launch({ headless: false });
  context = await browser.newContext();
  page = await context.newPage();
  await page.goto("https://news.ycombinator.com/newest", { timeout: 60000 });
  return { browser, context, page };
}

//Function to fetch articles
async function fetchArticles(page, limit = 100) {
  let articles = [];
  while (articles.length < limit) {
    console.log("Fetching articles...");
    const newArticles = await page.$$eval(".athing", (nodes) => 
      nodes.map((node) => ({
        id: parseInt(node.getAttribute("id")),
      }))
    );
    console.log(`Fetched${newArticles.length} articles from the current page.`);
    articles = _.uniqBy([...articles, ...newArticles], "id");

    if(articles.length < limit) {
      const link = await page.$("a.morelink");
      if(!link) {
        console.warn("No 'More' links found. Existing pagination.");
        break;
      }
      await link.scrollIntoViewIfNeeded(); // Ensure link is visible
      await page.waitForSelector("a.morelink", {state: "visible"}); //confirm visibility
      console.log("Found 'More' link. Clicking...");
      const currentURL = page.url();
      await link.click();
      await page.waitForLoadState("networkidle"); // wait for network requests.
      const newURL = page.url();
      console.log("URL after click:", newURL);

      if(currentURL === newURL) {
        throw new Error("Pagination failed: URL did not change.");
      }

      await page.waitForSelector(".athing", { timeout: 1000 }); //Wait for new articles
    }
  }
  return articles.slice(0, limit);
}

//Function to validate sorting
function validateSorting(articles) {
  const ids = articles.map((article) => article.id);
  const sortedIds = _.sortBy(ids).reverse();

  //Assert number of articles
  assert.strictEqual(articles.length, 100, `Expected 100 articles, but found ${articles.length}`);
  console.log("100 articles were found");

  //Assert sorting
  assert.deepEqual(ids, sortedIds, "Articles are not sorted in the correct order: From newest to oldest");
  console.log("Articles are sorted correctly");
}

//Main function
async function sortHackerNewsArticles() {
  let browser, context, page;

  try {
    browser = await chromium.launch({ headless: false });
    context = await browser.newContext();
    page = await context.newPage();
    await page.goto("https://news.ycombinator.com/newest", { timeout: 60000 });

    //Fetch articles
    const articles = await fetchArticles(page);

    //Validate sorting
    validateSorting(articles);
  } catch (error) {
    console.log("Validation error:", error.message);
  } finally {
    //Browser not closed allow further inspection
    console.log("Browser will remain open.");
 
    /*
    console.log("Closing the browser...");
    if (browser) await browser.closed();
  */ 
  }
}

//Run the main function
(async () => {
  await sortHackerNewsArticles();
})();






//Version 1.0: Initial code structure

/* 

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
  
    //Assert number of articles
    assert.strictEqual(
      articles.length,
      100,
      `Expected 100 articles, but found ${articles.length}`
    );
    console.log("100 articles were found");

    //Extract and sort IDs
    const ids = articles.map((article) => article.id);
    const sortedIds = _.sortBy(ids).reverse();

    //Assert sorting
    assert.deepEqual(ids, sortedIds, "Articles are not sorted in the correct order: From newest to oldest");
    console.log("Articles are sorted correctly");
} catch(error) {
  console.error("Validation error:", error.meesage);
} finally {
  console.log("Browser will remain open.");
  //Browser not closed allow further inspection
 }
}
(async () => {
  await sortHackerNewsArticles();
})();

*/