import { MailtrapClient } from "mailtrap";
import * as cheerio from "cheerio";

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

/* eslint-disable no-undef */
function decodeHtmlEntities(str) {
  return str.replace(/&amp;/g, '&');
}

/**
 * Extracts the confirmation link (with data-confirmation-link) from the latest email's HTML body.
 * Throws if no such link is found.
 */
export async function getConfirmationLink() {
  const email = await getLatestMail();
  const html = await client.testing.messages.getHtmlMessage(MAILTRAP_INBOX_ID, email.id);

  const $ = cheerio.load(html);
  const link = $('a[data-confirmation-link]').attr('href');
  if (!link) {
    throw new Error('No <a data-confirmation-link> found in email');

  // Busca el <a> cuyo texto es "Confirm your mail"
  const match = html.match(/<a[^>]+href="([^"]+)"[^>]*>\s*Confirm your mail\s*<\/a>/i);
  if (!match) {
    throw new Error('No confirmation link found in email (button text: Confirm your mail)');
  }
  return decodeHtmlEntities(match[1]);
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
  return decodeHtmlEntities(link);
  return decodeHtmlEntities(match[1]);
}