# Expense Manager project guidelines

## Product and architecture

- Expense Manager is a single-page, installable PWA implemented with plain HTML, CSS, and JavaScript in `index.html`; `sw.js` caches the app shell.
- The app is local-first: transactions, budgets, savings goals, and investment data are stored in browser `localStorage`. The local demo sign-in is only a session UI gate; there is no server, real user authentication, cloud sync, or multi-user access.
- Treat the current sample transactions, budgets, goals, and assets as demo data, not a connected financial account.
- Keep changes compatible with this static architecture unless the user explicitly requests a migration. Do not add Next.js, Supabase, credentials, or backend services as assumptions.

## Financial data and privacy

- Format money as INR using `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 })`; keep calendar dates in local time and financial years from April 1 through March 31.
- Escape user-provided text before inserting it into HTML. Protect CSV exports against spreadsheet formula injection.
- `localStorage` is not encrypted or shared across devices. Do not store bank credentials, full account numbers, authentication secrets, or raw bank messages.
- Browsers do not provide general access to a user's SMS inbox. Do not claim automatic SMS reading or that SMS content is uploaded or parsed.
- Do not represent the local app as supporting secure multi-user groups, real bank-account aggregation, statement imports, or cloud backup. These require separately designed integrations and security controls.

## Existing functionality

- A local demo sign-in screen gates the UI for the current browser tab session. It is not authentication and does not protect stored data.
- The dashboard summarizes demo/local transactions, budgets, goals, and investments.
- Transactions can be added, edited, deleted, searched, and filtered by type and date. Edit/delete controls are available on each transaction row. Savings and investment transaction edits keep app-created goal/portfolio effects in sync; legacy sample records without linked effects remain independent.
- Savings goals and investment portfolio items can be edited or deleted from their respective views. Investment edits also update a linked contribution record when one exists.
- Reports can be filtered by date range or Indian financial year, exported as CSV, and printed/saved as PDF through the browser.
- The Month picker applies to the dashboard and budget view. Category budgets are stored independently for each month; selecting a month without a plan copies the latest earlier plan so it can be reviewed and edited. The budget page shows monthly spending against plan and the selected month's Indian financial-year totals.
- Monthly category amounts are edited individually through the budget-page edit control. The yearly financial-year limit remains a separate setting. Savings goals and investment entries are also local-only.
- Selecting a payment method is not bank-account management; no actual bank balances are connected.

## Implementation conventions

- Keep the project dependency-free and preserve the static PWA unless a requirement makes a framework or library necessary.
- Use semantic HTML, accessible labels, visible keyboard focus, and the existing responsive styles.
- Keep local data schemas backward-compatible where practical; existing stored data may not have newer optional fields such as transaction notes.
- Surface storage and input failures rather than silently reporting success.
- When changing the precached app-shell assets, update the service-worker cache version in `sw.js`.

## Validation

- There is no package manifest or configured test runner. At minimum, validate the inline JavaScript syntax after changes:

  ```sh
  node -e 'const fs=require("fs");const h=fs.readFileSync("index.html","utf8");const scripts=[...h.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]).filter(s=>s.trim());if(scripts.length!==1)throw Error(`Expected one inline script, got ${scripts.length}`);new Function(scripts[0]);console.log("Inline JavaScript syntax OK")'
  ```

- For behavior changes, serve the folder over HTTP and verify the affected flow in a browser, including persistence after reload and a narrow mobile viewport.
