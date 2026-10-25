# Expense Manager

Expense Manager is a static, installable PWA for tracking sample transactions, month-by-month category budgets, a yearly limit, savings goals, and investment entries in INR. Transaction reports support Indian financial-year and custom date filters, CSV export, and browser print-to-PDF.

## Monthly budgets

Use the **Month** picker in the top bar to change the month shown on the dashboard and budget page. Open **Your budget plan** to see actual spending against each category limit. Select **Edit** beside a category to change that amount directly, or use the sliders button to edit all category amounts together. Choose **Plan next month** to create the following month's plan; a month without a plan starts with a copy of the latest earlier plan, which you can change without changing the other months. The yearly limit and FY totals are shown separately.

On any transaction row, choose **Edit** or **Delete** to change an existing transaction. Savings goals and portfolio items also have edit/delete controls on their respective pages.

## Run locally

Serve the project over HTTP so the service worker can register:

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Data and limitations

This is a local-only prototype. Records are saved in the current browser's `localStorage` and are not encrypted, backed up, synchronized, or linked to a bank. The initial entries are sample data. Do not enter bank credentials, full account numbers, or other highly sensitive information.

The app opens with a local demo sign-in screen. Continuing only hides the screen for the current browser tab session; there are no accounts, passwords, or secure access controls, and anyone with access to the browser can access its saved data. There is no multi-user sharing, connected bank-account balance, automatic SMS access, bank statement import, or cloud service. See [AGENT.md](./AGENT.md) for project development and privacy guidelines.
