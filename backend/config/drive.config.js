import { google } from "googleapis";

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const PARENT_FOLDER_ID = process.env.PARENT_FOLDER_ID;

const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    "https://developers.google.com/oauthplayground",
);

oauth2Client.setCredentials({
    refresh_token: REFRESH_TOKEN,
});

const driveConfig = google.drive({ version: "v3", auth: oauth2Client });

export { driveConfig, PARENT_FOLDER_ID, oauth2Client };
