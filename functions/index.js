const { getFirestore } = require("firebase-admin/firestore");
const { initializeApp } = require("firebase-admin/app");
const { defineSecret, defineString } = require("firebase-functions/params");
const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const logger = require("firebase-functions/logger");

initializeApp();

const resendApiKey = defineSecret("RESEND_API_KEY");
const inviteFromEmail = defineString("INVITE_FROM_EMAIL");
const appUrl = defineString("APP_URL");

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

exports.sendWorkspaceInvite = onDocumentWritten({
  document: "workspace_invites/{emailKey}",
  secrets: [resendApiKey],
  retry: true,
}, async (event) => {
  const invitationSnapshot = event.data?.after;
  if (!invitationSnapshot?.exists) return;

  const invitation = invitationSnapshot.data();
  const recipient = invitation.email;
  if (typeof recipient !== "string" || recipient !== event.params.emailKey
    || typeof invitation.workspaceId !== "string") {
    throw new Error("Workspace invitation has invalid recipient or workspace data.");
  }

  const workspaceSnapshot = await getFirestore()
    .collection("workspaces")
    .doc(invitation.workspaceId)
    .get();
  if (!workspaceSnapshot.exists) {
    throw new Error(`Workspace ${invitation.workspaceId} does not exist.`);
  }

  const appLink = new URL(appUrl.value());
  if (appLink.protocol !== "https:" && appLink.hostname !== "localhost") {
    throw new Error("APP_URL must use HTTPS, except for localhost.");
  }
  const workspaceName = workspaceSnapshot.data().name || "a shared workspace";
  const escapedWorkspaceName = escapeHtml(workspaceName);
  const escapedAppLink = escapeHtml(appLink.href);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey.value()}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `workspace-invite-${event.id}`,
    },
    body: JSON.stringify({
      from: inviteFromEmail.value(),
      to: [recipient],
      subject: "You're invited to join a workspace on Expense Manager",
      html: `<p>You have been invited to join <strong>${escapedWorkspaceName}</strong> on Expense Manager.</p><p><a href="${escapedAppLink}">Open Expense Manager</a> and sign in with this email address to join the shared workspace.</p>`,
      text: `You have been invited to join ${workspaceName} on Expense Manager. Open ${appLink.href} and sign in with this email address to join the shared workspace.`,
    }),
  });

  if (!response.ok) {
    logger.error("Resend rejected a workspace invitation", {
      eventId: event.id,
      status: response.status,
    });
    throw new Error(`Invitation email delivery failed with status ${response.status}.`);
  }

  logger.info("Workspace invitation email sent", {
    eventId: event.id,
  });
});
