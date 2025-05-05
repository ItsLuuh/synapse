// Preload script for exposing Electron APIs to the renderer process
const { contextBridge, ipcRenderer } = require('electron');

// Try to load systeminformation, but don't fail if it's not available
let si;
try {
  si = require('systeminformation');
  console.log('Successfully loaded systeminformation module');
} catch (error) {
  console.warn('Failed to load systeminformation module:', error.message);
  // Create a dummy object to prevent errors
  si = {
    // Add any methods you might be using from si here
    // For example:
    cpu: () => Promise.resolve({ brand: 'Unknown' }),
    mem: () => Promise.resolve({ total: 0, free: 0, used: 0 }),
    currentLoad: () => Promise.resolve({ currentLoad: 0, cpuBrand: 'Unknown CPU' }),
    fsSize: () => Promise.resolve([{ size: 0, used: 0 }]),
    networkStats: () => Promise.resolve([{ rx_sec: 0, tx_sec: 0 }])
  };
}

// Log when preload script starts
console.log('Preload script starting...');

// Exposed functions for getting system information
async function getSystemInfo() {
  try {
    // Get CPU information
    const cpuData = await si.currentLoad();
    const cpuUsage = Math.round(cpuData.currentLoad);
    
    // Get memory information
    const memData = await si.mem();
    const memTotal = Math.round(memData.total / 1024 / 1024 / 1024); // Convert to GB
    const memFree = Math.round(memData.free / 1024 / 1024 / 1024); // Convert to GB
    const memUsed = Math.round(memData.used / 1024 / 1024 / 1024); // Convert to GB
    const memUsagePercent = Math.round((memData.used / memData.total) * 100);
    
    // Get disk information
    const fsData = await si.fsSize();
    const mainDisk = fsData[0]; // Get the first disk (usually the system disk)
    const diskTotal = Math.round(mainDisk.size / 1024 / 1024 / 1024); // Convert to GB
    const diskUsed = Math.round(mainDisk.used / 1024 / 1024 / 1024); // Convert to GB
    const diskUsagePercent = Math.round((mainDisk.used / mainDisk.size) * 100);
    
    // Get network information (just an estimate)
    const netData = await si.networkStats();
    const mainInterface = netData[0]; // Get the first network interface
    const networkTotal = Math.round((mainInterface.rx_sec + mainInterface.tx_sec) / 1024); // KB/s
    
    return {
      cpu: {
        brand: cpuData.cpuBrand || 'CPU',
        usage: cpuUsage
      },
      memory: {
        total: memTotal,
        free: memFree,
        used: memUsed,
        usagePercent: memUsagePercent
      },
      disk: {
        total: diskTotal,
        used: diskUsed,
        usagePercent: diskUsagePercent
      },
      network: {
        total: networkTotal
      }
    };
  } catch (error) {
    console.error('Error getting system information:', error);
    return { error: error.message };
  }
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'api', 
  {
    // Add these window control methods with debugging
    minimizeWindow: () => {
      console.log('Preload: Sending window-minimize IPC message');
      return ipcRenderer.send('window-minimize');
    },
    maximizeWindow: () => {
      console.log('Preload: Sending window-maximize IPC message');
      return ipcRenderer.send('window-maximize');
    },
    closeWindow: () => {
      console.log('Preload: Sending window-close IPC message');
      return ipcRenderer.send('window-close');
    },
    
    // System information
    getSystemInfo: () => getSystemInfo(),
    
    // Nuovi handler per i pulsanti della thumbnailbar
    onThumbnailCamera: (callback) => ipcRenderer.on('thumbnail-camera', () => callback()),
    onThumbnailVideo: (callback) => ipcRenderer.on('thumbnail-video', () => callback()),
    onThumbnailWorkflow: (callback) => ipcRenderer.on('thumbnail-workflow', () => callback()),
    onThumbnailVoice: (callback) => ipcRenderer.on('thumbnail-voice', () => callback()),
    
    // Handler per i comandi dal menu contestuale JumpList
    onCreateNewChat: (callback) => ipcRenderer.on('create-new-chat', () => callback()),
    onCreateNewWorkflow: (callback) => ipcRenderer.on('create-new-workflow', () => callback()),
    
    // Add navigation API
    navigate: (destination) => {
      console.log(`Navigating to: ${destination}`);
      return ipcRenderer.send('navigate', destination);
    },
    
    // Storage utilities for auth
    getStoredItem: (key) => {
      try {
        console.log(`Getting stored item: ${key}`);
        const value = ipcRenderer.sendSync('get-settings', key);
        console.log(`Retrieved value:`, value);
        return value;
      } catch (error) {
        console.error('Error getting stored item:', error);
        return null;
      }
    },
    setStoredItem: (key, value) => {
      try {
        console.log(`Setting stored item: ${key}`, value);
        return ipcRenderer.send('save-settings', { key, value });
      } catch (error) {
        console.error('Error setting stored item:', error);
        return false;
      }
    },
    
    // Your existing API methods
    saveChatHistory: (chatHistory) => ipcRenderer.send('save-chat-history', chatHistory),
    getChatHistory: () => ipcRenderer.sendSync('get-chat-history'),
    saveSettings: (key, value) => ipcRenderer.send('save-settings', { key, value }),
    getSettings: (key) => ipcRenderer.sendSync('get-settings', key),
    generateAIResponse: (prompt) => ipcRenderer.invoke('generate-ai-response', { prompt }),
    
    // API per il microfono e i permessi
    requestMicrophonePermission: () => {
      console.log('Preload: Sending request-microphone-permission IPC message');
      return ipcRenderer.invoke('request-microphone-permission');
    },
    
    checkMicrophonePermission: () => {
      console.log('Preload: Sending check-microphone-permission IPC message');
      return ipcRenderer.invoke('check-microphone-permission');
    },
    
    openMicrophoneSettings: () => {
      console.log('Preload: Sending open-microphone-settings IPC message');
      return ipcRenderer.invoke('open-microphone-settings');
    },
    
    // API per apertura URL esterni
    openExternalLink: (url) => {
      console.log('Preload: Sending open-external-link IPC message');
      return ipcRenderer.invoke('open-external-link', url);
    },
    
    // Add a simple test method to verify the API is working
    testApi: () => {
      console.log('API test method called');
      return 'API is working';
    },
    
    // Google authentication
    googleAuthStart: () => {
      console.log('Preload: Sending google-auth-start IPC message');
      return ipcRenderer.invoke('google-auth-start');
    },
    
    onGoogleAuthStatus: (callback) => {
      console.log('Preload: Setting up google-auth-status event listener');
      ipcRenderer.on('google-auth-status', (event, data) => {
        console.log('Preload: Received google-auth-status event:', data);
        callback(data);
      });
    },
    
    googleAuthVerify: (idToken) => {
      console.log('Preload: Sending google-auth-verify IPC message');
      return ipcRenderer.invoke('google-auth-verify', { idToken });
    }
  }
);

