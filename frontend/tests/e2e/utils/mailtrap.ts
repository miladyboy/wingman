import { MailtrapClient } from "mailtrap";

const MAILTRAP_API_TOKEN = process.env.MAILTRAP_API_TOKEN!;
const MAILTRAP_INBOX_ID = Number(process.env.MAILTRAP_INBOX_ID!);
const MAILTRAP_ACCOUNT_ID = Number(process.env.MAILTRAP_ACCOUNT_ID!);

console.log('Initializing Mailtrap client with inbox ID:', MAILTRAP_INBOX_ID);
const client = new MailtrapClient({ token: MAILTRAP_API_TOKEN, testInboxId: MAILTRAP_INBOX_ID, accountId: MAILTRAP_ACCOUNT_ID });

/**
 * Fetches the latest email from the Mailtrap inbox using the SDK.
 * Throws if no email is found.
 */
export async function getLatestMail() {
  console.log('Fetching latest email from Mailtrap...');
  const messagesClient = client.testing.messages;
  
  const messages = await messagesClient.get(MAILTRAP_INBOX_ID);
  console.log('Retrieved messages:', messages?.length || 0);
  
  if (!messages || messages.length === 0) {
    console.error('No email found in Mailtrap inbox');
    throw new Error('No email found in Mailtrap inbox');
  }
  console.log('Successfully retrieved latest email');
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
  console.log('Getting confirmation link from latest email...');
  const email = await getLatestMail();
  console.log('Retrieved email with ID:', email.id);
  
  const html = await client.testing.messages.getHtmlMessage(MAILTRAP_INBOX_ID, email.id);
  console.log('Retrieved HTML content from email');
  
  const match = html.match(/https?:\/\/[^"\s]+/);
  if (!match) {
    console.error('No confirmation link found in email HTML');
    throw new Error('No confirmation link found in email');
  }
  const decodedLink = decodeHtmlEntities(match[0]);
  console.log('Successfully extracted and decoded confirmation link:', decodedLink);
  return decodedLink;
}