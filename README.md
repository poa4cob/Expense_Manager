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

The GitHub Actions workflow runs a Vercel production-target build on every branch push. These branch builds do not publish releases or deploy to production. When a version tag matching `v*` is pushed (for example, `v1.0.0`), the workflow builds that tagged version, publishes the GitHub Release with `Expense-Manager-vercel-output.zip`, and only then deploys that same build to Vercel production. If release publishing fails, deployment does not run. If the later Vercel deployment fails, the GitHub Release will exist but the production site will remain on its previous deployment.

Vercel's Git integration deploys independently of GitHub Actions and does not wait for the release job. To ensure the production URL changes only after the tagged release has been published, disconnect the Git repository in the Vercel project under **Settings → Git**. The GitHub Actions workflow continues to deploy through the Vercel CLI using the credentials below; disconnecting Git does not disable those CLI deployments.

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

If sign-in reports `auth/api-key-not-valid`, copy the `apiKey` from the Firebase project's **Project settings → General → Your apps → Web app** config. For a deployed release, replace the GitHub Actions `FIREBASE_CONFIG_JSON` secret with that complete valid JSON object, then create and push a new `v*` tag; the deployed site's config is generated during the tagged build. For local use, update the ignored `firebase-config.js` and reload. Also check in Google Cloud Console that the API key belongs to the same Firebase project and that any key restrictions allow Firebase Authentication and requests from your Vercel domain. Never paste a service-account key here.

If sign-in reports `auth/configuration-not-found`, enable **Google** under **Firebase Console → Authentication → Sign-in method** and select a support email. Confirm the app's `projectId`, `authDomain`, and `apiKey` all come from that same Firebase project's Web app configuration. If the error is `auth/unauthorized-domain`, add the site's hostname under **Authentication → Settings → Authorized domains**.

Firebase web configuration is intended for browser apps; it is not a password or admin credential. Never include a Firebase service-account private key in this app. Firestore rules restrict shared data to workspace members; only workspace owners can invite additional members.

On first login, the workspace owner’s existing Firestore account data is copied into the new workspace. If no cloud data exists, the owner’s existing browser data is used and saved to the workspace. A collaborator who accepts an invitation is switched to the invited shared workspace. Their previous personal workspace is not deleted, but this app does not yet provide a workspace switcher.

## Data and limitations

Records sync through the configured Firebase project and are also cached in the current browser's `localStorage`. Each save uploads the full shared workspace snapshot. Simultaneous edits by multiple members can overwrite each other; the most recent save replaces the snapshot, so coordinate concurrent editing. Firebase availability affects sign-in and sync. The initial entries are sample data. Do not enter bank credentials, full account numbers, or other highly sensitive information.

This is not connected to a bank and does not provide automatic SMS access or bank statement import. See [AGENT.md](./AGENT.md) for project development and privacy guidelines.
