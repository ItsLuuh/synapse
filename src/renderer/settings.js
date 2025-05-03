// settings.js - Handles settings modal functionality
document.addEventListener('DOMContentLoaded', () => {
  console.log('Settings script loaded');
  
  // Get references to DOM elements
  const settingsModal = document.getElementById('settingsModal');
  const closeSettingsBtn = document.getElementById('closeSettingsBtn');
  const settingsBtn = document.getElementById('settingsBtn');
  const settingsCategories = document.querySelectorAll('.settings-category');
  const settingsCategoryTitle = document.getElementById('settingsCategoryTitle');
  const settingsSections = document.querySelectorAll('.settings-section');
  
  console.log('Settings elements found:', {
    settingsModal: !!settingsModal,
    closeSettingsBtn: !!closeSettingsBtn,
    settingsBtn: !!settingsBtn,
    settingsCategoriesCount: settingsCategories?.length,
    settingsCategoryTitle: !!settingsCategoryTitle,
    settingsSectionsCount: settingsSections?.length
  });
  
  // Expose the showSettingsModal function globally so it can be called from profile.js
  window.showSettingsModal = showSettingsModal;
  
  // Existing settings button event handler
  if (settingsBtn) {
    settingsBtn.addEventListener('click', (e) => {
      console.log('Settings button clicked');
      e.preventDefault();
      e.stopPropagation();
      showSettingsModal();
    });
  }
  
  // Close settings modal
  if (closeSettingsBtn) {
    closeSettingsBtn.addEventListener('click', (e) => {
      console.log('Close settings button clicked');
      e.preventDefault();
      e.stopPropagation();
      hideSettingsModal();
    });
  }
  
  // Close modal when clicking outside - we need to prevent immediate closing
  if (settingsModal) {
    // Remove any existing click listeners on window that might affect this modal
    const originalClickListener = window.onclick;
    window.onclick = null;
    
    // Add click listener to the modal itself
    settingsModal.addEventListener('click', (event) => {
      if (event.target === settingsModal) {
        console.log('Clicked outside settings modal content');
        hideSettingsModal();
      }
    });
    
    // Prevent clicks inside the modal content from closing it
    const modalContent = settingsModal.querySelector('.modal-content');
    if (modalContent) {
      modalContent.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }
  }
  
  // Function to show settings modal
  function showSettingsModal() {
    if (settingsModal) {
      console.log('Showing settings modal');
      // Force any required style properties
      settingsModal.style.display = 'block';
      settingsModal.style.visibility = 'visible';
      settingsModal.style.opacity = '1';
      settingsModal.style.zIndex = '10000';
      
      // Ensure the modal doesn't close immediately
      setTimeout(() => {
        console.log('Modal display state after timeout:', settingsModal.style.display);
      }, 100);

      // Initialize the settings data
      loadSettingsData();
    } else {
      console.error('Settings modal not found');
    }
  }
  
  // Function to hide settings modal
  function hideSettingsModal() {
    if (settingsModal) {
      console.log('Hiding settings modal');
      // Save any pending changes
      saveSettingsData();
      
      // Apply animation
      settingsModal.classList.add('fade-out');
      
      // Hide after animation completes
      setTimeout(() => {
        settingsModal.style.display = 'none';
        settingsModal.classList.remove('fade-out');
      }, 300);
    }
  }
  
  // Initialize settings categories
  if (settingsCategories.length > 0) {
    // Add click listeners to settings categories
    settingsCategories.forEach(category => {
      category.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const categoryName = category.getAttribute('data-category');
        console.log('Switching to settings category:', categoryName);
        
        // Update active category
        settingsCategories.forEach(cat => {
          cat.classList.remove('active');
        });
        category.classList.add('active');
        
        // Update category title
        if (settingsCategoryTitle) {
          settingsCategoryTitle.textContent = category.querySelector('span').textContent;
        }
        
        // Animate section transition
        const currentSection = document.querySelector('.settings-section[style*="display: block"]');
        if (currentSection) {
          // Fade out current section
          currentSection.classList.add('fade-out');
          setTimeout(() => {
            // Hide all sections
            settingsSections.forEach(section => {
              section.style.display = 'none';
              section.classList.remove('fade-out', 'fade-in');
            });
            
            // Show and fade in new section
            const selectedSection = document.getElementById(`${categoryName}-settings`);
            if (selectedSection) {
              selectedSection.style.display = 'block';
              selectedSection.classList.add('fade-in');
            }
          }, 150);
        } else {
          // No visible section, just show the selected one
          settingsSections.forEach(section => {
            section.style.display = 'none';
          });
          
          const selectedSection = document.getElementById(`${categoryName}-settings`);
          if (selectedSection) {
            selectedSection.style.display = 'block';
            selectedSection.classList.add('fade-in');
          }
        }
      });
    });
  }
  
  // Settings data storage
  const defaultSettings = {
    general: {
      language: 'it',
      theme: 'dark',
      fontSize: 'medium',
      animations: true,
      startPage: 'dashboard'
    },
    appearance: {
      accentColor: '#4370cc',
      darkMode: true,
      contrastMode: false,
      transparencyEffects: true,
      customFonts: false,
      fontFamily: 'system-ui'
    },
    editor: {
      fontFamily: 'Consolas, monospace',
      fontSize: 14,
      tabSize: 2,
      wordWrap: true,
      lineNumbers: true,
      autoSave: true,
      formatOnSave: true,
      minimap: true
    },
    privacy: {
      saveHistory: true,
      anonymousAnalytics: true,
      crashReports: true,
      autoUpdate: true,
      localDataStoring: true
    },
    notifications: {
      enabled: true,
      sounds: true,
      desktop: true,
      updateNotifications: true,
      taskReminders: true,
      collaborationAlerts: true
    },
    shortcuts: {
      // Default keyboard shortcuts
      newChat: 'Ctrl+N',
      settings: 'Ctrl+,',
      search: 'Ctrl+F',
      save: 'Ctrl+S',
      undo: 'Ctrl+Z',
      redo: 'Ctrl+Y',
      cut: 'Ctrl+X',
      copy: 'Ctrl+C',
      paste: 'Ctrl+V'
    },
    sync: {
      enabled: false,
      provider: '',
      autoSync: true,
      syncFrequency: 'hourly',
      lastSync: null
    },
    apiProviders: []
  };
  
  let currentSettings = { ...defaultSettings };
  
  // Load settings from storage
  function loadSettingsData() {
    try {
      let storedSettings = null;
      
      if (window.api && window.api.getStoredItem) {
        storedSettings = window.api.getStoredItem('app_settings');
      } else {
        const storedData = localStorage.getItem('app_settings');
        if (storedData) {
          storedSettings = JSON.parse(storedData);
        }
      }
      
      if (storedSettings) {
        // Merge with default settings to ensure all properties exist
        currentSettings = mergeDeep(defaultSettings, storedSettings);
      }
      
      // Update UI with loaded settings
      updateSettingsUI();
      
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }
  
  // Save settings to storage
  function saveSettingsData() {
    try {
      if (window.api && window.api.setStoredItem) {
        window.api.setStoredItem('app_settings', currentSettings);
      } else {
        localStorage.setItem('app_settings', JSON.stringify(currentSettings));
      }
      
      // Show save confirmation
      showToast('Impostazioni salvate con successo');
      
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast('Errore nel salvataggio delle impostazioni', 'error');
    }
  }
  
  // Update UI with current settings
  function updateSettingsUI() {
    // General settings
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
      languageSelect.value = currentSettings.general.language;
    }
    
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) {
      themeSelect.value = currentSettings.general.theme;
    }
    
    const fontSizeSelect = document.getElementById('fontSizeSelect');
    if (fontSizeSelect) {
      fontSizeSelect.value = currentSettings.general.fontSize;
    }
    
    const animationsToggle = document.getElementById('animationsToggle');
    if (animationsToggle) {
      animationsToggle.checked = currentSettings.general.animations;
    }
    
    const startPageSelect = document.getElementById('startPageSelect');
    if (startPageSelect) {
      startPageSelect.value = currentSettings.general.startPage;
    }
    
    // Load API providers
    loadAPIProviders();
    
    // Apply theme immediately
    applyTheme(currentSettings.general.theme);
  }
  
  // Deep merge function for settings
  function mergeDeep(target, source) {
    const output = Object.assign({}, target);
    
    if (isObject(target) && isObject(source)) {
      Object.keys(source).forEach(key => {
        if (isObject(source[key])) {
          if (!(key in target)) {
            Object.assign(output, { [key]: source[key] });
          } else {
            output[key] = mergeDeep(target[key], source[key]);
          }
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }
    
    return output;
  }
  
  // Helper to check if value is an object
  function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
  }
  
  // Show toast notification
  function showToast(message, type = 'success') {
    // Check if toast container exists, create if not
    let toastContainer = document.getElementById('toastContainer');
    
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toastContainer';
      document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <div class="toast-content">
        <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i>
        <span>${message}</span>
      </div>
      <button class="toast-close"><i class="fas fa-times"></i></button>
    `;
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Add close button event
    const closeBtn = toast.querySelector('.toast-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        toast.classList.add('toast-hiding');
        setTimeout(() => {
          toastContainer.removeChild(toast);
        }, 300);
      });
    }
    
    // Auto remove after delay
    setTimeout(() => {
      if (toast.parentNode === toastContainer) {
        toast.classList.add('toast-hiding');
        setTimeout(() => {
          if (toast.parentNode === toastContainer) {
            toastContainer.removeChild(toast);
          }
        }, 300);
      }
    }, 3000);
  }
  
  // Apply theme to app
  function applyTheme(theme) {
    document.body.className = theme;
    
    // Store the active theme
    if (window.api && window.api.setStoredItem) {
      window.api.setStoredItem('theme_preference', theme);
    } else {
      localStorage.setItem('theme_preference', theme);
    }
  }
  
  // Function to load API providers
  function loadAPIProviders() {
    const apiProvidersList = document.getElementById('apiProvidersList');
    const defaultProviderSelect = document.getElementById('defaultProviderSelect');
    
    if (!apiProvidersList || !defaultProviderSelect) {
      return;
    }
    
    // Clear existing providers
    apiProvidersList.innerHTML = '';
    
    // Get providers
    const providers = currentSettings.apiProviders || [];
    
    // Get default provider
    let defaultProvider = '';
    if (window.api && window.api.getStoredItem) {
      defaultProvider = window.api.getStoredItem('default_api_provider') || '';
    } else {
      defaultProvider = localStorage.getItem('default_api_provider') || '';
    }
    
    // Clear default provider select
    defaultProviderSelect.innerHTML = '<option value="">Seleziona un provider</option>';
    
    // Add providers to list and select
    providers.forEach((provider, index) => {
      // Add to list
      const providerItem = document.createElement('div');
      providerItem.className = 'provider-item';
      providerItem.innerHTML = `
        <div class="provider-name">${provider.name}</div>
        <div class="provider-model">${provider.model}</div>
        <div class="provider-actions">
          <button class="edit-provider-btn" data-index="${index}">
            <i class="fas fa-edit"></i>
          </button>
          <button class="delete-provider-btn" data-index="${index}">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `;
      apiProvidersList.appendChild(providerItem);
      
      // Add to select
      const option = document.createElement('option');
      option.value = provider.name;
      option.textContent = provider.name;
      if (provider.name === defaultProvider) {
        option.selected = true;
      }
      defaultProviderSelect.appendChild(option);
    });
    
    // Add event listeners to edit/delete buttons
    const editButtons = document.querySelectorAll('.edit-provider-btn');
    const deleteButtons = document.querySelectorAll('.delete-provider-btn');
    
    editButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const index = button.getAttribute('data-index');
        editProvider(index);
      });
    });
    
    deleteButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const index = button.getAttribute('data-index');
        deleteProvider(index);
      });
    });
  }
  
  // Function to edit provider
  function editProvider(index) {
    const providers = currentSettings.apiProviders || [];
    const provider = providers[index];
    
    if (!provider) {
      return;
    }
    
    // Show form
    const addProviderForm = document.getElementById('addProviderForm');
    const addProviderBtn = document.getElementById('addProviderBtn');
    
    if (addProviderForm && addProviderBtn) {
      addProviderForm.style.display = 'block';
      addProviderBtn.style.display = 'none';
    }
    
    // Populate form
    document.getElementById('providerNameInput').value = provider.name;
    document.getElementById('apiKeyInput').value = provider.apiKey;
    document.getElementById('apiEndpointInput').value = provider.endpoint || '';
    document.getElementById('modelNameInput').value = provider.model;
    document.getElementById('temperatureInput').value = provider.temperature;
    
    // Tag the form as editing
    addProviderForm.setAttribute('data-edit-index', index);
    
    // Update save button text
    const saveProviderBtn = document.getElementById('saveProviderBtn');
    if (saveProviderBtn) {
      saveProviderBtn.textContent = 'Aggiorna Provider';
    }
  }
  
  // Function to delete provider
  function deleteProvider(index) {
    if (!confirm('Sei sicuro di voler eliminare questo provider?')) {
      return;
    }
    
    const providers = currentSettings.apiProviders || [];
    
    // Remove provider
    providers.splice(index, 1);
    
    // Update settings
    currentSettings.apiProviders = providers;
    
    // Save settings
    saveSettingsData();
    
    // Refresh providers list
    loadAPIProviders();
  }
  
  // Event listeners for general settings
  document.querySelectorAll('#general-settings select, #general-settings input').forEach(element => {
    element.addEventListener('change', (e) => {
      const settingId = e.target.id;
      const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      
      // Update settings based on ID
      switch (settingId) {
        case 'languageSelect':
          currentSettings.general.language = value;
          break;
        case 'themeSelect':
          currentSettings.general.theme = value;
          applyTheme(value);
          break;
        case 'fontSizeSelect':
          currentSettings.general.fontSize = value;
          break;
        case 'animationsToggle':
          currentSettings.general.animations = value;
          break;
        case 'startPageSelect':
          currentSettings.general.startPage = value;
          break;
      }
      
      // Save settings
      saveSettingsData();
    });
  });
  
  // Global save button
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');
  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      saveSettingsData();
    });
  }
  
  // LLM API settings event listeners
  const saveProviderBtn = document.getElementById('saveProviderBtn');
  if (saveProviderBtn) {
    saveProviderBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const addProviderForm = document.getElementById('addProviderForm');
      const providerName = document.getElementById('providerNameInput').value;
      const apiKey = document.getElementById('apiKeyInput').value;
      const apiEndpoint = document.getElementById('apiEndpointInput').value;
      const modelName = document.getElementById('modelNameInput').value;
      const temperature = document.getElementById('temperatureInput').value;
      
      if (!providerName || !apiKey || !modelName) {
        showToast('Per favore, compila tutti i campi richiesti', 'error');
        return;
      }
      
      // Check if editing or adding new
      const editIndex = addProviderForm.getAttribute('data-edit-index');
      
      // Create provider object
      const provider = {
        name: providerName,
        apiKey: apiKey,
        endpoint: apiEndpoint,
        model: modelName,
        temperature: parseFloat(temperature)
      };
      
      // Get current providers
      const providers = currentSettings.apiProviders || [];
      
      if (editIndex !== null) {
        // Update existing provider
        providers[editIndex] = provider;
        showToast('Provider aggiornato con successo');
      } else {
        // Add new provider
        providers.push(provider);
        showToast('Nuovo provider aggiunto');
      }
      
      // Update settings
      currentSettings.apiProviders = providers;
      
      // Save settings
      saveSettingsData();
      
      // Reset form
      addProviderForm.style.display = 'none';
      addProviderForm.removeAttribute('data-edit-index');
      document.getElementById('addProviderBtn').style.display = 'block';
      
      // Reset save button text
      saveProviderBtn.textContent = 'Salva Provider';
      
      // Clear form
      document.getElementById('providerNameInput').value = '';
      document.getElementById('apiKeyInput').value = '';
      document.getElementById('apiEndpointInput').value = '';
      document.getElementById('modelNameInput').value = '';
      document.getElementById('temperatureInput').value = '0.7';
      
      // Refresh providers list
      loadAPIProviders();
    });
  }
  
  // Cancel add provider
  const cancelAddProviderBtn = document.getElementById('cancelAddProviderBtn');
  if (cancelAddProviderBtn) {
    cancelAddProviderBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Hide form
      const addProviderForm = document.getElementById('addProviderForm');
      if (addProviderForm) {
        addProviderForm.style.display = 'none';
        addProviderForm.removeAttribute('data-edit-index');
      }
      
      // Show add button
      const addProviderBtn = document.getElementById('addProviderBtn');
      if (addProviderBtn) {
        addProviderBtn.style.display = 'block';
      }
      
      // Reset save button text
      const saveProviderBtn = document.getElementById('saveProviderBtn');
      if (saveProviderBtn) {
        saveProviderBtn.textContent = 'Salva Provider';
      }
    });
  }
  
  // Show add provider form
  const addProviderBtn = document.getElementById('addProviderBtn');
  if (addProviderBtn) {
    addProviderBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Show form
      const addProviderForm = document.getElementById('addProviderForm');
      if (addProviderForm) {
        addProviderForm.style.display = 'block';
        addProviderForm.removeAttribute('data-edit-index');
      }
      
      // Hide add button
      addProviderBtn.style.display = 'none';
    });
  }
  
  // Toggle API key visibility
  const toggleApiKeyVisibility = document.getElementById('toggleApiKeyVisibility');
  const apiKeyInput = document.getElementById('apiKeyInput');
  
  if (toggleApiKeyVisibility && apiKeyInput) {
    toggleApiKeyVisibility.addEventListener('click', () => {
      if (apiKeyInput.type === 'password') {
        apiKeyInput.type = 'text';
        toggleApiKeyVisibility.innerHTML = '<i class="fas fa-eye-slash"></i>';
      } else {
        apiKeyInput.type = 'password';
        toggleApiKeyVisibility.innerHTML = '<i class="fas fa-eye"></i>';
      }
    });
  }
  
  // Initialize settings on load
  function initSettings() {
    loadSettingsData();
  }
  
  // Initialize settings
  initSettings();
}); 