import { MailtrapClient } from "mailtrap";
import { logStep, logError, logDebug } from "./logger";

const MAILTRAP_API_TOKEN = process.env.MAILTRAP_API_TOKEN!;
const MAILTRAP_INBOX_ID = Number(process.env.MAILTRAP_INBOX_ID!);
const MAILTRAP_ACCOUNT_ID = Number(process.env.MAILTRAP_ACCOUNT_ID!);

const client = new MailtrapClient({
  token: MAILTRAP_API_TOKEN,
  testInboxId: MAILTRAP_INBOX_ID,
  accountId: MAILTRAP_ACCOUNT_ID,
});

/**
 * Fetches the latest email from the Mailtrap inbox using the SDK.
 * Throws if no email is found.
 */
export async function getLatestMail() {
  logDebug("Fetching latest email from Mailtrap");

  const messagesClient = client.testing.messages;
  const messages = await messagesClient.get(MAILTRAP_INBOX_ID);

  logDebug("Retrieved messages from Mailtrap", {
    count: messages?.length || 0,
  });

  if (!messages || messages.length === 0) {
    logError("No email found in Mailtrap inbox");
    throw new Error("No email found in Mailtrap inbox");
  }

  logDebug("Returning latest message", { messageId: messages[0].id });
  return messages[0];
}

/**
 * Decodes HTML entities in a string (specifically &amp; to &).
 */
function decodeHtmlEntities(str: string) {
  return str.replace(/&amp;/g, "&");
}

/**
 * Extracts the confirmation link from an email sent to targetEmail (most recent first).
 * Looks specifically for a link with data-confirmation-link attribute.
 * If targetEmail is not provided, falls back to the absolute latest email in the inbox.
 * Throws if no link is found.
 */
export async function getConfirmationLink(targetEmail?: string) {
  logStep("Getting confirmation link from Mailtrap", { targetEmail });

  const messagesClient = client.testing.messages;
  const allMessages = await messagesClient.get(MAILTRAP_INBOX_ID);

  logDebug("Retrieved all messages from Mailtrap", {
    totalCount: allMessages?.length || 0,
    targetEmail,
  });

  if (!allMessages || allMessages.length === 0) {
    logError("No emails found in Mailtrap inbox");
    throw new Error("No emails found in Mailtrap inbox.");
  }

  let email: any; // Use any type, will refine based on actual object structure at runtime
  if (targetEmail) {
    logDebug("Filtering messages for target email", { targetEmail });

    const userMessages = allMessages.filter((msg: any) => {
      if (msg.to_email === targetEmail) return true;
      if (
        Array.isArray(msg.to) &&
        msg.to.some((recipient: any) => recipient.email === targetEmail)
      )
        return true;
      return false;
    });

    logDebug("Filtered messages for target email", {
      targetEmail,
      filteredCount: userMessages.length,
      totalCount: allMessages.length,
    });

    if (userMessages.length === 0) {
      logError(`No confirmation email found for target email`, {
        targetEmail,
        availableEmails: allMessages.map((msg: any) => ({
          id: msg.id,
          to_email: msg.to_email,
          to: msg.to,
          subject: msg.subject,
          created_at: msg.created_at,
        })),
      });
      throw new Error(
        `No confirmation email found for ${targetEmail} in Mailtrap inbox.`
      );
    }

    // Sort by ID descending to get the most recent message for that user
    email = userMessages.sort((a: any, b: any) => b.id - a.id)[0];
    logDebug("Selected most recent email for target user", {
      emailId: email.id,
      targetEmail,
      subject: email.subject,
    });
  } else {
    // Fallback to the absolute latest email if no targetEmail is provided
    email = allMessages.sort((a: any, b: any) => b.id - a.id)[0];
    logDebug("Selected latest email (no target specified)", {
      emailId: email.id,
      subject: email.subject,
    });
  }

  logDebug("Fetching HTML content for email", { emailId: email.id });
  const html = await client.testing.messages.getHtmlMessage(
    MAILTRAP_INBOX_ID,
    email.id
  );

  logDebug("Retrieved HTML content", {
    emailId: email.id,
    htmlLength: html.length,
    htmlPreview: html.substring(0, 200) + "...",
  });

  // Look for the confirmation link with data-confirmation-link attribute
  // Use a more flexible regex that can handle multi-line attributes
  const confirmationLinkMatch = html.match(
    /<a[^>]*data-confirmation-link[^>]*href="([^"]+)"|<a[^>]*href="([^"]+)"[^>]*data-confirmation-link/is
  );
  if (!confirmationLinkMatch) {
    logError(
      "No confirmation link with data-confirmation-link attribute found in email HTML",
      {
        emailId: email.id,
        targetEmail: targetEmail || "any user",
        htmlContent: html,
      }
    );
    throw new Error(
      "No confirmation link with data-confirmation-link attribute found in email for " +
        (targetEmail || "any user")
    );
  }

  // The href value could be in either capture group depending on attribute order
  const confirmationLink = decodeHtmlEntities(
    confirmationLinkMatch[1] || confirmationLinkMatch[2]
  );
  logStep("Successfully extracted confirmation link", {
    emailId: email.id,
    targetEmail,
    confirmationLink,
  });

  return confirmationLink;
}

/**
 * Extracts the reset password link from the latest email's HTML body.
 * Throws if no link is found.
 */
export async function getResetPasswordLink() {
  const email = await getLatestMail();
  const html = await client.testing.messages.getHtmlMessage(
    MAILTRAP_INBOX_ID,
    email.id
  );

  // Busca el <a> cuyo texto es "Reset Password"
  const match = html.match(
    /<a[^>]+href="([^"]+)"[^>]*>\s*Reset Password\s*<\/a>/i
  );
  if (!match) {
    throw new Error(
      "No reset password link found in email (button text: Reset Password)"
    );
  }
  return decodeHtmlEntities(match[1]);
}
