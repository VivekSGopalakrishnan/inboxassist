require('dotenv').config();
const { google } = require('googleapis');
const NodeCache = require('node-cache');
const tokenCache = new NodeCache();

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

const SCOPES = ['https://www.googleapis.com/auth/gmail.modify'];

const getAuthUrl = () => {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });
};

const getOAuthClient = () => {
  return oauth2Client;
};

const setTokens = (tokens) => {
  tokenCache.set("access_token", tokens.access_token);
  if (tokens.refresh_token) {
    tokenCache.set("refresh_token", tokens.refresh_token);
    console.log("token stored")
  }
  oauth2Client.setCredentials(tokens);
};

module.exports = {
  getAuthUrl,
  getOAuthClient,
  setTokens,
  tokenCache
};
