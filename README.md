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
4. Create a **Cloud Firestore** database, then publish [`firestore.rules`](./firestore.rules). These rules protect workspaces, member records, invitations, shared data, and read-only guest links. Deploy the rules with `firebase deploy --only firestore:rules` or publish them in the Firebase console.
5. For local development, copy [`firebase-config.example.js`](./firebase-config.example.js) to `firebase-config.js` and replace the example values with your Firebase web config. `firebase-config.js` is ignored by Git. Tagged deployment builds also embed this public web config as an inline fallback so the app can still initialize if that separate script fails to load.
6. For tagged-release deployment, add a GitHub Actions repository secret named `FIREBASE_CONFIG_JSON` containing the Firebase config object as JSON. The workflow writes it to the ignored `firebase-config.js` before building. Add this alongside the Vercel secrets.
7. Select **Continue with Google** and choose your Google account. The first sign-in creates your workspace; use that same Google account on each device.
8. To enable invitation emails, install and sign in to the Firebase CLI, select your Firebase project, and deploy the email function with `firebase deploy --only functions`. The project must have billing enabled for second-generation Cloud Functions. Create a [Resend](https://resend.com/) account and verify a sending domain. Configure `RESEND_API_KEY` as a Firebase Functions secret, then deploy:

   ```sh
   npm install --prefix functions
   npm install --global firebase-tools
   firebase login
   firebase use --add
   firebase functions:secrets:set RESEND_API_KEY
   firebase deploy --only firestore:rules,functions
   ```

   During deployment, Firebase prompts for `INVITE_FROM_EMAIL` and `APP_URL` if they are not set. Set `INVITE_FROM_EMAIL` to a sender address on your verified Resend domain and `APP_URL` to your deployed app's HTTPS URL. After deployment, the workspace owner can select **Invite** and enter the collaborator's Google account email. The email includes a link to the app; the invitee must sign in with that same email address to join the shared workspace. Members can view and edit all shared workspace data.

Workspace owners can also open **Profile → Manage guest link** to create a public, read-only link. Anyone with the URL can view the workspace's transactions, budgets, savings goals, and investments without signing in. The link is a bearer secret: share it only with trusted people, and use **Disable link** to revoke future access. Disabling cannot retract information already viewed or copied. Guests cannot edit the workspace. Publish the latest `firestore.rules` before enabling this feature; authenticated workspace members then keep the guest view updated automatically when they save changes.

If sign-in reports `auth/api-key-not-valid`, copy the `apiKey` from the Firebase project's **Project settings → General → Your apps → Web app** config. For a deployed release, replace the GitHub Actions `FIREBASE_CONFIG_JSON` secret with that complete valid JSON object, then create and push a new `v*` tag; the deployed site's config is generated during the tagged build. For local use, update the ignored `firebase-config.js` and reload. Also check in Google Cloud Console that the API key belongs to the same Firebase project and that any key restrictions allow Firebase Authentication and requests from your Vercel domain. Never paste a service-account key here.

If sign-in reports `auth/configuration-not-found`, enable **Google** under **Firebase Console → Authentication → Sign-in method** and select a support email. Confirm the app's `projectId`, `authDomain`, and `apiKey` all come from that same Firebase project's Web app configuration. If the error is `auth/unauthorized-domain`, add the site's hostname under **Authentication → Settings → Authorized domains**.

Firebase web configuration is intended for browser apps; it is not a password or admin credential. Never include a Firebase service-account private key in this app. Firestore rules restrict shared data to workspace members; only workspace owners can invite additional members.

On first login, the workspace owner’s existing Firestore account data is copied into the new workspace. If no cloud data exists, the owner’s existing browser data is used and saved to the workspace. A collaborator who accepts an invitation is switched to the invited shared workspace. Their previous personal workspace is not deleted, but this app does not yet provide a workspace switcher.

## Data and limitations

Records sync through the configured Firebase project and are also cached in the current browser's `localStorage`. Each save uploads the full shared workspace snapshot. Simultaneous edits by multiple members can overwrite each other; the most recent save replaces the snapshot, so coordinate concurrent editing. Firebase availability affects sign-in and sync. The initial entries are sample data. Do not enter bank credentials, full account numbers, or other highly sensitive information.

This is not connected to a bank and does not provide automatic SMS access or bank statement import. See [AGENT.md](./AGENT.md) for project development and privacy guidelines.
