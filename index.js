import { chromium } from "playwright"; //Playwright for browser automation
import _ from "lodash"; //Lodash for utility functions like sorting and removing duplicates.
import { assert } from "chai"; //Chai for assertions to validate results.

// Version 2.0: Modularized code version(Code broken down into smaller and reusable functions.)

//Function to restart th browser in case of errors or unexcpected closures.
async function restartBrowser(browser, context, page) {
  console.log("Restarting browser...");

  if(browser && browser.isConnected()) await browser.close(); //Close exisitng browser.
  browser = await chromium.launch({ headless: false }); //Launch a new browser instance.
  context = await browser.newContext(); //Create a new browser context.
  page = await context.newPage(); //Open a new tab.
  await page.goto("https://news.ycombinator.com/newest", { timeout: 60000 }); //Navigate to hacker news.
  return { browser, context, page }; //Return updated browser, context, and page.
}

//Function to fetch articles from Hacker News with pagination support
async function fetchArticles(page, limit = 100) {
  let articles = []; //Initialize an empty for articles.
  while (articles.length < limit) {
    console.log("Fetching articles...");
    const newArticles = await page.$$eval(".athing", (nodes) => 
      nodes.map((node) => ({
        id: parseInt(node.getAttribute("id")), //Extract the unique article ID.
      }))
    );
    console.log(`Fetched${newArticles.length} articles from the current page.`);
    
    //Merge new articles and ensure uniqueness using Lodash's uniqBy 
    articles = _.uniqBy([...articles, ...newArticles], "id");
 
    //if fewer than 100 articles, navigate to the next page.
    if(articles.length < limit) {
      const link = await page.$("a.morelink"); // Find the "More" link
      if(!link) {
        console.warn("No 'More' links found. Existing pagination.");
        break; // Exit if no more pages are available.
      }

      //Ensure the "More" link is visible and clickable 
      await link.scrollIntoViewIfNeeded();
      await page.waitForSelector("a.morelink", {state: "visible"}); //confirm visibility.
      console.log("Found 'More' link. Clicking...");
      const currentURL = page.url(); //Get current page URL.
      await link.click(); // Click the "More" link.
      await page.waitForLoadState("networkidle"); // wait for network activity to finish.
      const newURL = page.url(); //Get new page URL.
      console.log("URL after click:", newURL);

      // Validate that the URL has changed after clicking.
      if(currentURL === newURL) {
        throw new Error("Pagination failed: URL did not change.");
      }

      //Wait for new articles to load.
      await page.waitForSelector(".athing", { timeout: 1000 }); 
    }
  }
  return articles.slice(0, limit); //return exactly the number of articles requested.
}

//Function to validate sorting of articles.
function validateSorting(articles) {
  const ids = articles.map((article) => article.id); //Extract IDs.
  const sortedIds = _.sortBy(ids).reverse(); // Sort IDs in descending order.

  //Assert the number of articles.
  assert.strictEqual(articles.length, 100, `Expected 100 articles, but found ${articles.length}`);
  console.log("100 articles were found");

  //Assert the articles are sorted correclty.
  assert.deepEqual(ids, sortedIds, "Articles are not sorted in the correct order: From newest to oldest");
  console.log("Articles are sorted correctly");
}

//Main function to direct fetching and validation.
async function sortHackerNewsArticles() {
  let browser, context, page;

  try {
    //Launch browser and navigate to Hacker News.
    browser = await chromium.launch({ headless: false });
    context = await browser.newContext();
    page = await context.newPage();
    await page.goto("https://news.ycombinator.com/newest", { timeout: 60000 });

    //Fetch articles.
    const articles = await fetchArticles(page);

    //Validate sorting.
    validateSorting(articles);
  } catch (error) {
    //Handle any validation or runtime errors.
    console.log("Validation error:", error.message);
  } finally {
    //Keep the browser open for further inspection.
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