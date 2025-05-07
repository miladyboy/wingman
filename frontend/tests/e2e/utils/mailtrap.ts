import { MailtrapClient } from "mailtrap";

const MAILTRAP_API_TOKEN = process.env.MAILTRAP_API_TOKEN!;
const MAILTRAP_INBOX_ID = Number(process.env.MAILTRAP_INBOX_ID!);
const MAILTRAP_ACCOUNT_ID = Number(process.env.MAILTRAP_ACCOUNT_ID!);

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

/**
 * Decodes HTML entities in a string (specifically &amp; to &).
 */
function decodeHtmlEntities(str: string) {
  return str.replace(/&amp;/g, '&');
}

/**
 * Extracts the first confirmation link from the latest email's HTML body.
 * Throws if no link is found.
 */
export async function getConfirmationLink() {
  const email = await getLatestMail();
  const html = await client.testing.messages.getHtmlMessage(MAILTRAP_INBOX_ID, email.id);
  
  const match = html.match(/https?:\/\/[^"\s]+/);
  if (!match) {
    throw new Error('No confirmation link found in email');
  }
  return decodeHtmlEntities(match[0]);
}