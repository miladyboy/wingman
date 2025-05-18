/* eslint-env node */
import { MailtrapClient } from "mailtrap";

const MAILTRAP_API_TOKEN = process.env.MAILTRAP_API_TOKEN;
const _MAILTRAP_INBOX_ID = process.env.MAILTRAP_INBOX_ID ? Number(process.env.MAILTRAP_INBOX_ID) : null;
const _MAILTRAP_ACCOUNT_ID = process.env.MAILTRAP_ACCOUNT_ID ? Number(process.env.MAILTRAP_ACCOUNT_ID) : null;

if (!MAILTRAP_API_TOKEN || _MAILTRAP_INBOX_ID === null || _MAILTRAP_ACCOUNT_ID === null) {
  throw new Error('Missing Mailtrap environment variables. Please set MAILTRAP_API_TOKEN, MAILTRAP_INBOX_ID, and MAILTRAP_ACCOUNT_ID.');
}

const MAILTRAP_INBOX_ID = Number(_MAILTRAP_INBOX_ID);
const MAILTRAP_ACCOUNT_ID = Number(_MAILTRAP_ACCOUNT_ID);

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

// eslint-disable-next-line no-undef
// @ts-ignore
// process is provided by Node.js

// Decodes HTML entities in a string (specifically &amp; to &).
function decodeHtmlEntities(str) {
  return str.replace(/&amp;/g, '&');
}

/**
 * Extracts the first confirmation link from the latest email's HTML body.
 * Throws if no link is found.
 */
export async function getConfirmationLink() {
  const email = await getLatestMail();
  const html = await client.testing.messages.getHtmlMessage(MAILTRAP_INBOX_ID, email.id);

  // Busca el <a> cuyo texto sea 'Confirm your mail'
  const match = html.match(/<a[^>]+href="([^"]+)"[^>]*>\s*Confirm your mail\s*<\/a>/i);
  const link = match ? match[1] : null;
  if (!link) {
    throw new Error('No confirmation link with text "Confirm your mail" found in email');
  }
  return decodeHtmlEntities(link);
}

// Extrae el enlace de reset password del email
export async function getResetPasswordLink() {
  const email = await getLatestMail();
  const html = await client.testing.messages.getHtmlMessage(MAILTRAP_INBOX_ID, email.id);

  // Busca el <a> cuyo texto sea 'Reset Password'
  const match = html.match(/<a[^>]+href="([^"]+)"[^>]*>\s*Reset Password\s*<\/a>/i);
  const link = match ? match[1] : null;
  if (!link) {
    throw new Error('No reset password link with text "Reset Password" found in email');
  }
  return decodeHtmlEntities(link);
}