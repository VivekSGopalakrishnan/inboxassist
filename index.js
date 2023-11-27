require('dotenv').config();
const readline = require('readline');
const cron = require('node-cron');
const { getOAuthClient, setTokens, getAuthUrl, tokenCache } = require('./auth/auth');
const fetchReplyAndOrganizeEmail = require('./emailHandler/emailHandler');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const oAuth2Client = getOAuthClient();

const performEmailCheck = () => {
    const shouldProceed = Math.random() < 0.5; 
    if (shouldProceed) {
        fetchReplyAndOrganizeEmail(oAuth2Client).catch(console.error);
    } else {
        console.log('Skipping this interval.');
    }
};

const startProcess = async () => {
    let accessToken = tokenCache.get("access_token");
    if (!accessToken) {
        console.log("Please visit the following URL to authorize the application:");
        console.log(getAuthUrl());

        rl.question('Enter the authorization code here: ', async (code) => {
            try {
                const { tokens } = await oAuth2Client.getToken(code);
                setTokens(tokens);
                tokenCache.set("access_token", tokens.access_token, 3600);
                if (tokens.refresh_token) {
                    tokenCache.set("refresh_token", tokens.refresh_token);
                }

                oAuth2Client.setCredentials(tokens);
                cron.schedule('* * * * *', performEmailCheck); 
            } catch (error) {
                console.error('Error retrieving access token:', error);
                rl.close();
            }
        });
    } else {
        oAuth2Client.setCredentials({
            access_token: accessToken,
            refresh_token: tokenCache.get("refresh_token")
        });
        cron.schedule('* * * * *', performEmailCheck); 
    }
};

startProcess();
