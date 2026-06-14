import { google } from "googleapis";

function getClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!email || !key) return null;

  const auth = new google.auth.GoogleAuth({
    credentials: { client_email: email, private_key: key },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

const SHEET_ID = process.env.GOOGLE_SHEET_ID;

export async function appendTribute(
  name: string,
  relationship: string,
  message: string,
  submittedAt: string
) {
  if (!SHEET_ID) return;
  const sheets = getClient();
  if (!sheets) return;
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "Testimonies!A:E",
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [[name, relationship, message, submittedAt]] },
    });
  } catch {
    // Non-fatal — submission still succeeds even if Sheets write fails
  }
}

export async function appendRsvp(
  fullName: string,
  phone: string,
  attendance: string,
  submittedAt: string
) {
  if (!SHEET_ID) return;
  const sheets = getClient();
  if (!sheets) return;
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "RSVPs!A:D",
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [[fullName, phone, attendance, submittedAt]] },
    });
  } catch {
    // Non-fatal
  }
}
