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

## Deploy with Vercel

The GitHub Actions workflow runs only when a version tag matching `v*` is pushed (for example, `v1.0.0`); ordinary branch pushes and manual workflow runs do not deploy. It builds and deploys that version to Vercel production, then creates a GitHub Release for the tag and attaches `Expense-Manager-vercel-output.zip`, containing the exact Vercel build output used for that deployment. The `publish-release` job creates the GitHub Release and attaches the artifact; it does not deploy to Vercel.

Vercel can also deploy commits directly through its Git integration, independently of GitHub Actions. Disable automatic Git deployments in the Vercel project settings if all deployments must happen only through this tag-triggered workflow.

Vercel's GitHub integration does not expose its deployment credentials to GitHub Actions. Add these repository Actions secrets before using the workflow:

- `VERCEL_TOKEN`: a Vercel access token with access to the project.
- `VERCEL_ORG_ID`: the Vercel team or account ID.
- `VERCEL_PROJECT_ID`: the Vercel project ID for this app.

Find the organization and project IDs in the linked Vercel project's `.vercel/project.json` after running `vercel link` locally. Do not commit that file or the access token.

## Account sync setup

Create a Supabase project, enable email/password sign-in, and run [`supabase/schema.sql`](./supabase/schema.sql) in its SQL Editor. In **Authentication → URL Configuration**, set the Site URL to `https://expensemanager-weld.vercel.app` and add any local development URL you use to the allowed redirect URLs. The schema creates a per-user JSON data row protected by row-level security. Never put a Supabase service-role key in this app; the browser uses only the project URL and anon/publishable key, and database policies restrict each account to its own row.

For local use, copy [`supabase-config.example.js`](./supabase-config.example.js) to `supabase-config.js` and set the project URL and anon/publishable key. `supabase-config.js` is ignored by Git.

For tagged-release deployment, add these repository Actions secrets in addition to the Vercel secrets:

- `SUPABASE_URL`: the project URL from Supabase **Project Settings → API**.
- `SUPABASE_ANON_KEY`: the anon/publishable key from the same page. This browser key is public by design; never use the service-role key.

On first login, if the account has no cloud data yet, existing browser data is imported to that account. After the first successful cloud save, the old shared local data keys are removed; future local caches are separated by authenticated user ID. Create an account with an email and password, confirm the email if Supabase requests it, then log in on each device with that same account.

## Data and limitations

Records sync through the configured Supabase project and are also cached in the current browser's `localStorage`. Each save uploads the signed-in account's full data snapshot, so avoid editing the same account simultaneously on multiple devices; the most recent save replaces that snapshot. Supabase and email provider availability affect sign-in and sync. The initial entries are sample data. Do not enter bank credentials, full account numbers, or other highly sensitive information.

This is not connected to a bank and does not provide automatic SMS access or bank statement import. See [AGENT.md](./AGENT.md) for project development and privacy guidelines.
