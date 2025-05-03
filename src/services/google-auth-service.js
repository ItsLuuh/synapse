const { OAuth2Client } = require('google-auth-library');
const config = require('./google-auth-config');
const { shell } = require('electron');
const http = require('http');
const url = require('url');

// Create OAuth2 client
const oAuth2Client = new OAuth2Client(
  config.clientId,
  config.clientSecret,
  config.redirectUri
);

/**
 * Generate a URL for Google OAuth consent screen
 */
function getGoogleAuthURL() {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: config.scopes,
    prompt: 'consent'
  });
  return authUrl;
}

/**
 * Create a local server to handle the OAuth callback
 */
function createCallbackServer(port) {
  return new Promise((resolve, reject) => {
    // Create a server to listen for the OAuth2 callback
    const server = http.createServer(async (req, res) => {
      try {
        const urlParts = url.parse(req.url, true);
        const pathname = urlParts.pathname;
        
        if (pathname === '/oauth/callback') {
          // Get the code from the callback URL
          const code = urlParts.query.code;
          
          // Send response to browser
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <head>
                <title>Authentication Successful</title>
                <style>
                  body { font-family: Arial, sans-serif; text-align: center; padding: 40px; }
                  h1 { color: #4CAF50; }
                </style>
              </head>
              <body>
                <h1>Authentication Successful!</h1>
                <p>You have successfully authenticated with Google.</p>
                <p>You can close this window and return to the application.</p>
                <script>setTimeout(() => window.close(), 3000);</script>
              </body>
            </html>
          `);
          
          // Close the server
          server.close();
          
          // Return the code
          resolve(code);
        } else {
          // Not found
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not Found');
        }
      } catch (error) {
        console.error('Server error:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Server Error');
        reject(error);
      }
    });
    
    // Listen on the specified port
    server.listen(port, 'localhost', () => {
      console.log(`OAuth callback server listening on port ${port}`);
    });
    
    // Handle server errors
    server.on('error', (err) => {
      console.error('Server error:', err);
      reject(err);
    });
    
    return server;
  });
}

/**
 * Handle the Google OAuth flow for desktop apps with browser-based authentication
 */
async function authenticateWithGoogle() {
  // Parse the redirect URL to get port
  const redirectUrl = new URL(config.redirectUri);
  const port = parseInt(redirectUrl.port, 10);
  
  // Start the callback server
  try {
    console.log(`Starting OAuth callback server on port ${port}...`);
    const codePromise = createCallbackServer(port);
    
    // Generate the auth URL
    const authUrl = getGoogleAuthURL();
    console.log('Opening browser with auth URL:', authUrl);
    
    // Open the default browser with the auth URL
    shell.openExternal(authUrl);
    
    // Wait for the code from the callback
    console.log('Waiting for authentication...');
    const code = await codePromise;
    console.log('Got authorization code, exchanging for tokens...');
    
    // Exchange the code for tokens
    const { tokens } = await oAuth2Client.getToken(code);
    console.log('Got tokens, getting user info...');
    
    // Set credentials
    oAuth2Client.setCredentials(tokens);
    
    // Get user profile
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`
      }
    });
    
    if (!userInfoResponse.ok) {
      throw new Error(`Failed to fetch user info: ${userInfoResponse.status}`);
    }
    
    const userInfo = await userInfoResponse.json();
    console.log('Successfully retrieved user info:', userInfo.email);
    
    // Return the user information and tokens
    return {
      id: userInfo.id,
      name: userInfo.name,
      email: userInfo.email,
      picture: userInfo.picture,
      tokens
    };
  } catch (error) {
    console.error('Error in browser-based OAuth flow:', error);
    throw error;
  }
}

/**
 * Verify an ID token from Google
 */
async function verifyGoogleToken(idToken) {
  try {
    const ticket = await oAuth2Client.verifyIdToken({
      idToken,
      audience: config.clientId
    });
    
    const payload = ticket.getPayload();
    return {
      userId: payload['sub'],
      email: payload['email'],
      name: payload['name'],
      picture: payload['picture']
    };
  } catch (error) {
    console.error('Error verifying Google token:', error);
    throw error;
  }
}

module.exports = {
  getGoogleAuthURL,
  authenticateWithGoogle,
  verifyGoogleToken
}; 