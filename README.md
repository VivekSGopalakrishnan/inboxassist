# InboxAssist

InboxAssist is a Node.js application that automates interactions with Gmail. It periodically checks for unread emails, selectively responds to email threads without previous replies from the user, marks emails as read, and organizes them under a custom label.

### Features
Unread Email Check: Scans the user's Gmail for unread emails at random intervals.
Selective Auto-Reply: Automatically replies to email threads only if the user hasn't previously responded.
Email Marking and Labeling: Marks processed emails as read and categorizes them with a specified label.
### Prerequisites
Node.js installed on your system.
A Google Cloud Platform account with Gmail API enabled and OAuth2 credentials configured.
### Installation
Clone the Repository:
### Clone this Repository

```bash
https://github.com/VivekSGopalakrishnan/inboxassist.git
```

### Installing Packages & Dependencies


Install Dependencies:

```bash
npm install
```
or
```bash
pnpm install
```
### Setup
Configure OAuth2 Credentials: Set up your credentials in the Google Cloud Console and download the client configuration.
### Environment File:
Create a .env file in the project root.
Add the following environment variables:
```bash
CLIENT_ID=your_client_id
CLIENT_SECRET=your_client_secret
REDIRECT_URI=your_redirect_uri
```
Usage
Run the Application:
```bash
pnpm dev
```
### Authorize the Application:
Follow the URL provided in the console to authorize the application.
Enter the authorization code back in the console.

### Libraries Used
googleapis: To interact with Google's Gmail API.

node-cron: For scheduling tasks at specified intervals.

dotenv: To manage environment variables.

readline: To read input from the console.
