import { MailtrapClient } from "mailtrap";

const MAILTRAP_API_TOKEN = process.env.MAILTRAP_API_TOKEN;
const MAILTRAP_INBOX_ID = Number(process.env.MAILTRAP_INBOX_ID);
const MAILTRAP_ACCOUNT_ID = Number(process.env.MAILTRAP_ACCOUNT_ID);

if (!MAILTRAP_API_TOKEN || !MAILTRAP_INBOX_ID || !MAILTRAP_ACCOUNT_ID) {
  throw new Error('Mailtrap environment variables are not set correctly.');
}

const client = new MailtrapClient({ token: MAILTRAP_API_TOKEN, testInboxId: MAILTRAP_INBOX_ID, accountId: MAILTRAP_ACCOUNT_ID });

/**
 * Fetches the latest email from the Mailtrap inbox using the SDK.
 * Throws if no email is found.
 */
export async function getLatestMail() {
  const messagesClient = client.testing.messages;
  const messages = await messagesClient.get(MAILTRAP_INBOX_ID);
  
  if (!messages || messages.length === 0) {
    throw new Error('No email found in Mailtrap inbox');
  }
  return messages[0];
}

function decodeHtmlEntities(str: string): string {
  return str.replace(/&amp;/g, '&');
}

/**
 * Extracts the first confirmation link from an email sent to `targetEmail` (most recent first).
 * If `targetEmail` is not provided, falls back to the absolute latest email in the inbox.
 * Throws if no link is found.
 */
export async function getConfirmationLink(targetEmail?: string): Promise<string> {
  const messagesClient = client.testing.messages;
  const allMessages = await messagesClient.get(MAILTRAP_INBOX_ID);

  if (!allMessages || allMessages.length === 0) {
    throw new Error('No emails found in Mailtrap inbox.');
  }

  let email: any;
  if (targetEmail) {
    const userMessages = allMessages.filter((msg: any) => {
      if (msg.to_email === targetEmail) return true;
      if (Array.isArray(msg.to) && msg.to.some((recipient: any) => recipient.email === targetEmail)) return true;
      return false;
    });

    if (userMessages.length === 0) {
      throw new Error(`No confirmation email found for ${targetEmail} in Mailtrap inbox.`);
    }
    email = userMessages.sort((a: any, b: any) => b.id - a.id)[0];
  } else {
    email = allMessages.sort((a: any, b: any) => b.id - a.id)[0];
  }

  const html = await client.testing.messages.getHtmlMessage(MAILTRAP_INBOX_ID, email.id);

  const match = html.match(/https?:\/\/[^"\s]+/);
  if (!match) {
    throw new Error('No confirmation link found in email for ' + (targetEmail || 'any user'));
  }
  return decodeHtmlEntities(match[0]);
}

/**
 * Extracts the reset password link from the latest email's HTML body.
 * Throws if no link is found.
 */
export async function getResetPasswordLink() {
  const email = await getLatestMail();
  const html = await client.testing.messages.getHtmlMessage(MAILTRAP_INBOX_ID, email.id);

  // Busca el <a> cuyo texto es "Reset Password"
  const match = html.match(/<a[^>]+href="([^"]+)"[^>]*>\s*Reset Password\s*<\/a>/i);
  if (!match) {
    throw new Error('No reset password link found in email (button text: Reset Password)');
  }
  return decodeHtmlEntities(match[1]);
}