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

1. Create a Firebase project in the [Firebase console](https://console.firebase.google.com/).
2. Add a **Web app** to the project and copy its Firebase config object (`apiKey`, `authDomain`, `projectId`, `appId`, and any other fields).
3. In **Authentication → Sign-in method**, enable **Google** and choose a support email. In **Authentication → Settings → Authorized domains**, add `expensemanager-weld.vercel.app` and `localhost` for local development.
4. Create a **Cloud Firestore** database, then publish [`firestore.rules`](./firestore.rules). These rules protect workspaces, member records, invitations, and shared data.
5. For local development, copy [`firebase-config.example.js`](./firebase-config.example.js) to `firebase-config.js` and replace the example values with your Firebase web config. `firebase-config.js` is ignored by Git.
6. For tagged-release deployment, add a GitHub Actions repository secret named `FIREBASE_CONFIG_JSON` containing the Firebase config object as JSON. The workflow writes it to the ignored `firebase-config.js` before building. Add this alongside the Vercel secrets.
7. Select **Continue with Google** and choose your Google account. The first sign-in creates your workspace; use that same Google account on each device.
8. In the app, the workspace owner selects **Invite** and enters the collaborator's Google account email. Expense Manager does not send email; share the app link and ask them to sign in with that Google account. The pending invitation is accepted automatically at sign-in. Members can view and edit all shared workspace data.

Firebase web configuration is intended for browser apps; it is not a password or admin credential. Never include a Firebase service-account private key in this app. Firestore rules restrict shared data to workspace members; only workspace owners can invite additional members.

On first login, the workspace owner’s existing Firestore account data is copied into the new workspace. If no cloud data exists, the owner’s existing browser data is used and saved to the workspace. A collaborator who accepts an invitation is switched to the invited shared workspace. Their previous personal workspace is not deleted, but this app does not yet provide a workspace switcher.

## Data and limitations

Records sync through the configured Firebase project and are also cached in the current browser's `localStorage`. Each save uploads the full shared workspace snapshot. Simultaneous edits by multiple members can overwrite each other; the most recent save replaces the snapshot, so coordinate concurrent editing. Firebase availability affects sign-in and sync. The initial entries are sample data. Do not enter bank credentials, full account numbers, or other highly sensitive information.

This is not connected to a bank and does not provide automatic SMS access or bank statement import. See [AGENT.md](./AGENT.md) for project development and privacy guidelines.
