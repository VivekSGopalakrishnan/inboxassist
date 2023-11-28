const { google } = require('googleapis');

async function fetchReplyAndOrganizeEmail(auth, userEmail) {
    const gmail = google.gmail({ version: 'v1', auth });
    const labelName = "Processed";

    try {
        const response = await gmail.users.messages.list({
            userId: 'me',
            q: 'is:unread',
            maxResults: 1
        });

        const messages = response.data.messages;
        if (!messages || messages.length === 0) {
            console.log('No unread messages found.');
            return;
        }

        const latestUnreadMessageId = messages[0].id;
        const threadId = messages[0].threadId;

        if (await hasRepliedToThread(gmail, threadId, userEmail)) {
            console.log('Already replied to this thread. Skipping.');
            return;
        }

        const email = await gmail.users.messages.get({
            userId: 'me',
            id: latestUnreadMessageId
        });

        await replyToEmail(gmail, email);
        console.log('Replied to the email.');

        await markAsReadAndLabel(gmail, latestUnreadMessageId, labelName);
        
    } catch (error) {
        console.error('The API returned an error:', error);
    }
}
async function hasRepliedToThread(gmail, threadId, userEmail) {
    const thread = await gmail.users.threads.get({
        userId: 'me',
        id: threadId
    });

    return thread.data.messages.some(message => {
        const fromHeader = getHeader(message.payload.headers, 'From');
        return fromHeader && fromHeader.includes(userEmail);
    });
}

async function markAsReadAndLabel(gmail, messageId, labelName) {
    await gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
            removeLabelIds: ["UNREAD"],
            addLabelIds: [await ensureLabelExists(gmail, labelName)]
        }
    });
    console.log(`Email marked as read and labeled as '${labelName}'.`);
}


function getHeader(headers, name) {
    const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
    return header ? header.value : null;
}
async function replyToEmail(gmail, originalEmail) {
    const emailSubject = 'Out of Town';
    const emailTo = getHeader(originalEmail.data.payload.headers, 'From');
    const emailBody = 'Thank you for your email. I am currently on vacation and will have limited access to email. I will get back to you as soon as possible upon my return.'; 

    const message = [
        'Content-Type: text/plain; charset="UTF-8"\n',
        'MIME-Version: 1.0\n',
        'Content-Transfer-Encoding: 7bit\n',
        'to: ', emailTo, '\n',
        'subject: ', emailSubject, '\n\n',
        emailBody
    ].join('');

    const encodedMessage = Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
            raw: encodedMessage
        }
    });
}

async function ensureLabelExists(gmail, labelName) {
    const existingLabelsRes = await gmail.users.labels.list({ userId: 'me' });
    const existingLabels = existingLabelsRes.data.labels || [];

    let labelId = existingLabels.find(label => label.name === labelName)?.id;
    if (!labelId) {
        const newLabelRes = await gmail.users.labels.create({
            userId: 'me',
            requestBody: {
                name: labelName
            }
        });
        labelId = newLabelRes.data.id;
    }

    return labelId;
}

async function applyLabelToEmail(gmail, messageId, labelName) {
    const labelId = await ensureLabelExists(gmail, labelName);
    await gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
            addLabelIds: [labelId]
        }
    });
}

module.exports = fetchReplyAndOrganizeEmail;
