const { app, BrowserWindow, ipcMain, Menu, shell } = require('electron');
const path = require('path');
const Store = require('electron-store');
const { createApiService } = require('../services/api-services');
const googleAuthService = require('../services/google-auth-service');

// Initialize the store for saving app data
const store = new Store();

// Keep a global reference of the window object to prevent garbage collection
let mainWindow;

// Create the main window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, '../../icons/project-logo.ico'),
    frame: false, // Disable the default frame
    webPreferences: {
      preload: path.resolve(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: true,
      sandbox: false, // Disable sandbox to allow preload script to access Node.js APIs
      webSecurity: true,
      allowRunningInsecureContent: false,
      defaultFontFamily: { standard: 'Arial', serif: 'Times New Roman', sansSerif: 'Arial' },
      // Permessi migliorati per l'accesso al microfono
      microphone: true,
      audioCapture: true,
      mediaPermissions: true,
      permissions: {
        media: true,
        geolocation: false,
        notifications: true,
        midi: false,
        midiSysex: false,
        pointerLock: false
      }
    }
  });

  // Richiesta esplicita dei permessi per il microfono
  mainWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === 'media' || permission === 'microphone') {
      // Concede sempre i permessi per il microfono
      console.log('Main.js: Concesso permesso per il microfono');
      callback(true);
    } else {
      // Per altri permessi usa il comportamento predefinito
      callback(true);
    }
  });

  // Check if user is authenticated
  const session = store.get('settings.synapse_session');
  console.log('Main.js: Retrieved session:', session);
  
  // Verifica e correggi il ruolo admin se necessario
  if (session && session.email) {
    const adminEmails = store.get('settings.adminEmails') || ['luuh2640@gmail.com'];
    if (adminEmails.includes(session.email.toLowerCase()) && session.role !== 'admin') {
      console.log('Main.js: Correcting admin role for:', session.email);
      session.role = 'admin';
      store.set('settings.synapse_session', session);
    }
  }
  
  const isAuthenticated = session && (!session.expiresAt || session.expiresAt > Date.now());
  console.log('Main.js: Session is authenticated:', isAuthenticated);
  
  // Load the appropriate HTML file based on authentication status
  if (isAuthenticated) {
    console.log('Main.js: Loading index.html (authenticated user)');
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  } else {
    console.log('Main.js: Loading login.html (not authenticated)');
    mainWindow.loadFile(path.join(__dirname, '../renderer/login.html'));
  }

  // Show window when ready to prevent flickering
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    // Dereference the window object
    mainWindow = null;
  });

  // Create a custom menu
  const menuTemplate = [
    {
      label: 'File',
      submenu: [
        { label: 'New', click: () => { /* New file action */ } },
        { label: 'Open', click: () => { /* Open file action */ } },
        { label: 'Save', click: () => { /* Save file action */ } },
        { type: 'separator' },
        { label: 'Exit', role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', role: 'undo' },
        { label: 'Redo', role: 'redo' },
        { type: 'separator' },
        { label: 'Cut', role: 'cut' },
        { label: 'Copy', role: 'copy' },
        { label: 'Paste', role: 'paste' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { label: 'Reload', role: 'reload' },
        { label: 'Toggle Fullscreen', role: 'togglefullscreen' },
        { label: 'Developer Tools', role: 'toggleDevTools' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        { label: 'About', click: () => { /* About action */ } }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
}

// Create window when Electron has finished initialization
app.whenReady().then(() => {
  // Register the synapse protocol
  if (!app.isDefaultProtocolClient('synapse')) {
    app.setAsDefaultProtocolClient('synapse');
  }
  
  createWindow();

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open
    if (mainWindow === null) createWindow();
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Handle window control events from renderer
ipcMain.on('window-minimize', (event) => {
  console.log('Main: Received window-minimize event');
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.on('window-maximize', (event) => {
  console.log('Main: Received window-maximize event');
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('window-close', (event) => {
  console.log('Main: Received window-close event');
  if (mainWindow) {
    mainWindow.close();
  }
});

// Handle navigation between login and main pages
ipcMain.on('navigate', (event, destination) => {
  console.log(`Received navigation request to: ${destination}`);
  if (mainWindow) {
    if (destination === 'dashboard' || destination === 'index') {
      console.log('Navigating to dashboard (index.html)');
      mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    } else if (destination === 'login') {
      console.log('Navigating to login page (login.html)');
      mainWindow.loadFile(path.join(__dirname, '../renderer/login.html'));
    } else {
      console.warn(`Unknown destination: ${destination}, defaulting to index.html`);
      mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    }
  } else {
    console.error('Cannot navigate: mainWindow is null');
  }
});

// Handle IPC messages from renderer
ipcMain.on('save-chat-history', (event, chatHistory) => {
  store.set('chatHistory', chatHistory);
});

ipcMain.on('get-chat-history', (event) => {
  const chatHistory = store.get('chatHistory', []);
  event.returnValue = chatHistory;
});

// Handle settings storage
ipcMain.on('save-settings', (event, { key, value }) => {
  store.set(`settings.${key}`, value);
});

ipcMain.on('get-settings', (event, key) => {
  event.returnValue = store.get(`settings.${key}`);
});

// NSN service handlers are already defined above
// No need to register them twice

// Handle API requests
ipcMain.handle('generate-ai-response', async (event, { prompt }) => {
  try {
    // Get the default provider ID from settings
    const defaultProviderId = store.get('settings.defaultProvider');
    if (!defaultProviderId) {
      throw new Error('Nessun provider AI predefinito selezionato. Configuralo nelle impostazioni.');
    }
    
    // Get all providers from settings
    const providers = store.get('settings.llmProviders', []);
    
    // Find the default provider
    const provider = providers.find(p => p.id === defaultProviderId);
    if (!provider) {
      throw new Error('Provider AI predefinito non trovato. Configuralo nelle impostazioni.');
    }
    
    // Create the appropriate API service
    const apiService = createApiService(provider);
    if (!apiService) {
      throw new Error(`Provider non supportato: ${provider.name}`);
    }
    
    // Generate response
    const response = await apiService.generateResponse(prompt);
    return { success: true, response };
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, error: error.message };
  }
});

// Handle Google authentication
ipcMain.handle('google-auth-start', async (event) => {
  try {
    console.log('Starting Google authentication flow');
    
    // Show a loading indicator in the UI
    event.sender.send('google-auth-status', { status: 'starting' });
    
    // Small delay to ensure UI update is rendered
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Update status to awaiting user input
    event.sender.send('google-auth-status', { status: 'awaiting_user' });
    
    // Call the authentication service
    const userInfo = await googleAuthService.authenticateWithGoogle();
    console.log('Google authentication successful:', userInfo.email);
    
    // Update status to authenticated
    event.sender.send('google-auth-status', { status: 'authenticated' });
    
    // Check if user exists in local storage
    const users = store.get('settings.users', []);
    let user = users.find(u => u.email.toLowerCase() === userInfo.email.toLowerCase());
    
    // List of admin emails for secure role assignment
    const adminEmails = store.get('settings.adminEmails') || ['luuh2640@gmail.com'];
    const isAdmin = adminEmails.includes(userInfo.email.toLowerCase());
    
    // If not, create a new user
    if (!user) {
      console.log('Creating new user account for Google user');
      user = {
        id: userInfo.id || Date.now().toString(),
        name: userInfo.name,
        email: userInfo.email,
        picture: userInfo.picture,
        oauthProvider: 'google',
        role: isAdmin ? 'admin' : 'user',
        createdAt: new Date().toISOString(),
        workflows: []
      };
      
      users.push(user);
      store.set('settings.users', users);
    } else {
      console.log('Existing user found, updating profile');
      // Update user data with the latest from Google
      user.name = userInfo.name;
      user.picture = userInfo.picture;
      user.lastLogin = new Date().toISOString();
      
      // Only update role if user is an admin (prevent downgrading admins)
      if (isAdmin && user.role !== 'admin') {
        console.log('Upgrading user to admin role due to email match');
        user.role = 'admin';
      }
      
      // Salvataggio aggiornato
      store.set('settings.users', users);
    }
    
    // Create a session
    const session = {
      token: userInfo.tokens.id_token,
      userId: user.id,
      name: user.name,
      email: user.email,
      picture: userInfo.picture,
      role: user.role || 'user',
      oauthProvider: 'google',
      expiresAt: null // No expiration for OAuth sessions
    };
    
    // Assicuriamoci che l'utente admin sia riconosciuto
    if (adminEmails.includes(user.email.toLowerCase()) && session.role !== 'admin') {
      console.log('Correcting admin role in session for email:', user.email);
      session.role = 'admin';
    }
    
    console.log('Creating session with role:', session.role);
    store.set('settings.synapse_session', session);
    return { success: true, session };
  } catch (error) {
    console.error('Google authentication error:', error);
    event.sender.send('google-auth-status', { 
      status: 'error', 
      error: error.message 
    });
    return { success: false, error: error.message };
  }
});

// Verify Google token
ipcMain.handle('google-auth-verify', async (event, { idToken }) => {
  try {
    const userData = await googleAuthService.verifyGoogleToken(idToken);
    return { success: true, userData };
  } catch (error) {
    console.error('Google token verification error:', error);
    return { success: false, error: error.message };
  }
});

// Aggiungi questi handler per i permessi del microfono
ipcMain.handle('request-microphone-permission', async (event) => {
  try {
    // In Electron, questo è il modo migliore per richiedere i permessi del microfono:
    // Tentiamo direttamente di accedere al microfono
    console.log('Main.js: Requesting microphone permission explicitly');
    
    // Notiamo l'utente che stiamo per richiedere l'accesso al microfono
    if (mainWindow) {
      mainWindow.webContents.executeJavaScript(`
        if (window.api && window.api.showNotification) {
          window.api.showNotification({
            title: 'Richiesta Permesso',
            body: 'Synapse sta richiedendo l\'accesso al microfono...'
          });
        }
      `).catch(err => console.error('Error showing notification:', err));
    }
    
    // Memorizziamo il permesso nello storage persistente
    store.set('settings.microphonePermission', 'requested');
    
    // Otteniamo il permesso tramite getUserMedia
    const stream = await mainWindow.webContents.executeJavaScript(`
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => true)
        .catch(err => {
          console.error('Media permission error:', err.name, err.message);
          return false;
        });
    `);
    
    console.log('Main.js: Microphone permission result:', stream);
    
    // Salva lo stato del permesso
    if (stream) {
      store.set('settings.microphonePermission', 'granted');
      return { granted: true, message: 'Permesso al microfono concesso' };
    } else {
      store.set('settings.microphonePermission', 'denied');
      return { granted: false, message: 'Permesso al microfono negato' };
    }
  } catch (error) {
    console.error('Error requesting microphone permission:', error);
    return { granted: false, error: error.message };
  }
});

ipcMain.handle('check-microphone-permission', async (event) => {
  try {
    console.log('Main.js: Checking microphone permission');
    
    // Prima controlla se abbiamo già salvato lo stato del permesso
    const savedPermission = store.get('settings.microphonePermission');
    console.log('Main.js: Saved permission state:', savedPermission);
    
    if (savedPermission === 'granted') {
      // Verifica che il permesso sia ancora valido
      const isStillGranted = await mainWindow.webContents.executeJavaScript(`
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(() => true)
          .catch(() => false);
      `);
      
      if (isStillGranted) {
        return { state: 'granted' };
      }
      // Se non è più valido, aggiorniamo lo stato
      store.set('settings.microphonePermission', 'unknown');
    }
    
    // Se non abbiamo informazioni salvate o il permesso precedente non è più valido,
    // verifichiamo lo stato attuale
    const permissionStatus = await mainWindow.webContents.executeJavaScript(`
      navigator.permissions.query({ name: 'microphone' })
        .then(status => status.state)
        .catch(() => 'unknown');
    `);
    
    console.log('Main.js: Current permission state:', permissionStatus);
    
    // Aggiorniamo lo stato salvato
    store.set('settings.microphonePermission', permissionStatus);
    
    return { state: permissionStatus };
  } catch (error) {
    console.error('Error checking microphone permission:', error);
    return { state: 'unknown', error: error.message };
  }
});

ipcMain.handle('open-microphone-settings', async (event) => {
  try {
    // Su Windows, apriamo le impostazioni di privacy del microfono
    if (process.platform === 'win32') {
      shell.openExternal('ms-settings:privacy-microphone');
      return { success: true };
    } 
    // Su macOS, apriamo le preferenze di sicurezza
    else if (process.platform === 'darwin') {
      shell.openExternal('x-apple.systempreferences:com.apple.preference.security?Privacy_Microphone');
      return { success: true };
    }
    // Su altre piattaforme, diamo un messaggio generico
    else {
      return { 
        success: false, 
        message: 'Apertura impostazioni non supportata su questa piattaforma. Controlla le impostazioni del browser.' 
      };
    }
  } catch (error) {
    console.error('Error opening microphone settings:', error);
    return { success: false, error: error.message };
  }
});

// Handler per aprire link esterni in modo sicuro
ipcMain.handle('open-external-link', async (event, url) => {
  try {
    console.log('Main.js: Opening external link:', url);
    
    // Verifica che l'URL sia valido e sicuro
    if (url.startsWith('http://') || url.startsWith('https://') || 
        url.startsWith('ms-settings:') || url.startsWith('chrome://') || 
        url.startsWith('x-apple.systempreferences:')) {
      await shell.openExternal(url);
      return { success: true };
    } else {
      console.warn('Main.js: Blocked opening potentially unsafe URL:', url);
      return { success: false, error: 'URL non sicuro' };
    }
  } catch (error) {
    console.error('Error opening external link:', error);
    return { success: false, error: error.message };
  }
});