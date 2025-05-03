// Google OAuth configuration for desktop applications
module.exports = {
  // Use a properly configured Web application client ID
  clientId: '387040379497-jdl0eha2uiprbqn4gd4t4uusb3qq8alu.apps.googleusercontent.com',
  // No client secret needed for public clients
  clientSecret: '',
  // Use a common loopback redirect URI that's registered in Google Console
  redirectUri: 'http://localhost:8000/oauth/callback',
  // Proper scopes for user info
  scopes: [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'openid'
  ]
}; 