// Expose window.synapseStore for auth.js
contextBridge.exposeInMainWorld('synapseStore', {
  get: (key) => {
    console.log(`SynapseStore.get: ${key}`);
    const value = ipcRenderer.sendSync('get-settings', key);
    console.log(`SynapseStore.get returned:`, value);
    return value;
  },
  set: (key, value) => {
    console.log(`SynapseStore.set: ${key}`, value);
    return ipcRenderer.send('save-settings', { key, value });
  },
  remove: (key) => {
    console.log(`SynapseStore.remove: ${key}`);
    return ipcRenderer.send('save-settings', { key, value: null });
  }
});

// Esponiamo elettron specificamente per gestire i permessi
contextBridge.exposeInMainWorld('electron', {
  openExternalLink: (url) => {
    console.log('Preload: Sending open-external-link IPC message');
    return ipcRenderer.invoke('open-external-link', url);
  },
  requestMicrophonePermission: () => {
    console.log('Preload: Sending request-microphone-permission IPC message');
    return ipcRenderer.invoke('request-microphone-permission');
  },
  checkMicrophonePermission: () => {
    console.log('Preload: Sending check-microphone-permission IPC message from electron object');
    return ipcRenderer.invoke('check-microphone-permission');
  },
  openMicrophoneSettings: () => {
    console.log('Preload: Sending open-microphone-settings IPC message');
    return ipcRenderer.invoke('open-microphone-settings');
  }
});

// Log when preload script completes
console.log('Preload script completed, API exposed');
