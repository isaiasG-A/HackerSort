// EDIT THIS FILE TO COMPLETE ASSIGNMENT QUESTION 1
const { chromium } = require("playwright");

async function sortHackerNewsArticles() {
  // launch browser
  const browser = await chromium.launch({ headless: true }); //headless mode is used for automation.
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
 // go to Hacker News
 await page.goto("https://news.ycombinator.com/newest");
 
 //Extracting articles
 const articles = await page.$$eval(".athing", (nodes) => {
  return nodes.map((node) => ({
    id: parseInt(node.getAttribute("id"), 10), //ids will be used to check sorting.
  }))
 });

 //Validation of number of articles.
 if(articles.length !== 100) {
  throw new Error(`Expected 100 articles, but found ${articles.length}`);
 }

 console.log("100 articles were found");

 //Validation of sorting.
const ids = articles.map((article) => article.id);
const sortedIds = [...ids].sort((a, b) => a - b); //Sorting ids in descending order.

if(JSON.stringify(ids) !== JSON.stringify(sortedIds)) {
  throw new Error("Articles are not sorted from newest to oldest");
}
 console.log("Articles are sorted from newest to oldest");
} catch (error) {
    console.error("Validation error", error);
} finally {
    await browser.close();
    return;
  }
}

(async () => {
  await sortHackerNewsArticles();
})();
