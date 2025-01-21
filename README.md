
Project Name: HackerSort

Overview:

HackerSort is a browser automation project designed to fetch, process, and validate articles from Hacker News’ “newest” section. Built with Playwright for browser automation, Lodash for efficient data manipulation, and Chai for assertion testing, this project demonstrates robust web scraping and data validation techniques. The primary goal is to collect 100 articles, ensure their uniqueness, and validate that they are sorted from newest to oldest based on their unique IDs.

Features:
	1.	Automated Article Fetching:
	•	Navigates through Hacker News’ “newest” section using pagination.
	•	Dynamically fetches article metadata (IDs) from multiple pages.
	2.	Data Processing with Lodash:
	•	Ensures articles are unique using Lodash’s uniqBy.
	•	Efficiently sorts article IDs in descending order for validation.
	3.	Robust Validation with Chai:
	•	Confirms that exactly 100 articles are fetched.
	•	Verifies that articles are sorted from newest to oldest.
	4.	Error Handling:
	•	Handles unexpected browser closures or page load issues.
	•	Includes a modularized restartBrowser function for recovery during failures.
	5.	Modular Design:
	•	Code is broken into reusable functions for better readability and maintainability:
	•	fetchArticles: Handles pagination and data collection.
	•	validateSorting: Ensures sorting and data integrity.
	•	restartBrowser: Recovers from browser-related errors.

 Tech Stack:
	•	Playwright: Automates browser interactions such as navigation, element selection, and clicking.
	•	Lodash: Simplifies data manipulation tasks like sorting and removing duplicates.
	•	Chai: Provides robust assertion capabilities to validate results and ensure reliability.

 Usage:

Run the project using Node.js:

node index.js

