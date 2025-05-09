// Renderer process script for Synapse Chat App

// At the very beginning of your renderer.js file, add:
console.log('Renderer script starting...');
console.log('Testing window.api availability:', window.api ? 'Available' : 'Not available');

// Create a fallback API object if window.api is not available
if (!window.api) {
  console.warn('window.api is not available! Creating fallback API for development.');
  window.api = {
    minimizeWindow: () => {
      console.log('FALLBACK: Minimize window called - not functional in fallback mode');
      // In a browser environment, we can't minimize, but we can provide feedback
      alert('Minimize window was clicked, but this function requires Electron API access.');
    },
    maximizeWindow: () => {
      console.log('FALLBACK: Maximize window called - not functional in fallback mode');
      alert('Maximize window was clicked, but this function requires Electron API access.');
    },
    closeWindow: () => {
      console.log('FALLBACK: Close window called - using window.close() as fallback');
      if (confirm('Do you want to close this window?')) {
        window.close();
      }
    },
    testApi: () => 'API FALLBACK MODE',
    // Add other API methods as needed with fallback implementations
  };
} else {
  console.log('API test result:', window.api.testApi());
}

// --- Global Variables ---
// Chat history from storage
let chats = [];
let currentChatId = null;
let currentChat = { id: null, messages: [] };
// LLM API Providers data
let llmProviders = [];
let defaultProvider = '';
// NSN data
let nsnNeurons = {};
let activeNsnTab = 'neurons';
// Tab Counter (Might not be strictly needed if using Date.now() for IDs)
let tabCounter = 1;

// Importazione di Sortable.js
// let Sortable; // Definiamo la variabile globalmente per rendere disponibile Sortable
// try {
//     Sortable = require('sortablejs');
// } catch (error) {
//     console.error('Errore nel caricamento di SortableJS:', error);
// }

// <<<<<<<<<<<< START OF SINGLE DOMContentLoaded LISTENER >>>>>>>>>>>>>>>>>>
// Sortable verrà caricato dinamicamente via CDN

// <<<<<<<<<<<< START OF SINGLE DOMContentLoaded LISTENER >>>>>>>>>>>>>>>>>>
document.addEventListener('DOMContentLoaded', () => {
  console.log('SINGLE DOMContentLoaded event fired. Setting up UI...');

  // --- API Test ---
  console.log('Renderer: Testing API availability');
  if (window.api) {
    console.log('Renderer: API is available');
    console.log('Renderer: API test result:', window.api.testApi());
  } else {
    console.error('Renderer: API is not available');
  }

  // --- DOM Element Selection (Defined ONCE here) ---
  const userInput = document.getElementById('userInput');
  const sendBtn = document.getElementById('sendBtn');
  const voiceBtn = document.getElementById('voiceBtn');
  const textSendBtn = document.getElementById('textSendBtn');
  const chatMessages = document.getElementById('chatMessages');
  const thoughtBtn = document.getElementById('thoughtBtn');
  const searchBtn = document.getElementById('searchBtn');
  const mcpBtn = document.getElementById('mcpBtn');
  const addBtn = document.getElementById('addBtn'); // Keep if used elsewhere
  const codeBtn = document.getElementById('codeBtn');
  const imageBtn = document.getElementById('imageBtn');
  const videoBtn = document.getElementById('videoBtn');
  const shortcutBtns = document.querySelectorAll('.shortcut-btn');
  const sidebar = document.getElementById('sidebar');
  const toggleSidebarBtn = document.getElementById('toggleSidebarBtn');
  const tabButtonsContainer = document.getElementById('tabButtonsContainer');
  const addTabBtn = document.getElementById('addTabBtn'); // Tab add button (+)
  const homeTab = document.getElementById('homeTab');
  const toggleTabsBtn = document.getElementById('toggleTabsBtn'); // Eye button
  const dynamicTabsWrapper = document.getElementById('dynamicTabsWrapper'); // Tab container
  const minimizeBtn = document.getElementById('minimizeBtn');
  const maximizeBtn = document.getElementById('maximizeBtn');
  const closeBtn = document.getElementById('closeBtn');
  const fileMenu = document.getElementById('fileMenu');
  const editMenu = document.getElementById('editMenu');
  const selectionMenu = document.getElementById('selectionMenu');
  const viewMenu = document.getElementById('viewMenu');
  const goMenu = document.getElementById('goMenu');
  const terminalMenu = document.getElementById('terminalMenu');
  const helpMenu = document.getElementById('helpMenu');
  const newChatBtn = document.getElementById('newChatBtn'); // Sidebar new chat
  const settingsBtn = document.getElementById('settingsBtn');
  const settingsModal = document.getElementById('settingsModal');
  const closeSettingsBtn = document.getElementById('closeSettingsBtn');
  const settingsCategoryTitle = document.getElementById('settingsCategoryTitle');
  const settingsCategories = document.querySelectorAll('.settings-category');
  const settingsSections = document.querySelectorAll('.settings-section');
  const defaultProviderSelect = document.getElementById('defaultProviderSelect');
  const apiProvidersList = document.getElementById('apiProvidersList');
  const addProviderBtnForm = document.getElementById('addProviderBtn'); // Provider form add btn - Use different name to avoid conflict
  const addProviderForm = document.getElementById('addProviderForm');
  const providerNameInput = document.getElementById('providerNameInput');
  const apiKeyInput = document.getElementById('apiKeyInput');
  const toggleApiKeyVisibility = document.getElementById('toggleApiKeyVisibility');
  const apiEndpointInput = document.getElementById('apiEndpointInput');
  const modelNameInput = document.getElementById('modelNameInput');
  const temperatureInput = document.getElementById('temperatureInput');
  const saveProviderBtn = document.getElementById('saveProviderBtn'); // Provider form save btn
  const cancelAddProviderBtn = document.getElementById('cancelAddProviderBtn');
  const languageSelect = document.getElementById('languageSelect');
  const themeSelect = document.getElementById('themeSelect');
  const notificationToggle = document.getElementById('notificationToggle');
  const soundToggle = document.getElementById('soundToggle');
  const historyToggle = document.getElementById('historyToggle');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');
  const nsnStatusIcon = document.getElementById('nsnStatusIcon');
  const nsnStatusText = document.getElementById('nsnStatusText');
  const nsnSectionSelect = document.getElementById('nsnSectionSelect');
  const nsnNeuronsList = document.getElementById('nsnNeuronsList');
  const addNeuronBtn = document.getElementById('addNeuronBtn'); // NSN add neuron btn
  const addNeuronForm = document.getElementById('addNeuronForm');
  const neuronConceptInput = document.getElementById('neuronConceptInput');
  const neuronSectionSelect = document.getElementById('neuronSectionSelect');
  const neuronConnectionsList = document.getElementById('neuronConnectionsList');
  const addConnectionBtn = document.getElementById('addConnectionBtn');
  const saveNeuronBtn = document.getElementById('saveNeuronBtn'); // NSN save neuron btn
  const cancelAddNeuronBtn = document.getElementById('cancelAddNeuronBtn');
  const nsnTabs = document.querySelectorAll('.nsn-tab');
  const nsnTabContents = document.querySelectorAll('.nsn-tab-content');
  const nsnVisualization = document.getElementById('nsnVisualization');
  const nsnActivationInput = document.getElementById('nsnActivationInput');
  const nsnCurrentInput = document.getElementById('nsnCurrentInput');
  const activateNeuronBtn = document.getElementById('activateNeuronBtn');
  const nsnActivationResult = document.getElementById('nsnActivationResult');
  const addWebUrlBtn = document.getElementById('addWebUrlBtn');
  const webUrlForm = document.getElementById('webUrlForm');
  const webUrlInput = document.getElementById('webUrlInput');
  const processUrlBtn = document.getElementById('processUrlBtn');
  const cancelWebUrlBtn = document.getElementById('cancelWebUrlBtn');
  const webUrlResult = document.getElementById('webUrlResult');

  // --- Function Definitions (Defined within scope where appropriate) ---

  // Function to reset action buttons
  function resetActionButtons() {
    const buttonsToReset = [thoughtBtn, searchBtn, mcpBtn, codeBtn, imageBtn, videoBtn].filter(btn => btn);
    buttonsToReset.forEach(btn => btn.classList.remove('active'));
  }

  // Function to update window title
  const updateWindowTitle = () => {
    const windowTitle = document.querySelector('.window-title');
    if (windowTitle) windowTitle.textContent = document.title || 'Synapse';
  };

  // Function to reset provider form
  function resetProviderForm() {
    if(providerNameInput) providerNameInput.value = '';
    if(apiKeyInput) { apiKeyInput.value = ''; apiKeyInput.type = 'password'; }
    if(toggleApiKeyVisibility) toggleApiKeyVisibility.innerHTML = '<i class="fas fa-eye"></i>';
    if(apiEndpointInput) apiEndpointInput.value = '';
    if(modelNameInput) modelNameInput.value = '';
    if(temperatureInput) temperatureInput.value = '0.7';
    if(saveProviderBtn){
        saveProviderBtn.textContent = 'Salva Provider';
        saveProviderBtn.dataset.mode = 'add';
        delete saveProviderBtn.dataset.providerId;
        saveProviderBtn.onclick = handleSaveProviderAdd; // Point to global function
    }
  }

  // Function to reset NSN neuron form
  function resetNeuronForm() {
    if(neuronConceptInput) neuronConceptInput.value = '';
    if(neuronSectionSelect) neuronSectionSelect.value = 'Physics'; // Or your default
    if(neuronConnectionsList) neuronConnectionsList.innerHTML = '';
  }

   // Function to add a neuron connection to the form
   function addNeuronConnection() {
        if(!neuronConnectionsList) return;
        const item = document.createElement('div'); item.className = 'nsn-connection-item';
        const select = document.createElement('select'); select.className = 'nsn-connection-select';
        // Assuming nsnNeurons is accessible globally
        Object.keys(nsnNeurons).forEach(section => {
            const group = document.createElement('optgroup'); group.label = section;
            nsnNeurons[section].forEach(concept => {
                const opt = document.createElement('option'); opt.value = JSON.stringify({ concept, section }); opt.textContent = concept;
                group.appendChild(opt);
            });
            select.appendChild(group);
        });
        const input = document.createElement('input'); input.type = 'number'; input.className = 'nsn-probability-input'; input.min = '0'; input.max = '1'; input.step = '0.1'; input.value = '0.5';
        const removeBtn = document.createElement('button'); removeBtn.className = 'nsn-remove-connection'; removeBtn.innerHTML = '<i class="fas fa-times"></i>';
        removeBtn.addEventListener('click', () => item.remove());
        item.appendChild(select); item.appendChild(input); item.appendChild(removeBtn);
        neuronConnectionsList.appendChild(item);
    }

  // --- Event Listener Setup ---

  // Abilita scroll orizzontale con rotellina verticale su tab wrapper
  if (dynamicTabsWrapper) {
      dynamicTabsWrapper.addEventListener('wheel', (event) => {
          // Se l'utente sta usando la rotellina verticale (deltaY != 0)
          // e non sta già scrollando orizzontalmente con un touchpad/etc (deltaX == 0)
          // oppure se lo scroll orizzontale è talmente piccolo da essere trascurabile
          if (event.deltaY !== 0 && Math.abs(event.deltaX) < 1) {
              // Previene lo scroll verticale della pagina intera
              event.preventDefault();

              // Applica lo scroll orizzontale al wrapper delle tab
              // Moltiplicatore (es. 0.5 o 1) per aggiustare la velocità/sensibilità
              dynamicTabsWrapper.scrollLeft += event.deltaY * 0.7;
          }
          // Non preveniamo il default se deltaX è significativo (scroll orizzontale nativo)
      }, { passive: false }); // passive: false è necessario per poter usare preventDefault
      console.log("Wheel event listener added to dynamicTabsWrapper for horizontal scrolling.");
  } else {
      console.error("Dynamic tabs wrapper not found for wheel event listener!");
  }

  // Window Controls
  if (minimizeBtn) minimizeBtn.addEventListener('click', (e) => { 
    e.stopPropagation(); 
    e.preventDefault(); 
    console.log('[Window Control] Minimize button clicked at', new Date().toISOString());
    if(window.api) {
      window.api.minimizeWindow();
      console.log('[Window Control] Minimize window command sent successfully');
    } else {
      console.error('[Window Control] Error: window.api is not available');
    }
  });
  
  if (maximizeBtn) maximizeBtn.addEventListener('click', (e) => { 
    e.stopPropagation(); 
    e.preventDefault(); 
    console.log('[Window Control] Maximize button clicked at', new Date().toISOString());
    if(window.api) {
      window.api.maximizeWindow();
      console.log('[Window Control] Maximize window command sent successfully');
    } else {
      console.error('[Window Control] Error: window.api is not available');
    }
  });
  
  if (closeBtn) closeBtn.addEventListener('click', (e) => { 
    e.stopPropagation(); 
    e.preventDefault(); 
    console.log('[Window Control] Close button clicked at', new Date().toISOString());
    if(window.api) {
      window.api.closeWindow();
      console.log('[Window Control] Close window command sent successfully');
    } else {
      console.error('[Window Control] Error: window.api is not available');
    }
  });

  // Menu Items
  if (fileMenu) fileMenu.addEventListener('click', () => console.log('File menu clicked'));
  if (editMenu) editMenu.addEventListener('click', () => console.log('Edit menu clicked'));
  if (selectionMenu) selectionMenu.addEventListener('click', () => console.log('Selection menu clicked'));
  if (viewMenu) viewMenu.addEventListener('click', () => console.log('View menu clicked'));
  if (goMenu) goMenu.addEventListener('click', () => console.log('Go menu clicked'));
  if (terminalMenu) terminalMenu.addEventListener('click', () => console.log('Terminal menu clicked'));
  if (helpMenu) helpMenu.addEventListener('click', () => console.log('Help menu clicked'));

  // Window Title Observer
  if (document.querySelector('title')) {
    const titleObserver = new MutationObserver(updateWindowTitle); // Uses function defined above
    titleObserver.observe(document.querySelector('title'), { childList: true });
  } else { console.error("Title element not found for observer"); }

  // Text Area Auto-Resize
  if (userInput) userInput.addEventListener('input', () => { userInput.style.height = 'auto'; userInput.style.height = (userInput.scrollHeight) + 'px'; });

  // New Chat Button (Sidebar)
  if (newChatBtn) newChatBtn.addEventListener('click', startNewChat); // Uses global startNewChat

  // Add Tab Context Menu (+)
  if (addTabBtn) {
    addTabBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      const existingMenu = document.querySelector('.dynamic-context-menu');
      if (existingMenu) { document.body.removeChild(existingMenu); return; }
      
      // Create menu elements
      const contextMenu = document.createElement('div'); contextMenu.className = 'dynamic-context-menu';
      const workflowItem = document.createElement('div'); workflowItem.className = 'context-menu-item'; workflowItem.dataset.tabType = 'workflow'; workflowItem.innerHTML = '<i class="fas fa-project-diagram"></i> Workflow';
      const chatItem = document.createElement('div'); chatItem.className = 'context-menu-item'; chatItem.dataset.tabType = 'chat'; chatItem.innerHTML = '<i class="fas fa-comment-dots"></i> Nuova Chat';
      const calendarItem = document.createElement('div'); calendarItem.className = 'context-menu-item'; calendarItem.dataset.tabType = 'calendar'; calendarItem.innerHTML = '<i class="fas fa-calendar"></i> Calendario';
      const communityItem = document.createElement('div'); communityItem.className = 'context-menu-item'; communityItem.dataset.tabType = 'community'; communityItem.innerHTML = '<i class="fas fa-users"></i> Community';
      contextMenu.appendChild(workflowItem); contextMenu.appendChild(chatItem); contextMenu.appendChild(calendarItem); contextMenu.appendChild(communityItem);
      
      // Set base styles needed for measurement
      contextMenu.style.position = 'fixed';
      contextMenu.style.visibility = 'hidden'; // Hide while measuring
      contextMenu.style.zIndex = '9999';
      contextMenu.style.backgroundColor = '#2c2c2c';
      contextMenu.style.border = '1px solid #444444';
      contextMenu.style.borderRadius = '8px';
      contextMenu.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
      contextMenu.style.padding = '6px';
      contextMenu.style.minWidth = '200px'; 
      contextMenu.style.fontFamily = '"Segoe UI", sans-serif';

      // Append to body temporarily to measure offsetWidth
      document.body.appendChild(contextMenu);
      const menuWidth = contextMenu.offsetWidth;
      const menuHeight = contextMenu.offsetHeight; // Might need height check later
      document.body.removeChild(contextMenu); // Remove immediately after measuring

      // Calculate position with boundary checks
      const buttonRect = addTabBtn.getBoundingClientRect();
      const buffer = 5; // Small space between button and menu

      let top = buttonRect.top;
      let left = buttonRect.right + buffer;

      // Check right boundary
      if (left + menuWidth > window.innerWidth) {
        left = buttonRect.left - menuWidth - buffer; // Position to the left
        // Ensure it doesn't go off-screen left (optional, less likely for '+' button)
        if (left < 0) {
            left = buffer; 
        }
      }
      
      // Check bottom boundary (optional but good practice)
      if (top + menuHeight > window.innerHeight) {
          top = window.innerHeight - menuHeight - buffer;
          if (top < 0) { // Ensure it doesn't go off-screen top
              top = buffer;
          }
      }
      
      // Apply final position and make visible
      contextMenu.style.top = `${top}px`;
      contextMenu.style.left = `${left}px`;
      contextMenu.style.visibility = 'visible'; // Make it visible

      document.body.appendChild(contextMenu);
      
      // Menu item click listener
      contextMenu.addEventListener('click', (e) => {
          const menuItem = e.target.closest('.context-menu-item');
          if (menuItem) {
              const tabType = menuItem.dataset.tabType;
              console.log(`Menu item clicked: Creating tab of type: ${tabType}`);
              switch (tabType) { // Uses global createNewTabButton
                  case 'workflow': createNewTabButton('Workflow', 'fa-project-diagram', 'workflow-' + Date.now()); break;
                  case 'chat': createNewTabButton('Nuova Chat', 'fa-comment-dots'); break;
                  case 'calendar': createNewTabButton('Calendario', 'fa-calendar', 'calendar-' + Date.now()); break;
                  case 'community': createNewTabButton('Community', 'fa-users', 'community-' + Date.now()); break;
              }
              if(document.body.contains(contextMenu)) document.body.removeChild(contextMenu);
          }
      });
      setTimeout(() => { // Outside click listener
          document.addEventListener('click', function closeMenuOnClickOutside(e) {
              if (document.body.contains(contextMenu) && !contextMenu.contains(e.target) && !addTabBtn.contains(e.target)) {
                  document.body.removeChild(contextMenu);
                  document.removeEventListener('click', closeMenuOnClickOutside);
              }
          });
      }, 50);
    });
  } else { console.error("Add tab (+) button not found"); }

  // Home Tab
  if (homeTab) {
    homeTab.addEventListener('click', () => {
      showLandingPage(); // Uses global showLandingPage
    });
  } else { console.error("Home tab button not found"); }

  // Send Buttons & Input Keydown
  if (sendBtn) sendBtn.addEventListener('click', startVoiceRecording); // Uses global startVoiceRecording
  if (textSendBtn) textSendBtn.addEventListener('click', sendMessage); // Uses global sendMessage
  if (voiceBtn) voiceBtn.addEventListener('click', startVoiceRecording);
  if (userInput) userInput.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } });

  // Toggle Sidebar
  if (toggleSidebarBtn && sidebar) {
    toggleSidebarBtn.addEventListener('click', () => {
      const isCollapsed = sidebar.classList.toggle('collapsed');
      toggleSidebarBtn.innerHTML = isCollapsed ? '<i class="fas fa-chevron-right"></i>' : '<i class="fas fa-chevron-left"></i>';
      if (window.api) window.api.saveSettings('sidebarCollapsed', isCollapsed);
      if (!isCollapsed) renderChatHistorySidebar(); // Uses global renderChatHistorySidebar
    });
  } else { /* Log missing elements */ }

  // Action Buttons
  const actionButtonElements = [thoughtBtn, searchBtn, mcpBtn, codeBtn, imageBtn, videoBtn].filter(btn => btn);
  actionButtonElements.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const buttonId = e.currentTarget.id;
        const isActive = e.currentTarget.classList.contains('active');
        resetActionButtons(); // Call function defined above
        if (!isActive) {
            e.currentTarget.classList.add('active');
            let prefix = '';
            switch(buttonId) {
                case 'thoughtBtn': prefix = '[Thinking...]'; break;
                case 'searchBtn': prefix = '[Searching...]'; break;
                case 'mcpBtn': prefix = '[Using MCP...]'; break;
                case 'codeBtn': prefix = '[Code:]'; break;
                case 'imageBtn': prefix = '[Generate image:]'; break;
                case 'videoBtn': prefix = '[Generate video:]'; break;
            }
            if (userInput) userInput.value += ` ${prefix} `; else console.error("User input missing for action btn");
        }
        if (userInput) userInput.focus();
    });
  });

  // Shortcut Buttons
  shortcutBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const action = btn.querySelector('span')?.textContent;
        if (action && userInput) { userInput.value = `${action}: `; userInput.focus(); }
        else { console.error("Shortcut button action/input missing"); }
    });
  });

  // Settings Modal
  if (settingsBtn && settingsModal && closeSettingsBtn) {
    settingsBtn.addEventListener('click', () => { settingsModal.style.display = 'block'; settingsModal.classList.add('active'); loadSettings(); }); // Uses global loadSettings
    closeSettingsBtn.addEventListener('click', () => { settingsModal.style.display = 'none'; settingsModal.classList.remove('active'); });
  } else { /* Log missing elements */ }

  // Settings Navigation
  settingsCategories.forEach(category => {
    category.addEventListener('click', () => {
        settingsCategories.forEach(c => c.classList.remove('active'));
        category.classList.add('active');
        if (settingsCategoryTitle) settingsCategoryTitle.textContent = category.querySelector('span')?.textContent || 'Settings';
        const categoryId = category.dataset.category;
        settingsSections.forEach(section => { section.style.display = section.id === `${categoryId}-settings` ? 'block' : 'none'; });
        if (categoryId === 'nsn') initializeNSNInterface(); // Uses global initializeNSNInterface
    });
  });

  // API Key Visibility Toggle
  if (toggleApiKeyVisibility && apiKeyInput) {
    toggleApiKeyVisibility.addEventListener('click', () => {
        const type = apiKeyInput.type;
        apiKeyInput.type = type === 'password' ? 'text' : 'password';
        toggleApiKeyVisibility.innerHTML = type === 'password' ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
    });
  } else { /* Log missing elements */ }

  // LLM Provider Form Logic
  if (addProviderBtnForm && addProviderForm && apiProvidersList) { // Use addProviderBtnForm
    addProviderBtnForm.addEventListener('click', () => {
        addProviderForm.style.display = 'block';
        addProviderBtnForm.style.display = 'none'; // Hide this button
        apiProvidersList.style.display = 'none';
        resetProviderForm(); // Calls function defined above
    });
  } else { /* Log which one is missing */ }

  if (cancelAddProviderBtn && addProviderForm && addProviderBtnForm && apiProvidersList) {
    cancelAddProviderBtn.addEventListener('click', () => {
        addProviderForm.style.display = 'none';
        addProviderBtnForm.style.display = 'block'; // Show the add button again
        apiProvidersList.style.display = 'block';
        resetProviderForm(); // Calls function defined above
        if(saveProviderBtn) saveProviderBtn.onclick = handleSaveProviderAdd; // Reset to add handler
    });
  } else { /* Log */ }

  // Set initial save handler for provider form
  if (saveProviderBtn) saveProviderBtn.onclick = handleSaveProviderAdd; // Uses global handleSaveProviderAdd

  // Default Provider Select Change
  if (defaultProviderSelect) defaultProviderSelect.addEventListener('change', () => { defaultProvider = defaultProviderSelect.value; saveSettings(); }); // Uses global saveSettings

  // General Settings Handlers
  if(languageSelect) languageSelect.addEventListener('change', saveSettings);
  if(themeSelect) themeSelect.addEventListener('change', saveSettings);
  if(notificationToggle) notificationToggle.addEventListener('change', saveSettings);
  if(soundToggle) soundToggle.addEventListener('change', saveSettings);
  if(historyToggle) historyToggle.addEventListener('change', saveSettings);

  // Clear History Button
  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', () => {
        if (confirm('Sei sicuro di voler cancellare tutta la cronologia delle chat?')) {
            console.log('Clearing chat history');
            chats = []; currentChatId = null; currentChat = { id: null, messages: [] };
            if (chatMessages) chatMessages.innerHTML = '';
            renderChatHistorySidebar(); // Uses global function
            if (window.api) window.api.saveChatHistory(chats);
        }
    });
  } else { console.error("Clear history button not found"); }

  // NSN Interface Setup Listeners
  if (addNeuronBtn && addNeuronForm && addWebUrlBtn && webUrlForm) { addNeuronBtn.addEventListener('click', () => { addNeuronForm.style.display='block'; webUrlForm.style.display='none'; addNeuronBtn.style.display='none'; addWebUrlBtn.style.display='none'; if(neuronConnectionsList) neuronConnectionsList.innerHTML=''; if(saveNeuronBtn) saveNeuronBtn.onclick=handleSaveNsnNeuronAdd;}); } else { /* Log */ }
  if (cancelAddNeuronBtn && addNeuronForm && addNeuronBtn && addWebUrlBtn) { cancelAddNeuronBtn.addEventListener('click', () => { addNeuronForm.style.display='none'; addNeuronBtn.style.display='block'; addWebUrlBtn.style.display='block'; resetNeuronForm(); if(saveNeuronBtn) saveNeuronBtn.onclick=null; }); } else { /* Log */ }
  if (addWebUrlBtn && webUrlForm && addNeuronForm && addNeuronBtn) { addWebUrlBtn.addEventListener('click', () => { webUrlForm.style.display='block'; addNeuronForm.style.display='none'; addNeuronBtn.style.display='none'; addWebUrlBtn.style.display='none'; if(webUrlResult) webUrlResult.style.display='none'; if(webUrlInput) webUrlInput.value='';}); } else { /* Log */ }
  if (cancelWebUrlBtn && webUrlForm && addNeuronBtn && addWebUrlBtn) { cancelWebUrlBtn.addEventListener('click', () => { webUrlForm.style.display='none'; addNeuronBtn.style.display='block'; addWebUrlBtn.style.display='block'; if(webUrlInput) webUrlInput.value=''; }); } else { /* Log */ }
  if (addConnectionBtn) addConnectionBtn.addEventListener('click', addNeuronConnection); // Calls function defined above
  if (saveNeuronBtn) saveNeuronBtn.onclick = handleSaveNsnNeuronAdd; // Uses global function
  if (nsnSectionSelect) nsnSectionSelect.addEventListener('change', renderNeuronsList); // Uses global function
  nsnTabs.forEach(tab => { tab.addEventListener('click', () => { /* NSN Tab logic */ }); });
  if (activateNeuronBtn && nsnActivationInput && nsnCurrentInput && nsnActivationResult) { activateNeuronBtn.addEventListener('click', handleActivateNeuron); /* Uses global function */ } else { /* Log */ }
  if(processUrlBtn && webUrlInput && webUrlResult) { processUrlBtn.addEventListener('click', handleProcessWebUrl); /* Uses global function */ } else { /* Log */ }

  // --- Initial Load / Setup Calls ---
  updateWindowTitle(); // Initial title set
  loadSettings(); // Load settings (Uses global function)
  // Load chat history
  try {
      if (window.api) {
        chats = window.api.getChatHistory() || [];
        if (chats.length > 0) {
           // currentChatId = chats[0].id; // Don't automatically select first chat maybe?
           // currentChat = chats[0];
        }
      } else {
           console.error("API unavailable during initial chat history load");
      }
  } catch(e) { console.error("Error loading chat history on init:", e); }
  renderChatHistorySidebar(); // Render initial sidebar (Uses global)
  // Show landing page IF no specific chat is loaded/selected initially
  if (!currentChatId) {
      showLandingPage(); // Show initial view (Uses global function)
  } else {
      // If a chat was pre-selected (e.g., last session), render it
      renderCurrentChat(); // Render the loaded chat
      // Find and activate its tab if tabs are persisted (not implemented yet)
      const activeTab = document.getElementById(currentChatId);
      if(activeTab) activeTab.click(); else console.warn("Initial chat loaded, but no corresponding tab found.")
  }

  // --- Thumbnail Bar & JumpList Handlers ---
  if (window.api) {
    window.api.onThumbnailCamera(() => { console.log('Thumbnail Camera'); toggleCamera(); }); // Uses global toggleCamera
    window.api.onThumbnailVideo(() => { console.log('Thumbnail Video'); toggleVideo(); }); // Uses global toggleVideo
    window.api.onThumbnailWorkflow(() => { console.log('Thumbnail Workflow'); createNewTabButton('Workflow', 'fa-project-diagram', 'workflow-' + Date.now()); }); // Uses global createNewTabButton
    window.api.onThumbnailVoice(() => { console.log('Thumbnail Voice'); toggleVoiceRecognition(); }); // Uses global toggleVoiceRecognition
    window.api.onCreateNewChat(() => { console.log('JumpList: New Chat'); createNewTabButton('Nuova Chat', 'fa-comment-dots'); });
    window.api.onCreateNewWorkflow(() => { console.log('JumpList: New Workflow'); createNewTabButton('Workflow', 'fa-project-diagram', 'workflow-' + Date.now()); });
  }

  console.log("Single DOMContentLoaded setup complete.");

  // Verifica se l'utente è nuovo e in tal caso mostra la pagina di onboarding
  const isFirstTime = !localStorage.getItem('synapse_onboarded');
  
  // Verifica se ci sono parametri URL che indicano di aprire direttamente il canvas
  const urlParams = new URLSearchParams(window.location.search);
  const openCanvas = urlParams.get('canvas');
  
  if (isFirstTime && !openCanvas) {
    // Mostra la pagina di onboarding
    showOnboardingPage();
  } else if (openCanvas === 'new') {
    // Apri direttamente un nuovo canvas
    openNewWorkflowTab();
  }
  
  // Imposta il flag di onboarding completato nel local storage
  localStorage.setItem('synapse_onboarded', 'true');
}); // <<<<<<<<<<<<<<<<<<<<< END OF SINGLE DOMContentLoaded LISTENER <<<<<<<<<<<<<<<<<<<<<


// -----------------------------------------------------------------------------
// ---- Functions defined OUTSIDE DOMContentLoaded (globally accessible) ----
// -----------------------------------------------------------------------------

function startVoiceRecording() { console.log('Voice recording started...'); /* Add impl */ }

function sendMessage() {
    const userInput = document.getElementById('userInput');
    const message = userInput ? userInput.value.trim() : '';
    if (message === '' || !userInput) return;
    addMessageToChat('user', message);
    userInput.value = '';
    userInput.style.height = 'auto';
    // Reset action buttons requires getting them again
    const thoughtBtn = document.getElementById('thoughtBtn');
    const searchBtn = document.getElementById('searchBtn');
    const mcpBtn = document.getElementById('mcpBtn');
    const codeBtn = document.getElementById('codeBtn');
    const imageBtn = document.getElementById('imageBtn');
    const videoBtn = document.getElementById('videoBtn');
    const actionButtons = [thoughtBtn, searchBtn, mcpBtn, codeBtn, imageBtn, videoBtn].filter(btn => btn);
    actionButtons.forEach(btn => btn.classList.remove('active'));
    simulateAIResponse(message);
}

function addMessageToChat(sender, content) {
    const chatMessages = document.getElementById('chatMessages');
    if(!chatMessages) { console.error("Cannot find chatMessages to add message"); return; }
    const messageDiv = document.createElement('div'); messageDiv.className = `message ${sender}-message`;
    const messageContent = document.createElement('div'); messageContent.className = 'message-content'; messageContent.textContent = content;
    messageDiv.appendChild(messageContent); chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    const timestamp = new Date().toISOString();
    // Ensure currentChat exists and has messages array
    if (!currentChat || !currentChat.id) { // If no current chat selected or is invalid
        console.warn("No active chat to add message to. Creating or finding first chat.");
        // Attempt to find the chat associated with the active tab or create a new one
        const activeTab = document.querySelector('.tab-button.active:not(#homeTab)');
        if (activeTab) {
            currentChatId = activeTab.id;
            currentChat = chats.find(c => c.id === currentChatId);
            if (!currentChat) { // Tab exists but chat data doesn't? Create it.
                currentChat = { id: currentChatId, title: 'Nuova Chat', lastUpdated: timestamp, messages: [] };
                chats.unshift(currentChat);
            }
        } else {
             // No active tab, potentially create a new chat implicitly?
             // This might be unwanted behavior, maybe prompt user or select home?
             console.error("Cannot determine active chat context.");
             return; // Avoid adding message if context unclear
        }
    }
    // Now currentChat should be valid
    currentChat.messages.push({ sender, content, timestamp });
    currentChat.lastUpdated = timestamp;
    if (sender === 'user' && currentChat.messages.length === 1) { // Update title on first user message
        currentChat.title = content.substring(0, 30) + (content.length > 30 ? '...' : '');
        // Update tab name as well?
        const currentTabElem = document.getElementById(currentChatId);
        if(currentTabElem) {
             const tabNameSpan = currentTabElem.querySelector('.tab-name');
             if(tabNameSpan) tabNameSpan.textContent = currentChat.title;
        }
    }
    if (window.api) window.api.saveChatHistory(chats);
    renderChatHistorySidebar();
}

function renderCurrentChat() {
  const chatMessages = document.getElementById('chatMessages');
  if (!chatMessages) return;
  chatMessages.innerHTML = '';
  if (!currentChat || !currentChat.messages) return;
  currentChat.messages.forEach(message => {
    const messageDiv = document.createElement('div'); messageDiv.className = `message ${message.sender}-message`;
    const messageContent = document.createElement('div'); messageContent.className = 'message-content'; messageContent.textContent = message.content;
    messageDiv.appendChild(messageContent); chatMessages.appendChild(messageDiv);
   });
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function renderChatHistorySidebar() {
  const chatHistorySidebar = document.getElementById('chatHistorySidebar');
  if (!chatHistorySidebar) return;
  const existingItems = chatHistorySidebar.querySelectorAll('.chat-history-item');
  existingItems.forEach(item => item.remove());
  chats.sort((a, b) => new Date(b.lastUpdated || 0) - new Date(a.lastUpdated || 0));
  chats.forEach(chat => {
    if (!chat.messages || chat.messages.length === 0) return;
    const lastMessage = chat.messages[chat.messages.length - 1];
    const chatItem = document.createElement('div'); chatItem.className = 'chat-history-item'; chatItem.dataset.chatId = chat.id;
    if (chat.id === currentChatId) chatItem.classList.add('active');
    const title = document.createElement('div'); title.className = 'chat-history-title'; title.textContent = chat.title || 'New Chat';
    const preview = document.createElement('div'); preview.className = 'chat-history-preview'; preview.textContent = lastMessage.content.substring(0, 40) + (lastMessage.content.length > 40 ? '...' : '');
    const time = document.createElement('div'); time.className = 'chat-history-time';
    const messageDate = new Date(chat.lastUpdated || lastMessage.timestamp); const now = new Date();
    const diffSeconds = Math.round((now - messageDate) / 1000); const diffMinutes = Math.round(diffSeconds / 60); const diffHours = Math.round(diffMinutes / 60); const diffDays = Math.round(diffHours / 24);
    if (diffSeconds < 60) time.textContent = 'just now'; else if (diffMinutes < 60) time.textContent = `${diffMinutes}m ago`; else if (diffHours < 24) time.textContent = `${diffHours}h ago`; else if (diffDays === 1) time.textContent = 'Yesterday'; else time.textContent = messageDate.toLocaleDateString();
    chatItem.appendChild(title); chatItem.appendChild(preview); chatItem.appendChild(time);
    chatItem.addEventListener('click', () => {
        document.querySelectorAll('.chat-history-item.active').forEach(item => item.classList.remove('active'));
        chatItem.classList.add('active');
        const correspondingTab = document.getElementById(chat.id);
        if (correspondingTab) {
            correspondingTab.click(); // Activate the tab, which should call switchToChat via loadChatHistoryForTab
        } else {
            console.warn("No corresponding tab found for chat history item:", chat.id);
            // Maybe create the tab if it doesn't exist?
            // switchToChat(chat.id); // Fallback? Might lead to UI inconsistencies
        }
    });
    chatHistorySidebar.appendChild(chatItem);
   });
}

function switchToChat(chatId) {
  console.log("Switching to chat:", chatId);
  currentChatId = chatId;
  currentChat = chats.find(chat => chat.id === chatId);
  if(!currentChat) { console.error("Chat data not found for switch:", chatId); currentChat = { id: chatId, title: 'Chat Not Found', messages: [] }; }
  renderCurrentChat();
  const _updateWindowTitle = () => { const wt = document.querySelector('.window-title'); if(wt) wt.textContent = (currentChat?.title || 'Synapse'); }; _updateWindowTitle();
}

function startNewChat() {
    const newChatId = 'chat-' + Date.now();
    // Create tab first. The tab's click listener will handle setting currentChatId and rendering.
    const newTab = createNewTabButton('Nuova Chat', 'fa-comment-dots', newChatId);
    if(!newTab) {
        console.error("Failed to create new chat tab in startNewChat");
        return;
    }
    // Do NOT create chat data here. Create it when the first message is added.
    renderChatHistorySidebar(); // Update sidebar to potentially show new chat item if needed
}

async function simulateAIResponse(userMessage) {
  const chatMessages = document.getElementById('chatMessages');
  if(!chatMessages) return;
  const typingDiv = document.createElement('div'); typingDiv.className = 'message ai-message typing'; typingDiv.innerHTML = '<div class="message-content">Thinking...</div>';
  chatMessages.appendChild(typingDiv); chatMessages.scrollTop = chatMessages.scrollHeight;
  try {
    const result = await window.api.generateAIResponse(userMessage);
    if (chatMessages.contains(typingDiv)) chatMessages.removeChild(typingDiv);
    if (result.success) addMessageToChat('ai', result.response);
    else addMessageToChat('ai', `Errore: ${result.error || 'Unknown error'}`);
  } catch (error) {
    console.error('Error generating AI response:', error);
    if (chatMessages.contains(typingDiv)) chatMessages.removeChild(typingDiv);
    addMessageToChat('ai', `Errore: API communication failed.`);
  }
}

function loadSettings() {
  if (window.api) {
    llmProviders = window.api.getSettings('llmProviders') || []; defaultProvider = window.api.getSettings('defaultProvider') || '';
    const language = window.api.getSettings('language') || 'it'; const theme = window.api.getSettings('theme') || 'dark';
    const langSelect = document.getElementById('languageSelect'); const themeSelect = document.getElementById('themeSelect');
    if(langSelect) langSelect.value = language; if(themeSelect) themeSelect.value = theme;
    // Load other toggles
    const notificationToggle = document.getElementById('notificationToggle'); if(notificationToggle) notificationToggle.checked = window.api.getSettings('notificationsEnabled') ?? true;
    const soundToggle = document.getElementById('soundToggle'); if(soundToggle) soundToggle.checked = window.api.getSettings('soundEnabled') ?? true;
    const historyToggle = document.getElementById('historyToggle'); if(historyToggle) historyToggle.checked = window.api.getSettings('saveHistoryEnabled') ?? true;
    renderProvidersList();
  } else { console.error("window.api not available in loadSettings"); }
}

function saveSettings() {
  if (window.api) {
    window.api.saveSettings('llmProviders', llmProviders); window.api.saveSettings('defaultProvider', defaultProvider);
    const langSelect = document.getElementById('languageSelect'); if(langSelect) window.api.saveSettings('language', langSelect.value);
    const themeSelect = document.getElementById('themeSelect'); if(themeSelect) window.api.saveSettings('theme', themeSelect.value);
    const notificationToggle = document.getElementById('notificationToggle'); if(notificationToggle) window.api.saveSettings('notificationsEnabled', notificationToggle.checked);
    const soundToggle = document.getElementById('soundToggle'); if(soundToggle) window.api.saveSettings('soundEnabled', soundToggle.checked);
    const historyToggle = document.getElementById('historyToggle'); if(historyToggle) window.api.saveSettings('saveHistoryEnabled', historyToggle.checked);
    console.log("Settings saved.");
  } else { console.error("window.api not available in saveSettings"); }
}

// Needs access to global llmProviders
function handleSaveProviderAdd() {
    const nameInput = document.getElementById('providerNameInput'); const keyInput = document.getElementById('apiKeyInput'); const endpointInput = document.getElementById('apiEndpointInput'); const modelInput = document.getElementById('modelNameInput'); const tempInput = document.getElementById('temperatureInput');
    const name = nameInput ? nameInput.value.trim() : ''; const apiKey = keyInput ? keyInput.value.trim() : ''; const endpoint = endpointInput ? endpointInput.value.trim() : ''; const model = modelInput ? modelInput.value.trim() : ''; const temperature = tempInput ? parseFloat(tempInput.value) : 0.7;
    if (!name || !apiKey || !model) { alert('Mandatory fields missing'); return; }
    const newProvider = { id: Date.now().toString(), name, apiKey, endpoint: endpoint || null, model, temperature };
    llmProviders.push(newProvider);
    if (!defaultProvider) defaultProvider = newProvider.id; // Set first added as default if none selected
    saveSettings();
    // Use a local reset function or ensure global one is available and works
    const _resetProviderForm = () => { /* reset fields */ }; _resetProviderForm();
    const form = document.getElementById('addProviderForm'); const addBtn = document.getElementById('addProviderBtn'); const list = document.getElementById('apiProvidersList');
    if(form) form.style.display = 'none'; if(addBtn) addBtn.style.display = 'block'; if(list) list.style.display = 'block';
    renderProvidersList();
}

// Needs access to global llmProviders, defaultProvider
function renderProvidersList() {
    const list = document.getElementById('apiProvidersList'); const select = document.getElementById('defaultProviderSelect');
    if(!list || !select) { console.error("Provider list or select missing"); return; }
    list.innerHTML = ''; select.innerHTML = '<option value="">Seleziona Default</option>';
    llmProviders.forEach(provider => {
        const card = document.createElement('div'); card.className = 'api-provider-card';
        const nameDiv = document.createElement('div'); nameDiv.className = 'api-provider-name'; nameDiv.textContent = provider.name;
        const modelSpan = document.createElement('span'); modelSpan.textContent = provider.model; const tempSpan = document.createElement('span'); tempSpan.textContent = provider.temperature;
        card.innerHTML = `<div class="api-provider-header">${nameDiv.outerHTML}<div class="api-provider-actions"><button class="secondary-btn edit-provider" data-id="${provider.id}"><i class="fas fa-edit"></i></button><button class="danger-btn delete-provider" data-id="${provider.id}"><i class="fas fa-trash"></i></button></div></div><div class="setting-item"><label>Modello:</label> ${modelSpan.outerHTML}</div><div class="setting-item"><label>Temperatura:</label> ${tempSpan.outerHTML}</div>`;
        list.appendChild(card);
        const option = document.createElement('option'); option.value = provider.id; option.textContent = provider.name; if (provider.id === defaultProvider) option.selected = true;
        select.appendChild(option);
    });
    // Attach listeners to newly created buttons
    list.querySelectorAll('.edit-provider').forEach(btn => btn.addEventListener('click', (e) => editProvider(e.currentTarget.dataset.id)));
    list.querySelectorAll('.delete-provider').forEach(btn => btn.addEventListener('click', (e) => deleteProvider(e.currentTarget.dataset.id)));
}

// Needs access to global llmProviders
function editProvider(providerId) {
    const provider = llmProviders.find(p => p.id === providerId); if (!provider) return;
    const form = document.getElementById('addProviderForm'); const addBtn = document.getElementById('addProviderBtn'); const list = document.getElementById('apiProvidersList'); const saveBtn = document.getElementById('saveProviderBtn');
    const nameInput = document.getElementById('providerNameInput'); const keyInput = document.getElementById('apiKeyInput'); const endpointInput = document.getElementById('apiEndpointInput'); const modelInput = document.getElementById('modelNameInput'); const tempInput = document.getElementById('temperatureInput');
    if(nameInput) nameInput.value = provider.name; if(keyInput) keyInput.value = provider.apiKey; if(endpointInput) endpointInput.value = provider.endpoint || ''; if(modelInput) modelInput.value = provider.model; if(tempInput) tempInput.value = provider.temperature;
    if(form) form.style.display = 'block'; if(addBtn) addBtn.style.display = 'none'; if(list) list.style.display = 'none';
    if(saveBtn) { saveBtn.textContent = 'Aggiorna Provider'; saveBtn.dataset.mode = 'edit'; saveBtn.dataset.providerId = providerId; saveBtn.onclick = handleSaveProviderEdit; }
}

// Needs access to global llmProviders
function handleSaveProviderEdit() {
    const saveBtn = document.getElementById('saveProviderBtn'); const nameInput = document.getElementById('providerNameInput'); const keyInput = document.getElementById('apiKeyInput'); const endpointInput = document.getElementById('apiEndpointInput'); const modelInput = document.getElementById('modelNameInput'); const tempInput = document.getElementById('temperatureInput');
    const providerId = saveBtn ? saveBtn.dataset.providerId : null; const name = nameInput ? nameInput.value.trim() : ''; const apiKey = keyInput ? keyInput.value.trim() : ''; const endpoint = endpointInput ? endpointInput.value.trim() : ''; const model = modelInput ? modelInput.value.trim() : ''; const temperature = tempInput ? parseFloat(tempInput.value) : 0.7;
    if (!providerId || !name || !apiKey || !model) { alert('Mandatory fields missing'); return; }
    const index = llmProviders.findIndex(p => p.id === providerId);
    if (index !== -1) { llmProviders[index] = { ...llmProviders[index], name, apiKey, endpoint: endpoint || null, model, temperature }; }
    saveSettings();
    // Reset form fields locally or globally
    const _resetProviderForm = () => { /* ... reset ... */ }; _resetProviderForm();
    const form = document.getElementById('addProviderForm'); const addBtn = document.getElementById('addProviderBtn'); const list = document.getElementById('apiProvidersList');
    if(form) form.style.display = 'none'; if(addBtn) addBtn.style.display = 'block'; if(list) list.style.display = 'block';
    renderProvidersList();
    if(saveBtn) { saveBtn.textContent = 'Salva Provider'; saveBtn.dataset.mode = 'add'; delete saveBtn.dataset.providerId; saveBtn.onclick = handleSaveProviderAdd; } // Reset to add handler
}

// Needs access to global llmProviders, defaultProvider
function deleteProvider(providerId) {
    if (!confirm('Sei sicuro di voler eliminare questo provider?')) return;
    llmProviders = llmProviders.filter(p => p.id !== providerId);
    if (defaultProvider === providerId) defaultProvider = llmProviders.length > 0 ? llmProviders[0].id : '';
    saveSettings();
    renderProvidersList();
}

// Function to create new tab button
function createNewTabButton(tabName = 'Nuova Chat', iconClass = 'fa-comment-dots', customTabId = null) {
    const dynamicTabsWrapper = document.getElementById('dynamicTabsWrapper');
    const homeTab = document.getElementById('homeTab');
    if (!dynamicTabsWrapper) { console.error("Cannot create tab: dynamicTabsWrapper missing."); return null; }
    console.log(`Creating tab: ${tabName}`);

    // Deactivate all other tabs
    document.querySelectorAll('.tab-button.active').forEach(tab => tab.classList.remove('active'));
    if (homeTab) { homeTab.classList.add('inactive'); homeTab.classList.remove('active'); }

    const tabId = customTabId || 'tab-' + Date.now();
    const tabButton = document.createElement('div'); tabButton.className = 'tab-button active'; tabButton.id = tabId;
    const icon = document.createElement('i'); icon.className = `fas ${iconClass}`;
    const tabNameElement = document.createElement('span'); tabNameElement.className = 'tab-name'; tabNameElement.textContent = tabName;
    const closeBtn = document.createElement('button'); closeBtn.className = 'tab-close-btn'; closeBtn.innerHTML = '<i class="fas fa-times"></i>';

    closeBtn.addEventListener('click', (event) => { event.stopPropagation(); closeTab(tabButton, tabId); });

    tabButton.appendChild(icon); tabButton.appendChild(tabNameElement); tabButton.appendChild(closeBtn);

    // Tab click listener
    tabButton.addEventListener('click', () => {
        const isCurrentlyActive = tabButton.classList.contains('active');
        if (isCurrentlyActive) return;
        console.log(`Tab clicked: ${tabId}`);
        
        // Salva lo stato della tab corrente prima di cambiarla
        const currentActiveTab = document.querySelector('.tab-button.active');
        if (currentActiveTab) {
            const currentTabId = currentActiveTab.id.replace('-tab', '');
            console.log(`Saving state for tab: ${currentTabId}`);
            
            // Se siamo in modalità documento, esci prima di cambiare tab
            if (document.body.classList.contains('document-mode')) {
                const overlay = document.getElementById('documentOverlay');
                if (overlay && typeof window.exitDocumentMode === 'function') {
                    console.log('Exiting document mode before tab change');
                    window.exitDocumentMode();
                }
            }
            
            if (currentTabId.startsWith('workflow-') && window.workflowFunctions?.saveWorkflowState) {
                console.log('Saving workflow state before tab change');
                window.workflowFunctions.saveWorkflowState(currentTabId);
            } else if (currentTabId.startsWith('calendar-') && window.calendarFunctions?.saveCalendarState) {
                window.calendarFunctions.saveCalendarState(currentTabId);
            } else if (currentTabId.startsWith('community-') && window.communityFunctions?.saveCommunityState) {
                window.communityFunctions.saveCommunityState(currentTabId);
            }
        }

        // Cambia la tab attiva
        document.querySelectorAll('.tab-button.active').forEach(tab => tab.classList.remove('active'));
        const currentHomeTab = document.getElementById('homeTab');
        if (currentHomeTab) { currentHomeTab.classList.add('inactive'); currentHomeTab.classList.remove('active'); }
        tabButton.classList.add('active');

        console.log(`Switching content for tab: ${tabId}`);
        const chatInputContainer = document.getElementById('userInput')?.closest('.input-container');
        const chatMessagesContainer = document.getElementById('chatMessages');

        if (chatMessagesContainer) { 
            chatMessagesContainer.innerHTML=''; 
            chatMessagesContainer.style = ''; 
            chatMessagesContainer.classList.remove('workflow-fullscreen', 'calendar-fullscreen'); 
        }
        if(chatInputContainer) chatInputContainer.style.display = '';

        // Carica il contenuto appropriato per la tab
        if (tabId.startsWith('workflow-')) {
            showWorkflowEditor();
            // Carica lo stato del workflow se disponibile
            if (window.workflowFunctions?.loadWorkflowState) {
                // Assicurati che il workflow sia inizializzato prima di caricare lo stato
                if (window.workflowFunctions.initialize) {
                    window.workflowFunctions.initialize();
                }
                // Usa un timeout più lungo per assicurarsi che l'inizializzazione sia completa
                setTimeout(() => {
                    console.log('Loading workflow state for tab:', tabId);
                    window.workflowFunctions.loadWorkflowState(tabId);
                }, 200);
            }
        }
        else if (tabId.startsWith('calendar-')) {
            showCalendar();
            // Carica lo stato del calendario se disponibile
            if (window.calendarFunctions?.loadCalendarState) {
                setTimeout(() => window.calendarFunctions.loadCalendarState(tabId), 100);
            }
        }
        else if (tabId.startsWith('community-')) {
            showCommunity();
            // Carica lo stato della community se disponibile
            if (window.communityFunctions?.loadCommunityState) {
                setTimeout(() => window.communityFunctions.loadCommunityState(tabId), 100);
            }
        }
        else { 
            showChatInterface(); 
            loadChatHistoryForTab(tabId); 
        }

        // Assicurati che la tab sia visibile nello scroll orizzontale
        const tabsWrapper = document.getElementById('dynamicTabsWrapper');
        if (tabsWrapper) {
            const tabRect = tabButton.getBoundingClientRect();
            const wrapperRect = tabsWrapper.getBoundingClientRect();
            
            // Se la tab è fuori dalla vista a destra
            if (tabRect.right > wrapperRect.right) {
                tabsWrapper.scrollLeft += (tabRect.right - wrapperRect.right + 20);
            }
            // Se la tab è fuori dalla vista a sinistra
            else if (tabRect.left < wrapperRect.left) {
                tabsWrapper.scrollLeft -= (wrapperRect.left - tabRect.left + 20);
            }
        }

        const _updateWindowTitle = () => { const wt = document.querySelector('.window-title'); if(wt) wt.textContent = document.title || 'Synapse'; }; _updateWindowTitle();
        
        // Salva lo stato delle tab dopo il cambio
        saveCurrentTabs();
    });
    
    // Aggiungi gestore per il right-click (menu contestuale)
    tabButton.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        event.stopPropagation();
        showTabContextMenu(event, tabButton, tabId);
    });

    // Inserisci la nuova tab PRIMA del pulsante '+'
    const addTabBtnRef = document.getElementById('addTabBtn');
    if (addTabBtnRef) {
        dynamicTabsWrapper.insertBefore(tabButton, addTabBtnRef);
    } else {
        dynamicTabsWrapper.appendChild(tabButton); // Fallback se il pulsante + non viene trovato
        console.error("Add tab button not found for insertion, appending instead.");
    }

    saveCurrentTabs();

    // Activate the new tab's content immediately
    const tabType = tabId.startsWith('workflow-') ? 'workflow' : 
                   tabId.startsWith('calendar-') ? 'calendar' : 
                   tabId.startsWith('community-') ? 'community' : 'chat';
    if (tabType === 'workflow') {
        showWorkflowEditor();
        if (window.workflowFunctions?.loadWorkflowState) {
            setTimeout(() => window.workflowFunctions.loadWorkflowState(tabId), 100); // Load state after init
        }
    } else if (tabType === 'calendar') {
        showCalendar();
        if (window.calendarFunctions?.loadCalendarState) {
            setTimeout(() => window.calendarFunctions.loadCalendarState(tabId), 100);
        }
    } else if (tabType === 'community') {
        showCommunity();
        if (window.communityFunctions?.loadCommunityState) {
            setTimeout(() => window.communityFunctions.loadCommunityState(tabId), 100);
        }
    } else {
        showChatInterface();
        loadChatHistoryForTab(tabId);
    }

    // Ensure the new tab is scrolled into view
    const tabsWrapper = document.getElementById('dynamicTabsWrapper');
    if (tabsWrapper) {
        const tabRect = tabButton.getBoundingClientRect();
        const wrapperRect = tabsWrapper.getBoundingClientRect();
        if (tabRect.right > wrapperRect.right) {
            tabsWrapper.scrollLeft += (tabRect.right - wrapperRect.right + 20);
        } else if (tabRect.left < wrapperRect.left) {
            tabsWrapper.scrollLeft -= (wrapperRect.left - tabRect.left + 20);
        }
    }

    return tabButton;
}

// Funzione per mostrare il menu contestuale sulla tab
function showTabContextMenu(event, tabButton, tabId) {
    // Rimuovi eventuali menu contestuali esistenti
    const existingMenu = document.querySelector('.dynamic-context-menu');
    if (existingMenu) { document.body.removeChild(existingMenu); }
    
    // Crea il menu contestuale
    const contextMenu = document.createElement('div');
    contextMenu.className = 'dynamic-context-menu';
    
    // Opzioni del menu
    const closeItem = document.createElement('div');
    closeItem.className = 'context-menu-item';
    closeItem.innerHTML = '<i class="fas fa-times"></i> Chiudi scheda';
    
    const splitRightItem = document.createElement('div');
    splitRightItem.className = 'context-menu-item';
    splitRightItem.innerHTML = '<i class="fas fa-arrow-right"></i> Dividi a destra';
    
    const splitLeftItem = document.createElement('div');
    splitLeftItem.className = 'context-menu-item';
    splitLeftItem.innerHTML = '<i class="fas fa-arrow-left"></i> Dividi a sinistra';
    
    const splitDownItem = document.createElement('div');
    splitDownItem.className = 'context-menu-item';
    splitDownItem.innerHTML = '<i class="fas fa-arrow-down"></i> Dividi sotto';
    
    // Aggiungi gli elementi al menu
    contextMenu.appendChild(closeItem);
    contextMenu.appendChild(document.createElement('hr'));
    contextMenu.appendChild(splitRightItem);
    contextMenu.appendChild(splitLeftItem);
    contextMenu.appendChild(splitDownItem);
    
    // Imposta stili base per la misurazione
    contextMenu.style.position = 'fixed';
    contextMenu.style.visibility = 'hidden'; // Nascondi durante la misurazione
    contextMenu.style.zIndex = '9999';
    contextMenu.style.backgroundColor = '#2c2c2c';
    contextMenu.style.border = '1px solid #444444';
    contextMenu.style.borderRadius = '8px';
    contextMenu.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
    contextMenu.style.padding = '6px';
    contextMenu.style.minWidth = '200px';
    contextMenu.style.fontFamily = '"Segoe UI", sans-serif';
    
    // Aggiungi temporaneamente al body per misurare
    document.body.appendChild(contextMenu);
    const menuWidth = contextMenu.offsetWidth;
    const menuHeight = contextMenu.offsetHeight;
    document.body.removeChild(contextMenu); // Rimuovi immediatamente dopo la misurazione
    
    // Calcola la posizione con controlli di confine
    let top = event.clientY;
    let left = event.clientX;
    
    // Controlla il confine destro
    if (left + menuWidth > window.innerWidth) {
        left = window.innerWidth - menuWidth - 5;
    }
    
    // Controlla il confine inferiore
    if (top + menuHeight > window.innerHeight) {
        top = window.innerHeight - menuHeight - 5;
    }
    
    // Applica la posizione finale e rendi visibile
    contextMenu.style.top = `${top}px`;
    contextMenu.style.left = `${left}px`;
    contextMenu.style.visibility = 'visible';
    
    document.body.appendChild(contextMenu);
    
    // Gestori di eventi per le opzioni del menu
    closeItem.addEventListener('click', () => {
        closeTab(tabButton, tabId);
        if (document.body.contains(contextMenu)) document.body.removeChild(contextMenu);
    });
    
    splitRightItem.addEventListener('click', () => {
        console.log('Split right: Not implemented yet');
        // Implementazione della divisione a destra
        if (document.body.contains(contextMenu)) document.body.removeChild(contextMenu);
    });
    
    splitLeftItem.addEventListener('click', () => {
        console.log('Split left: Not implemented yet');
        // Implementazione della divisione a sinistra
        if (document.body.contains(contextMenu)) document.body.removeChild(contextMenu);
    });
    
    splitDownItem.addEventListener('click', () => {
        console.log('Split down: Not implemented yet');
        // Implementazione della divisione sotto
        if (document.body.contains(contextMenu)) document.body.removeChild(contextMenu);
    });
    
    // Listener per chiudere il menu se si fa click altrove
    setTimeout(() => {
        document.addEventListener('click', function closeMenuOnClickOutside(e) {
            if (document.body.contains(contextMenu) && !contextMenu.contains(e.target)) {
                document.body.removeChild(contextMenu);
                document.removeEventListener('click', closeMenuOnClickOutside);
            }
        });
    }, 50);
}

function removeTabButton(tabId) {
    const dynamicTabsWrapper = document.getElementById('dynamicTabsWrapper'); const tabButton = document.getElementById(tabId);
    if (tabButton && dynamicTabsWrapper && dynamicTabsWrapper.contains(tabButton)) { dynamicTabsWrapper.removeChild(tabButton); console.log("Removed tab:", tabId); }
    else { console.warn("Attempted to remove non-existent tab:", tabId); }
}

function closeTab(tabButton, tabId) {
  console.log(`Closing tab: ${tabId}`);
  const wasActive = tabButton.classList.contains('active');
  const parent = tabButton.parentNode;
  removeTabButton(tabId);
  removeChatHistoryForTab(tabId);
  if (wasActive) {
    const homeTab = document.getElementById('homeTab'); 
    // Trova l'ultima tab rimanente nel wrapper (escluso il pulsante +)
    const remainingTabs = parent ? parent.querySelectorAll('.tab-button:not(#addTabBtn)') : [];
    if (remainingTabs.length > 0) {
        remainingTabs[remainingTabs.length - 1].click(); // Clicca sull'ultima tab
    } else if (homeTab) {
        homeTab.click(); // Se non ci sono altre tab, torna a home
    } else {
        // Stato vuoto se anche home non esiste?
        const chatMessages = document.getElementById('chatMessages'); 
        if(chatMessages) chatMessages.innerHTML = '<div class="empty-state">No tabs open.</div>'; 
    }
  }
  saveCurrentTabs();
}

function loadChatHistoryForTab(tabId) {
  console.log(`Loading history for tab ${tabId}`);
  const chatMessages = document.getElementById('chatMessages'); if (!chatMessages) return;
  const chatData = chats.find(chat => chat.id === tabId);
  if (chatData) {
      currentChatId = tabId; currentChat = chatData; renderCurrentChat(); document.title = currentChat.title || 'Synapse';
  } else {
      chatMessages.innerHTML = `<div>Start typing...</div>`;
      currentChatId = tabId;
      currentChat = { id: tabId, title: 'Nuova Chat', messages: [] }; // Create temporary representation
      document.title = 'Nuova Chat - Synapse';
      // Don't add to 'chats' array until first message
      console.warn("No saved chat history found for tab:", tabId);
      renderCurrentChat(); // Render the empty state for the temp chat
  }
  const _updateWindowTitle = () => { const wt = document.querySelector('.window-title'); if(wt) wt.textContent = document.title || 'Synapse'; }; _updateWindowTitle();
}

function removeChatHistoryForTab(tabId) {
  console.log(`Removing history for tab ${tabId}`);
  const index = chats.findIndex(chat => chat.id === tabId);
  if (index > -1) { chats.splice(index, 1); if (window.api) window.api.saveChatHistory(chats); renderChatHistorySidebar(); console.log("Removed chat data"); }
  else { console.warn("No chat data to remove for tab:", tabId); }
}

function saveCurrentTabs() {
  console.log("Saving current tab state");
  const tabs = document.querySelectorAll('#dynamicTabsWrapper .tab-button:not(#addTabBtn)');
  const tabsData = [];
  
  tabs.forEach(tab => {
    const tabId = tab.id;
    const tabName = tab.querySelector('.tab-name')?.textContent || 'Tab';
    const tabType = tabId.startsWith('workflow-') ? 'workflow' : 
                   tabId.startsWith('calendar-') ? 'calendar' : 
                   tabId.startsWith('community-') ? 'community' : 'chat';
    
    // Salva i dati specifici per tipo di tab
    let tabContent = null;
    if (tabType === 'workflow' && window.workflowFunctions?.getWorkflowState) {
      tabContent = window.workflowFunctions.getWorkflowState(tabId);
    } else if (tabType === 'calendar' && window.calendarFunctions?.getCalendarState) {
      tabContent = window.calendarFunctions.getCalendarState(tabId);
    } else if (tabType === 'community' && window.communityFunctions?.getCommunityState) {
      tabContent = window.communityFunctions.getCommunityState(tabId);
    } else if (tabType === 'chat') {
      // I dati della chat sono già salvati in chats
    }
    
    tabsData.push({
      id: tabId,
      name: tabName,
      type: tabType,
      content: tabContent,
      active: tab.classList.contains('active')
    });
  });
  
  if (window.api) {
    window.api.saveSettings('openTabs', tabsData);
  }
}

async function updateSystemPerformance() {
    const cpuValue = document.getElementById('cpuValue'); const cpuFill = document.getElementById('cpuFill');
    const memoryValue = document.getElementById('memoryValue'); const memoryFill = document.getElementById('memoryFill');
    const diskValue = document.getElementById('diskValue'); const diskFill = document.getElementById('diskFill');
    const networkValue = document.getElementById('networkValue'); const networkFill = document.getElementById('networkFill');
    if (!cpuValue || !cpuFill || !memoryValue || !memoryFill) return;
    if (window.api) { try { const si = await window.api.getSystemInfo(); if(si.error)return; cpuValue.textContent=`${si.cpu.usage}%`; cpuFill.style.width=`${si.cpu.usage}%`; memoryValue.textContent=`${si.memory.used}GB`; memoryFill.style.width=`${si.memory.usagePercent}%`; if(diskValue){diskValue.textContent=`${si.disk.used}GB`; diskFill.style.width=`${si.disk.usagePercent}%`;} if(networkValue){networkValue.textContent=`${si.network.total}KB/s`; networkFill.style.width=`${Math.min(si.network.total,100)}%`;} } catch (e) {console.error(e);} }
}

function showLandingPage() {
    console.log("Showing Landing Page");
    const chatMessages = document.getElementById('chatMessages'); 
    const homeTab = document.getElementById('homeTab'); 
    const dynamicTabsWrapper = document.getElementById('dynamicTabsWrapper'); 
    const chatInputContainer = document.getElementById('userInput')?.closest('.input-container');
    
    if (!chatMessages || !homeTab) { 
        console.error("Cannot show landing page"); 
        return; 
    }

    if(dynamicTabsWrapper) { 
        dynamicTabsWrapper.querySelectorAll('.tab-button.active').forEach(tab => tab.classList.remove('active')); 
    }
    
    homeTab.classList.remove('inactive'); 
    homeTab.classList.add('active');
    chatMessages.innerHTML = ''; 
    chatMessages.style = ''; 
    chatMessages.classList.remove('chat-active');

    // Nascondi la sidebar quando si mostra la landing page
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.add('hidden');
    }
    
    // Nascondi anche l'input container della chat
    if (chatInputContainer) {
        chatInputContainer.style.display = 'none';
    }
    
    const landingPage = document.createElement('div'); 
    landingPage.className = 'landing-page';
    
    // Carica il layout della landing page
    landingPage.innerHTML = `
        <div class="welcome-section">
            <h1>Benvenuto in Synapse</h1>
            <p>Il tuo hub personale per tutto ciò che ti serve. Personalizza la tua esperienza aggiungendo e riordinando i widget.</p>
            <div class="add-widget-button">
                <i class="fas fa-plus-circle"></i>
                <span>Aggiungi widget</span>
            </div>
        </div>
        
        <div class="landing-divider top-divider">
            <span>I tuoi widget</span>
        </div>
        
        <div class="widgets-container">
            <!-- I widget verranno caricati qui dinamicamente o da un preset -->
        </div>
        
        <div class="landing-divider bottom-divider">
            <span>Altri contenuti</span>
        </div>
        
        <div class="additional-content">
            <div class="updates-section">
        <div class="section-header">
                    <div class="section-icon">
                        <i class="fas fa-bell"></i>
                    </div>
                    <div class="section-title">Ultime novità</div>
        </div>
        <div class="blue-divider"></div>
        <div class="section-content">
            <div class="update-item">
                        <div class="update-title">Aggiornamento v1.2.0</div>
                        <div class="update-date">14 Maggio 2023</div>
                        <div class="update-description">Numerosi miglioramenti e nuove funzionalità:</div>
                <ul class="update-features">
                            <li>Supporto per nuovi modelli di linguaggio</li>
                            <li>Interfaccia ridisegnata per migliore usabilità</li>
                            <li>Nuove opzioni di personalizzazione</li>
                </ul>
            </div>
            </div>
            </div>
    
            <div class="suggestions-section">
        <div class="section-header">
                    <div class="section-icon">
                        <i class="fas fa-lightbulb"></i>
                    </div>
            <div class="section-title">Suggerimenti</div>
        </div>
        <div class="blue-divider"></div>
        <div class="section-content">
            <p>Hai idee per migliorare Synapse? Condividile con noi!</p>
            <div class="suggestion-form">
                        <textarea class="suggestion-input" placeholder="Descrivi la tua idea..."></textarea>
                        <button class="suggestion-send-btn">Invia suggerimento</button>
            </div>
                    
            <div class="most-requested">
                <h3>Funzionalità più richieste</h3>
                <div class="requested-feature">
                            <span class="vote-count">42</span>
                            <span class="feature-name">Supporto per plugin di terze parti</span>
                </div>
                <div class="requested-feature">
                            <span class="vote-count">38</span>
                            <span class="feature-name">Sincronizzazione multipiattaforma</span>
                </div>
                <div class="requested-feature">
                            <span class="vote-count">24</span>
                            <span class="feature-name">Modalità offline avanzata</span>
                </div>
            </div>
        </div>
            </div>
        </div>
        
        <div class="landing-divider top-divider">
            <span>Roadmap di Sviluppo</span>
        </div>
        
        <div class="roadmap-section">
        <div class="roadmap-timeline">
            <div class="roadmap-item">
                    <div class="roadmap-date">Q2 2023</div>
                <div class="roadmap-content">
                        <div class="roadmap-title">Integrazione con API esterne</div>
                        <div class="roadmap-description">Supporto per connettere Synapse con servizi di terze parti e API personalizzate.</div>
                </div>
            </div>
            <div class="roadmap-item">
                    <div class="roadmap-date">Q3 2023</div>
                <div class="roadmap-content">
                        <div class="roadmap-title">Sincronizzazione completa</div>
                        <div class="roadmap-description">Sincronizzazione di tutte le impostazioni e i contenuti su diversi dispositivi.</div>
                </div>
            </div>
            <div class="roadmap-item">
                    <div class="roadmap-date">Q4 2023</div>
                <div class="roadmap-content">
                        <div class="roadmap-title">Collaborazione in tempo reale</div>
                        <div class="roadmap-description">Condivisione e collaborazione simultanea su progetti e documenti.</div>
                </div>
            </div>
                </div>
            </div>
        
        <div class="landing-divider top-divider">
            <span>Guide e Tutorial</span>
                </div>
        
        <div class="help-section">
            <div class="tutorial-links">
        <a href="#" class="tutorial-link">
                    <i class="fas fa-magic"></i>
                    <span>Introduzione rapida</span>
        </a>
        <a href="#" class="tutorial-link">
                    <i class="fas fa-brain"></i>
                    <span>Uso avanzato dell'AI</span>
        </a>
        <a href="#" class="tutorial-link">
                    <i class="fas fa-project-diagram"></i>
                    <span>Organizzare progetti</span>
        </a>
        <a href="#" class="tutorial-link">
                    <i class="fas fa-exchange-alt"></i>
                    <span>Integrazioni esterne</span>
                </a>
            </div>
        </div>
    `;
    
    // Ottieni il container dei widget
    const widgetsContainer = landingPage.querySelector('.widgets-container');
    
    // Aggiungi i widget di default (invece di usare createDefaultWidgets)
    addWidgetToLandingPage('performance', widgetsContainer);
    addWidgetToLandingPage('news', widgetsContainer);
    addWidgetToLandingPage('actions', widgetsContainer);
    addWidgetToLandingPage('notes', widgetsContainer);
    addWidgetToLandingPage('calendar', widgetsContainer);
    addWidgetToLandingPage('weather', widgetsContainer);
    
    // Aggiungi evento per il pulsante "Aggiungi widget"
    const addWidgetButton = landingPage.querySelector('.add-widget-button');
    if (addWidgetButton) {
        addWidgetButton.addEventListener('click', () => {
            showAddWidgetModal(widgetsContainer);
        });
    }
    
    // Add landing page to chat messages
    chatMessages.appendChild(landingPage);
    
    // Setup performance update
    updateSystemPerformance();
    const performanceInterval = setInterval(updateSystemPerformance, 5000);
    
    // Clear interval when navigating away
    const clearPerformanceInterval = (e) => { 
        if (!e.target.closest('.landing-page') && !e.target.closest('#homeTab')) {
            clearInterval(performanceInterval); 
            document.removeEventListener('click', clearPerformanceInterval, true); 
            console.log("Perf interval cleared."); 
        }
    };
    document.addEventListener('click', clearPerformanceInterval, true);
    
    // Setup event handlers for quick actions
    setupQuickActions(landingPage);
    
    // Setup drag and drop per i widget
    setupWidgetDragAndDrop(landingPage);
    
    // Imposta gli eventi delle guide
    setupTutorialLinks(landingPage);
    
    return landingPage;
}

// Funzione per creare widget predefiniti
function createDefaultWidgets(widgetsContainer) {
    if (!widgetsContainer) return;
    
    // Widget Performance
    const performanceWidget = createWidget('performance-widget', 'Prestazioni Sistema', 'chart-line');
    performanceWidget.querySelector('.widget-content').innerHTML = `
        <div class="performance-stats">
            <div class="stat-item">
                <div class="stat-value" id="cpuUsage">0%</div>
                <div class="stat-label">CPU</div>
                <div class="progress-bar">
                    <div class="progress-fill cpu" style="width: 0%"></div>
            </div>
                </div>
            <div class="stat-item">
                <div class="stat-value" id="memoryUsage">0%</div>
                <div class="stat-label">Memoria</div>
                <div class="progress-bar">
                    <div class="progress-fill memory" style="width: 0%"></div>
            </div>
                </div>
            <div class="stat-item">
                <div class="stat-value" id="diskUsage">0%</div>
                <div class="stat-label">Disco</div>
                <div class="progress-bar">
                    <div class="progress-fill disk" style="width: 0%"></div>
                </div>
            </div>
            <div class="stat-item">
                <div class="stat-value" id="networkUsage">0 KB/s</div>
                <div class="stat-label">Rete</div>
                <div class="progress-bar">
                    <div class="progress-fill network" style="width: 0%"></div>
                </div>
                </div>
            </div>
    `;
    widgetsContainer.appendChild(performanceWidget);
    
    // Widget News
    const newsWidget = createWidget('news-widget', 'Ultime Notizie', 'newspaper');
    newsWidget.querySelector('.widget-content').innerHTML = `
        <div class="news-list">
            <div class="news-item">
                <div class="news-image">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="news-content">
                    <div class="news-title">Nuove frontiere dell'intelligenza artificiale</div>
                    <div class="news-source"><i class="fas fa-globe"></i> Tech Today</div>
                </div>
            </div>
            <div class="news-item">
                <div class="news-image">
                    <i class="fas fa-microchip"></i>
                </div>
                <div class="news-content">
                    <div class="news-title">I nuovi processori quantum sono realtà</div>
                    <div class="news-source"><i class="fas fa-globe"></i> Science Daily</div>
                </div>
            </div>
            <div class="news-item">
                <div class="news-image">
                    <i class="fas fa-rocket"></i>
                </div>
                <div class="news-content">
                    <div class="news-title">SpaceX annuncia nuove missioni verso Marte</div>
                    <div class="news-source"><i class="fas fa-globe"></i> Space News</div>
                </div>
            </div>
            </div>
        `;
    widgetsContainer.appendChild(newsWidget);
    
    // Widget Quick Actions
    const actionsWidget = createWidget('actions-widget', 'Azioni Rapide', 'bolt');
    actionsWidget.querySelector('.widget-content').innerHTML = `
        <div class="quick-actions">
            <button class="action-button" data-action="newChat">
                <i class="fas fa-comment-alt"></i> Nuova Chat
            </button>
            <button class="action-button" data-action="newProject">
                <i class="fas fa-folder-plus"></i> Nuovo Progetto
            </button>
            <button class="action-button" data-action="openSettings">
                <i class="fas fa-cog"></i> Impostazioni
            </button>
            <button class="action-button" data-action="checkUpdates">
                <i class="fas fa-sync-alt"></i> Aggiornamenti
            </button>
        </div>
    `;
    widgetsContainer.appendChild(actionsWidget);
    
    // Widget Note
    const notesWidget = createWidget('notes-widget', 'Le Tue Note', 'sticky-note');
    notesWidget.querySelector('.widget-content').innerHTML = `
        <div class="notes-container">
            <div class="note-item">
                <div class="note-title">Idee per il progetto</div>
                <div class="note-date">Creata ieri</div>
                <div class="note-preview">Implementare nuove funzionalità per l'interfaccia utente...</div>
            </div>
            <div class="note-item">
                <div class="note-title">Lista della spesa</div>
                <div class="note-date">Creata 3 giorni fa</div>
                <div class="note-preview">Latte, pane, frutta, verdura...</div>
            </div>
            <div class="note-item">
                <div class="note-title">Riunione del team</div>
                <div class="note-date">Creata 1 settimana fa</div>
                <div class="note-preview">Punti da discutere: roadmap Q3, nuove funzionalità...</div>
            </div>
            <div class="add-note-button">
                <i class="fas fa-plus"></i>
                <span>Aggiungi nota</span>
            </div>
        </div>
    `;
    widgetsContainer.appendChild(notesWidget);
    
    // Widget Calendario
    const calendarWidget = createWidget('calendar-widget', 'Calendario', 'calendar-alt');
    calendarWidget.querySelector('.widget-content').innerHTML = `
        <div class="mini-calendar">
            <div class="calendar-header">
                <div class="month-nav prev"><i class="fas fa-chevron-left"></i></div>
                <div class="current-month">Maggio 2023</div>
                <div class="month-nav next"><i class="fas fa-chevron-right"></i></div>
            </div>
            <div class="weekdays">
                <div>Lun</div>
                <div>Mar</div>
                <div>Mer</div>
                <div>Gio</div>
                <div>Ven</div>
                <div>Sab</div>
                <div>Dom</div>
            </div>
            <div class="calendar-days">
                <!-- I giorni verranno generati dinamicamente -->
                ${generateCalendarDays()}
            </div>
            <div class="upcoming-events">
                <div class="upcoming-title">Prossimi eventi</div>
                <div class="event-item">
                    <div class="event-dot"></div>
                    <div class="event-info">
                        <div class="event-name">Riunione team</div>
                        <div class="event-time">Oggi, 15:00</div>
                    </div>
                </div>
                <div class="event-item">
                    <div class="event-dot"></div>
                    <div class="event-info">
                        <div class="event-name">Scadenza progetto</div>
                        <div class="event-time">Domani, 18:00</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    widgetsContainer.appendChild(calendarWidget);
    
    // Widget Meteo
    const weatherWidget = createWidget('weather-widget', 'Previsioni Meteo', 'cloud-sun');
    weatherWidget.querySelector('.widget-content').innerHTML = `
        <div class="weather-container">
            <div class="current-weather">
                <div class="weather-location">Milano, Italia</div>
                <div class="weather-icon"><i class="fas fa-sun"></i></div>
                <div class="weather-temp">24°C</div>
                <div class="weather-description">Soleggiato</div>
            </div>
            <div class="weather-forecast">
                <div class="forecast-item">
                    <div class="forecast-day">Lun</div>
                    <div class="forecast-icon"><i class="fas fa-sun"></i></div>
                    <div class="forecast-temp">25°C</div>
                </div>
                <div class="forecast-item">
                    <div class="forecast-day">Mar</div>
                    <div class="forecast-icon"><i class="fas fa-cloud-sun"></i></div>
                    <div class="forecast-temp">23°C</div>
                </div>
                <div class="forecast-item">
                    <div class="forecast-day">Mer</div>
                    <div class="forecast-icon"><i class="fas fa-cloud"></i></div>
                    <div class="forecast-temp">21°C</div>
                </div>
                <div class="forecast-item">
                    <div class="forecast-day">Gio</div>
                    <div class="forecast-icon"><i class="fas fa-cloud-rain"></i></div>
                    <div class="forecast-temp">19°C</div>
                </div>
            </div>
        </div>
    `;
    widgetsContainer.appendChild(weatherWidget);
}

// Funzione per ricostruire i widget dall'ordine salvato
function reconstructWidgetsFromSavedOrder(widgetsContainer, savedOrder) {
    if (!widgetsContainer) return;
    
    // Mappa i tipi di widget alle funzioni di creazione
    const widgetCreators = {
        'performance-widget': () => {
            const widget = createWidget('performance-widget', 'Prestazioni Sistema', 'chart-line');
            widget.querySelector('.widget-content').innerHTML = `
                <div class="performance-stats">
                    <div class="stat-item">
                        <div class="stat-value" id="cpuUsage">0%</div>
                        <div class="stat-label">CPU</div>
                        <div class="progress-bar">
                            <div class="progress-fill cpu" style="width: 0%"></div>
                        </div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value" id="memoryUsage">0%</div>
                        <div class="stat-label">Memoria</div>
                        <div class="progress-bar">
                            <div class="progress-fill memory" style="width: 0%"></div>
                        </div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value" id="diskUsage">0%</div>
                        <div class="stat-label">Disco</div>
                        <div class="progress-bar">
                            <div class="progress-fill disk" style="width: 0%"></div>
                        </div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value" id="networkUsage">0 KB/s</div>
                        <div class="stat-label">Rete</div>
                        <div class="progress-bar">
                            <div class="progress-fill network" style="width: 0%"></div>
                        </div>
                    </div>
                </div>
            `;
            return widget;
        },
        'news-widget': () => {
            const widget = createWidget('news-widget', 'Ultime Notizie', 'newspaper');
            widget.querySelector('.widget-content').innerHTML = `
                <div class="news-list">
                    <div class="news-item">
                        <div class="news-image">
                            <i class="fas fa-robot"></i>
                        </div>
                        <div class="news-content">
                            <div class="news-title">Nuove frontiere dell'intelligenza artificiale</div>
                            <div class="news-source"><i class="fas fa-globe"></i> Tech Today</div>
                        </div>
                    </div>
                    <div class="news-item">
                        <div class="news-image">
                            <i class="fas fa-microchip"></i>
                        </div>
                        <div class="news-content">
                            <div class="news-title">I nuovi processori quantum sono realtà</div>
                            <div class="news-source"><i class="fas fa-globe"></i> Science Daily</div>
                        </div>
                    </div>
                    <div class="news-item">
                        <div class="news-image">
                            <i class="fas fa-rocket"></i>
                        </div>
                        <div class="news-content">
                            <div class="news-title">SpaceX annuncia nuove missioni verso Marte</div>
                            <div class="news-source"><i class="fas fa-globe"></i> Space News</div>
                        </div>
                    </div>
                </div>
            `;
            return widget;
        },
        'actions-widget': () => {
            const widget = createWidget('actions-widget', 'Azioni Rapide', 'bolt');
            widget.querySelector('.widget-content').innerHTML = `
                <div class="quick-actions">
                    <button class="action-button" data-action="newChat">
                        <i class="fas fa-comment-alt"></i> Nuova Chat
                    </button>
                    <button class="action-button" data-action="newProject">
                        <i class="fas fa-folder-plus"></i> Nuovo Progetto
                    </button>
                    <button class="action-button" data-action="openSettings">
                        <i class="fas fa-cog"></i> Impostazioni
                    </button>
                    <button class="action-button" data-action="checkUpdates">
                        <i class="fas fa-sync-alt"></i> Aggiornamenti
                    </button>
                </div>
            `;
            return widget;
        },
        'notes-widget': () => {
            const widget = createWidget('notes-widget', 'Le Tue Note', 'sticky-note');
            widget.querySelector('.widget-content').innerHTML = `
                <div class="notes-container">
                    <div class="note-item">
                        <div class="note-title">Idee per il progetto</div>
                        <div class="note-date">Creata ieri</div>
                        <div class="note-preview">Implementare nuove funzionalità per l'interfaccia utente...</div>
                    </div>
                    <div class="note-item">
                        <div class="note-title">Lista della spesa</div>
                        <div class="note-date">Creata 3 giorni fa</div>
                        <div class="note-preview">Latte, pane, frutta, verdura...</div>
                    </div>
                    <div class="note-item">
                        <div class="note-title">Riunione del team</div>
                        <div class="note-date">Creata 1 settimana fa</div>
                        <div class="note-preview">Punti da discutere: roadmap Q3, nuove funzionalità...</div>
                    </div>
                    <div class="add-note-button">
                        <i class="fas fa-plus"></i>
                        <span>Aggiungi nota</span>
                    </div>
                </div>
            `;
            return widget;
        },
        'calendar-widget': () => {
            const widget = createWidget('calendar-widget', 'Calendario', 'calendar-alt');
            widget.querySelector('.widget-content').innerHTML = `
                <div class="mini-calendar">
                    <div class="calendar-header">
                        <div class="month-nav prev"><i class="fas fa-chevron-left"></i></div>
                        <div class="current-month">Maggio 2023</div>
                        <div class="month-nav next"><i class="fas fa-chevron-right"></i></div>
                    </div>
                    <div class="weekdays">
                        <div>Lun</div>
                        <div>Mar</div>
                        <div>Mer</div>
                        <div>Gio</div>
                        <div>Ven</div>
                        <div>Sab</div>
                        <div>Dom</div>
                    </div>
                    <div class="calendar-days">
                        <!-- I giorni verranno generati dinamicamente -->
                        ${generateCalendarDays()}
                    </div>
                    <div class="upcoming-events">
                        <div class="upcoming-title">Prossimi eventi</div>
                        <div class="event-item">
                            <div class="event-dot"></div>
                            <div class="event-info">
                                <div class="event-name">Riunione team</div>
                                <div class="event-time">Oggi, 15:00</div>
                            </div>
                        </div>
                        <div class="event-item">
                            <div class="event-dot"></div>
                            <div class="event-info">
                                <div class="event-name">Scadenza progetto</div>
                                <div class="event-time">Domani, 18:00</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            return widget;
        },
        'weather-widget': () => {
            const widget = createWidget('weather-widget', 'Previsioni Meteo', 'cloud-sun');
            widget.querySelector('.widget-content').innerHTML = `
                <div class="weather-container">
                    <div class="current-weather">
                        <div class="weather-location">Milano, Italia</div>
                        <div class="weather-icon"><i class="fas fa-sun"></i></div>
                        <div class="weather-temp">24°C</div>
                        <div class="weather-description">Soleggiato</div>
                    </div>
                    <div class="weather-forecast">
                        <div class="forecast-item">
                            <div class="forecast-day">Lun</div>
                            <div class="forecast-icon"><i class="fas fa-sun"></i></div>
                            <div class="forecast-temp">25°C</div>
                        </div>
                        <div class="forecast-item">
                            <div class="forecast-day">Mar</div>
                            <div class="forecast-icon"><i class="fas fa-cloud-sun"></i></div>
                            <div class="forecast-temp">23°C</div>
                        </div>
                        <div class="forecast-item">
                            <div class="forecast-day">Mer</div>
                            <div class="forecast-icon"><i class="fas fa-cloud"></i></div>
                            <div class="forecast-temp">21°C</div>
                        </div>
                        <div class="forecast-item">
                            <div class="forecast-day">Gio</div>
                            <div class="forecast-icon"><i class="fas fa-cloud-rain"></i></div>
                            <div class="forecast-temp">19°C</div>
                        </div>
                    </div>
                </div>
            `;
            return widget;
        },
        // Aggiungi altri tipi di widget qui...
        'default': (type) => {
            // Widget generico/fallback per tipi sconosciuti
            return createWidget(type || 'generic-widget', 'Widget', 'cube');
        }
    };
    
    // Crea i widget nell'ordine salvato
    savedOrder.forEach(widgetType => {
        if (!widgetType) return;
        
        // Usa la funzione di creazione per il tipo specifico o usa quella predefinita
        const createWidgetFn = widgetCreators[widgetType] || (() => widgetCreators.default(widgetType));
        const widget = createWidgetFn();
        
            if (widget) {
            widgetsContainer.appendChild(widget);
        }
    });
    
    // Se non ci sono widget dopo il ripristino, usa quelli predefiniti
    if (widgetsContainer.children.length === 0) {
        createDefaultWidgets(widgetsContainer);
    }
}

// Funzione per gestire il drag and drop dei widget
function setupWidgetDragAndDrop(landingPage) {
    const widgetsContainer = landingPage.querySelector('.widgets-container');
    if (!widgetsContainer) {
        console.error('Container dei widget non trovato');
        return;
    }
    
    // Verifica se Sortable è disponibile
    if (typeof Sortable === 'undefined') {
        console.error('SortableJS non è disponibile. Verificare che sia stato caricato correttamente nell\'HTML.');
        return;
    }
    
    // Inizializza Sortable immediatamente
    initSortable();
    
    function initSortable() {
        try {
            // Rimuovi eventuali istanze precedenti
            if (widgetsContainer._sortable) {
                widgetsContainer._sortable.destroy();
            }
            
            // Crea una nuova istanza di Sortable
            const sortable = new Sortable(widgetsContainer, {
                animation: 0, // Disabilita le animazioni per evitare problemi visivi
                handle: '.widget-move-handle', // Elemento per il trascinamento
                draggable: '.widget',
                ghostClass: 'widget-drop-placeholder',
                chosenClass: 'widget-chosen', // Classe applicata all'elemento selezionato
                dragClass: 'dragging',
                forceFallback: true, // Importante: abilitare per avere un controllo migliore durante il trascinamento
                fallbackClass: 'sortable-ghost',
                fallbackOnBody: false,
                fallbackTolerance: 5,
                scroll: true,
                scrollSensitivity: 80,
                scrollSpeed: 10,
                delay: 0,
                swapThreshold: 0.65,
                onChoose: function(evt) {
                    // Prepara l'elemento per il trascinamento
                    const item = evt.item;
                    
                    // Salva le dimensioni originali per il clone
                    item.dataset.originalWidth = item.offsetWidth + 'px';
                    item.dataset.originalHeight = item.offsetHeight + 'px';
                },
                onStart: function(evt) {
                    console.log('Drag started', evt.item);
                    const item = evt.item;
                    item.classList.add('dragging');
                    
                    // Aggiungi classe al body per stilizzazioni durante il trascinamento
                    document.body.classList.add('dragging-active');
                    
                    // Aggiungi spazio extra temporaneo alla fine del contenitore per evitare salti di visuale
                    const tempSpace = document.createElement('div');
                    tempSpace.className = 'drag-temp-space';
                    tempSpace.style.height = '300px';
                    tempSpace.style.width = '100%';
                    tempSpace.style.display = 'block';
                    tempSpace.style.opacity = '0';
                    tempSpace.style.pointerEvents = 'none';
                    widgetsContainer.appendChild(tempSpace);
                    
                    // Disabilita temporaneamente le transizioni smooth della pagina
                    const landingPage = document.querySelector('.landing-page');
                    if (landingPage) {
                        landingPage.style.scrollBehavior = 'auto';
                    }
                },
                onEnd: function(evt) {
                    console.log('Drag ended');
                    const item = evt.item;
                    item.classList.remove('dragging');
                    
                    // Rimuovi la classe dal body
                    document.body.classList.remove('dragging-active');
                    
                    // Rimuovi lo spazio temporaneo
                    const tempSpace = widgetsContainer.querySelector('.drag-temp-space');
                    if (tempSpace) {
                        widgetsContainer.removeChild(tempSpace);
                    }
                    
                    // Ripristina le transizioni smooth
                    const landingPage = document.querySelector('.landing-page');
                    if (landingPage) {
                        landingPage.style.scrollBehavior = 'smooth';
                    }
                    
                    // Animazione per il posizionamento finale
                    item.classList.add('widget-placed');
                    setTimeout(() => {
                        item.classList.remove('widget-placed');
                    }, 300);
                    
                    // Salva l'ordine dei widget
                    saveWidgetOrder(widgetsContainer);
                },
                onChange: function(evt) {
                    console.log('Order changed', evt.to);
                }
            });
            
            // Salva il riferimento all'istanza Sortable
            widgetsContainer._sortable = sortable;
            
            console.log('Sortable inizializzato con successo');
        } catch (error) {
            console.error('Errore nell\'inizializzazione di Sortable:', error);
        }
    }
}

// Funzione per salvare l'ordine dei widget
function saveWidgetOrder(widgetsContainer) {
    if (!widgetsContainer) return;

    try {
        const widgetOrder = Array.from(widgetsContainer.querySelectorAll('.widget'))
            .map(widget => {
                if (!widget || !widget.classList) {
                    return 'unknown';
                }
                // Estrai l'identificatore del widget (classe, id, ecc.)
                const classList = Array.from(widget.classList);
                // Cerca una classe che contenga "-widget" e non sia solo "widget"
                const typeClass = classList.find(cls => cls !== 'widget' && cls.includes('-widget'));
                return typeClass || widget.id || 'unknown';
            });
        
        // Salva l'ordine nel localStorage
        localStorage.setItem('widgetOrder', JSON.stringify(widgetOrder));
        console.log('Ordine dei widget salvato:', widgetOrder);
    } catch (error) {
        console.error('Errore durante il salvataggio dell\'ordine dei widget:', error);
    }
}

// Function to show the Add Widget Modal
function showAddWidgetModal() {
    const modal = document.getElementById('addWidgetModal');
    if (!modal) return;
    
    // Mostra la finestra modale
    modal.style.display = 'flex';
    
    const container = document.getElementById('widgetPreviewContainer');
    if (!container) return;
    
    // Pulisce il contenitore
    container.innerHTML = '';
    
    // Definisci i widget disponibili per categoria
    const widgetsByCategory = {
        productivity: [
            { type: 'notes', title: 'Note', icon: 'sticky-note', description: 'Prendi appunti e organizza le tue idee' },
            { type: 'tasks', title: 'Attività', icon: 'tasks', description: 'Gestisci le tue attività e i tuoi progetti' },
            { type: 'calendar', title: 'Calendario', icon: 'calendar-alt', description: 'Visualizza e gestisci i tuoi eventi' },
        ],
        dashboard: [
            { type: 'performance', title: 'Performance', icon: 'chart-line', description: 'Monitora le prestazioni del sistema' },
            { type: 'weather', title: 'Meteo', icon: 'cloud-sun', description: 'Controlla le previsioni meteo' },
            { type: 'clock', title: 'Orologio', icon: 'clock', description: 'Visualizza orari di diverse zone' },
        ],
        media: [
            { type: 'gallery', title: 'Galleria', icon: 'images', description: 'Visualizza le tue immagini recenti' },
            { type: 'music', title: 'Musica', icon: 'music', description: 'Controlla la riproduzione musicale' },
            { type: 'videos', title: 'Video', icon: 'video', description: 'Accedi ai tuoi video recenti' },
        ],
        tools: [
            { type: 'calculator', title: 'Calcolatrice', icon: 'calculator', description: 'Esegui calcoli rapidi' },
            { type: 'timer', title: 'Timer', icon: 'stopwatch', description: 'Imposta timer e promemoria' },
            { type: 'documents', title: 'Documenti', icon: 'file-alt', description: 'Accedi ai tuoi documenti recenti' },
            { type: 'links', title: 'Collegamenti', icon: 'link', description: 'Salva e organizza i tuoi link' },
        ]
    };
    
    // Aggiungi listener agli elementi delle schede
    const tabs = document.querySelectorAll('.widget-category-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Rimuovi la classe active da tutte le schede
            tabs.forEach(t => t.classList.remove('active'));
            // Aggiungi la classe active alla scheda cliccata
            this.classList.add('active');
            
            // Mostra i widget per la categoria selezionata
            const category = this.getAttribute('data-category');
            showWidgetsForCategory(category, widgetsByCategory, container);
        });
    });
    
    // Mostra i widget della categoria attiva per default (ora "all")
    const activeTab = document.querySelector('.widget-category-tab.active');
    const defaultCategory = activeTab ? activeTab.getAttribute('data-category') : 'all';
    showWidgetsForCategory(defaultCategory, widgetsByCategory, container);
    
    // Aggiungi listener per chiudere la finestra modale
    const closeBtn = modal.querySelector('.widget-preview-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }
}

// Function to display widgets for a specific category
function showWidgetsForCategory(category, widgetsByCategory, container) {
    container.innerHTML = '';
    
    let widgetsToShow = [];
    
    if (category === 'all') {
        // Per la categoria "all", mostra tutti i widget di tutte le categorie
        Object.values(widgetsByCategory).forEach(categoryWidgets => {
            widgetsToShow = widgetsToShow.concat(categoryWidgets);
        });
    } else {
        // Altrimenti mostra solo i widget della categoria selezionata
        widgetsToShow = widgetsByCategory[category] || [];
    }
    
    // Crea un elemento per ogni widget
    widgetsToShow.forEach(widget => {
        const widgetElement = document.createElement('div');
        widgetElement.className = 'widget-preview-item';
        widgetElement.dataset.widgetType = widget.type;
        
        widgetElement.innerHTML = `
            <div class="widget-preview-header">
                <i class="fas fa-${widget.icon}"></i>
                ${widget.title}
            </div>
            <div class="widget-preview-content">
                ${widget.description}
            </div>
            <div class="widget-preview-footer">
                <span class="widget-type-label">${getWidgetCategoryLabel(category === 'all' ? getCategoryForWidgetType(widget.type, widgetsByCategory) : category)}</span>
            </div>
        `;
        
        widgetElement.addEventListener('click', function() {
            const widgetType = this.dataset.widgetType;
            addWidgetToLandingPage(widgetType);
            document.getElementById('addWidgetModal').style.display = 'none';
        });
        
        container.appendChild(widgetElement);
    });
}

// Helper function to get category label in italiano
function getWidgetCategoryLabel(category) {
    const labels = {
        'productivity': 'Produttività',
        'dashboard': 'Dashboard',
        'media': 'Media',
        'tools': 'Strumenti'
    };
    return labels[category] || category;
}

// Funzione di utilità per ottenere la categoria di un widget dal suo tipo
function getCategoryForWidgetType(widgetType, widgetsByCategory) {
    for (const category in widgetsByCategory) {
        if (widgetsByCategory[category].some(widget => widget.type === widgetType)) {
            return category;
        }
    }
    return 'productivity'; // Default fallback
}

// Funzione per aggiungere un nuovo widget alla landing page in base al tipo
function addWidgetToLandingPage(widgetType, customContainer) {
    const widgetsContainer = customContainer || document.querySelector('.widgets-container');
    if (!widgetsContainer) return;
    
    let newWidget = document.createElement('div');
    newWidget.className = `widget ${widgetType}-widget`;
    
    switch(widgetType) {
        case 'performance':
            newWidget.id = 'performanceWidget';
            newWidget.innerHTML = `
                <div class="widget-header">
                    <div class="widget-move-handle" title="Trascina per riordinare"><i class="fas fa-grip-vertical"></i></div>
                    <div class="widget-title"><i class="fas fa-microchip"></i> Prestazioni Sistema</div>
                    <div class="widget-close"><i class="fas fa-times"></i></div>
                </div>
                <div class="widget-content">
                    <div class="performance-stats">
                        <div class="stat-item">
                            <div class="stat-value" id="cpuValue">--</div>
                            <div class="stat-label">CPU</div>
                            <div class="progress-bar"><div class="progress-fill cpu" id="cpuFill"></div></div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value" id="memoryValue">--</div>
                            <div class="stat-label">Memoria</div>
                            <div class="progress-bar"><div class="progress-fill memory" id="memoryFill"></div></div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value" id="diskValue">--</div>
                            <div class="stat-label">Disco</div>
                            <div class="progress-bar"><div class="progress-fill disk" id="diskFill"></div></div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value" id="networkValue">--</div>
                            <div class="stat-label">Rete</div>
                            <div class="progress-bar"><div class="progress-fill network" id="networkFill"></div></div>
                        </div>
                    </div>
                </div>
            `;
            break;
        case 'news':
            newWidget.innerHTML = `
                <div class="widget-header">
                    <div class="widget-move-handle"><i class="fas fa-grip-vertical"></i></div>
                    <div class="widget-title"><i class="fas fa-newspaper"></i> Ultime Notizie</div>
                    <div class="widget-close"><i class="fas fa-times"></i></div>
                </div>
                <div class="widget-content">
                    <div class="news-list">
                        <div class="news-item">
                            <div class="news-image"><i class="fas fa-newspaper"></i></div>
                            <div class="news-content">
                                <div class="news-title">L'intelligenza artificiale continua a evolversi rapidamente</div>
                                <div class="news-source">Tech Daily</div>
                            </div>
                        </div>
                        <div class="news-item">
                            <div class="news-image"><i class="fas fa-newspaper"></i></div>
                            <div class="news-content">
                                <div class="news-title">Nuovi modelli linguistici raggiungono risultati impressionanti</div>
                                <div class="news-source">AI News</div>
                            </div>
                        </div>
                    </div>
                </div>`;
            break;
        case 'actions':
            newWidget.innerHTML = `
                <div class="widget-header">
                    <div class="widget-move-handle"><i class="fas fa-grip-vertical"></i></div>
                    <div class="widget-title"><i class="fas fa-bolt"></i> Azioni Rapide</div>
                    <div class="widget-close"><i class="fas fa-times"></i></div>
                </div>
                <div class="widget-content">
                    <div class="quick-actions">
                        <button class="action-button"><i class="fas fa-image"></i> Crea Immagine</button>
                        <button class="action-button"><i class="fas fa-code"></i> Scrivi Codice</button>
                        <button class="action-button"><i class="fas fa-tasks"></i> Crea Piano</button>
                        <button class="action-button"><i class="fas fa-search"></i> Ricerca Web</button>
                    </div>
                </div>`;
            break;
        case 'notes':
            newWidget.innerHTML = `
                <div class="widget-header">
                    <div class="widget-move-handle" title="Trascina per riordinare"><i class="fas fa-grip-vertical"></i></div>
                    <div class="widget-title"><i class="fas fa-sticky-note"></i> Le Tue Note</div>
                    <div class="widget-close"><i class="fas fa-times"></i></div>
                </div>
                <div class="widget-content">
                    <div class="notes-container">
                        <div class="note-item">
                            <div class="note-title">Idee per il progetto</div>
                            <div class="note-date">Creata ieri</div>
                            <div class="note-preview">Implementare nuove funzionalità per l'interfaccia utente...</div>
                        </div>
                        <div class="note-item">
                            <div class="note-title">Lista della spesa</div>
                            <div class="note-date">Creata 3 giorni fa</div>
                            <div class="note-preview">Latte, pane, frutta, verdura...</div>
                        </div>
                        <div class="note-item">
                            <div class="note-title">Riunione del team</div>
                            <div class="note-date">Creata 1 settimana fa</div>
                            <div class="note-preview">Punti da discutere: roadmap Q3, nuove funzionalità...</div>
                        </div>
                        <div class="add-note-button">
                            <i class="fas fa-plus"></i>
                            <span>Aggiungi nota</span>
                        </div>
                    </div>
                </div>`;
            break;
        case 'calendar':
            newWidget.innerHTML = `
                <div class="widget-header">
                    <div class="widget-move-handle"><i class="fas fa-grip-vertical"></i></div>
                    <div class="widget-title"><i class="fas fa-calendar-alt"></i> Calendario</div>
                    <div class="widget-close"><i class="fas fa-times"></i></div>
                </div>
                <div class="widget-content">
                    <div class="mini-calendar">
                        <div class="calendar-header">
                            <div class="month-nav"><i class="fas fa-chevron-left"></i></div>
                            <div class="current-month">Novembre 2023</div>
                            <div class="month-nav"><i class="fas fa-chevron-right"></i></div>
                        </div>
                        <div class="weekdays">
                            <div>Lun</div><div>Mar</div><div>Mer</div><div>Gio</div><div>Ven</div><div>Sab</div><div>Dom</div>
                        </div>
                        <div class="calendar-days">
                            <div class="prev-month">30</div><div class="prev-month">31</div>
                            <div>1</div><div>2</div><div>3</div><div>4</div><div>5</div>
                            <div>6</div><div>7</div><div class="today">8</div><div class="has-event">9</div><div>10</div>
                            <div>11</div><div>12</div><div>13</div><div>14</div><div>15</div>
                            <div>16</div><div>17</div><div>18</div><div>19</div><div>20</div>
                            <div>21</div><div>22</div><div>23</div><div>24</div><div>25</div>
                            <div>26</div><div>27</div><div>28</div><div>29</div><div>30</div>
                            <div class="next-month">1</div><div class="next-month">2</div><div class="next-month">3</div>
                        </div>
                        <div class="upcoming-events">
                            <div class="upcoming-title">Prossimi eventi</div>
                            <div class="event-item">
                                <div class="event-dot"></div>
                                <div class="event-info">
                                    <div class="event-name">Riunione Team</div>
                                    <div class="event-time">9 Nov, 10:00</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
            break;
        case 'weather':
            newWidget.innerHTML = `
                <div class="widget-header">
                    <div class="widget-move-handle"><i class="fas fa-grip-vertical"></i></div>
                    <div class="widget-title"><i class="fas fa-cloud-sun"></i> Meteo</div>
                    <div class="widget-close"><i class="fas fa-times"></i></div>
                </div>
                <div class="widget-content">
                    <div class="weather-container">
                        <div class="current-weather">
                            <div class="weather-location">Milano, IT</div>
                            <div class="weather-icon"><i class="fas fa-sun"></i></div>
                            <div class="weather-temp">18°C</div>
                            <div class="weather-description">Soleggiato</div>
                        </div>
                        <div class="weather-forecast">
                            <div class="forecast-item">
                                <div class="forecast-day">Dom</div>
                                <div class="forecast-icon"><i class="fas fa-cloud-sun"></i></div>
                                <div class="forecast-temp">16°C</div>
                            </div>
                            <div class="forecast-item">
                                <div class="forecast-day">Lun</div>
                                <div class="forecast-icon"><i class="fas fa-cloud"></i></div>
                                <div class="forecast-temp">15°C</div>
                            </div>
                            <div class="forecast-item">
                                <div class="forecast-day">Mar</div>
                                <div class="forecast-icon"><i class="fas fa-cloud-rain"></i></div>
                                <div class="forecast-temp">13°C</div>
                            </div>
                        </div>
                    </div>
                </div>`;
            break;
        case 'tasks':
            newWidget.innerHTML = `
                <div class="widget-header">
                    <div class="widget-move-handle" title="Trascina per riordinare"><i class="fas fa-grip-vertical"></i></div>
                    <div class="widget-title"><i class="fas fa-tasks"></i> Attività</div>
                    <div class="widget-close"><i class="fas fa-times"></i></div>
                </div>
                <div class="widget-content">
                    <div class="tasks-container">
                        <div class="task-item">
                            <input type="checkbox" id="task1" class="task-checkbox">
                            <label for="task1" class="task-label">Completare il design della landing page</label>
                        </div>
                        <div class="task-item">
                            <input type="checkbox" id="task2" class="task-checkbox" checked>
                            <label for="task2" class="task-label">Implementare il drag & drop</label>
                        </div>
                        <div class="task-item">
                            <input type="checkbox" id="task3" class="task-checkbox">
                            <label for="task3" class="task-label">Ottimizzare le prestazioni</label>
                        </div>
                        <div class="task-item">
                            <input type="checkbox" id="task4" class="task-checkbox">
                            <label for="task4" class="task-label">Testare su diversi dispositivi</label>
                        </div>
                        <div class="add-task-button">
                            <i class="fas fa-plus"></i>
                            <span>Aggiungi attività</span>
                        </div>
                    </div>
                </div>`;
            break;
        case 'documents':
            newWidget.innerHTML = `
                <div class="widget-header">
                    <div class="widget-move-handle" title="Trascina per riordinare"><i class="fas fa-grip-vertical"></i></div>
                    <div class="widget-title"><i class="fas fa-file-alt"></i> Documenti Recenti</div>
                    <div class="widget-close"><i class="fas fa-times"></i></div>
                </div>
                <div class="widget-content">
                    <div class="documents-container">
                        <div class="document-item">
                            <div class="document-icon"><i class="fas fa-file-pdf"></i></div>
                            <div class="document-info">
                                <div class="document-name">Report_Q3_2023.pdf</div>
                                <div class="document-date">Modificato 2 ore fa</div>
                            </div>
                        </div>
                        <div class="document-item">
                            <div class="document-icon"><i class="fas fa-file-word"></i></div>
                            <div class="document-info">
                                <div class="document-name">Proposta_Progetto.docx</div>
                                <div class="document-date">Modificato ieri</div>
                            </div>
                        </div>
                        <div class="document-item">
                            <div class="document-icon"><i class="fas fa-file-excel"></i></div>
                            <div class="document-info">
                                <div class="document-name">Budget_2023.xlsx</div>
                                <div class="document-date">Modificato 3 giorni fa</div>
                            </div>
                        </div>
                    </div>
                </div>`;
            break;
        case 'links':
            newWidget.innerHTML = `
                <div class="widget-header">
                    <div class="widget-move-handle" title="Trascina per riordinare"><i class="fas fa-grip-vertical"></i></div>
                    <div class="widget-title"><i class="fas fa-link"></i> Link Rapidi</div>
                    <div class="widget-close"><i class="fas fa-times"></i></div>
                </div>
                <div class="widget-content">
                    <div class="quick-links">
                        <a href="#" class="link-item">
                            <div class="link-icon"><i class="fas fa-github"></i></div>
                            <div class="link-title">GitHub</div>
                        </a>
                        <a href="#" class="link-item">
                            <div class="link-icon"><i class="fas fa-trello"></i></div>
                            <div class="link-title">Trello</div>
                        </a>
                        <a href="#" class="link-item">
                            <div class="link-icon"><i class="fas fa-envelope"></i></div>
                            <div class="link-title">Gmail</div>
                        </a>
                        <a href="#" class="link-item">
                            <div class="link-icon"><i class="fab fa-slack"></i></div>
                            <div class="link-title">Slack</div>
                        </a>
                        <div class="add-link-button">
                            <i class="fas fa-plus"></i>
                            <span>Aggiungi link</span>
                        </div>
                    </div>
                </div>`;
            break;
        case 'calculator':
            newWidget.innerHTML = `
                <div class="widget-header">
                    <div class="widget-move-handle" title="Trascina per riordinare"><i class="fas fa-grip-vertical"></i></div>
                    <div class="widget-title"><i class="fas fa-calculator"></i> Calcolatrice</div>
                    <div class="widget-close"><i class="fas fa-times"></i></div>
                </div>
                <div class="widget-content">
                    <div class="calculator-container">
                        <div class="calculator-display">0</div>
                        <div class="calculator-buttons">
                            <button class="calc-btn function">C</button>
                            <button class="calc-btn function">±</button>
                            <button class="calc-btn function">%</button>
                            <button class="calc-btn operator">÷</button>
                            <button class="calc-btn">7</button>
                            <button class="calc-btn">8</button>
                            <button class="calc-btn">9</button>
                            <button class="calc-btn operator">×</button>
                            <button class="calc-btn">4</button>
                            <button class="calc-btn">5</button>
                            <button class="calc-btn">6</button>
                            <button class="calc-btn operator">-</button>
                            <button class="calc-btn">1</button>
                            <button class="calc-btn">2</button>
                            <button class="calc-btn">3</button>
                            <button class="calc-btn operator">+</button>
                            <button class="calc-btn zero">0</button>
                            <button class="calc-btn">.</button>
                            <button class="calc-btn equals">=</button>
                        </div>
                    </div>
                </div>`;
            break;
        case 'system-status':
            newWidget.innerHTML = `
                <div class="widget-header">
                    <div class="widget-move-handle" title="Trascina per riordinare"><i class="fas fa-grip-vertical"></i></div>
                    <div class="widget-title"><i class="fas fa-server"></i> Stato Sistema</div>
                    <div class="widget-close"><i class="fas fa-times"></i></div>
                </div>
                <div class="widget-content">
                    <div class="system-status-container">
                        <div class="status-item">
                            <div class="status-name">Server Principale</div>
                            <div class="status-indicator online">Online</div>
                        </div>
                        <div class="status-item">
                            <div class="status-name">Database</div>
                            <div class="status-indicator online">Online</div>
                        </div>
                        <div class="status-item">
                            <div class="status-name">API Service</div>
                            <div class="status-indicator warning">Degradato</div>
                        </div>
                        <div class="status-item">
                            <div class="status-name">Backup Service</div>
                            <div class="status-indicator offline">Offline</div>
                        </div>
                        <div class="status-uptime">
                            <div class="uptime-label">Uptime:</div>
                            <div class="uptime-value">23 giorni, 4 ore</div>
                        </div>
                    </div>
                </div>`;
            break;
        case 'music':
            newWidget.innerHTML = `
                <div class="widget-header">
                    <div class="widget-move-handle" title="Trascina per riordinare"><i class="fas fa-grip-vertical"></i></div>
                    <div class="widget-title"><i class="fas fa-music"></i> Riproduttore Musicale</div>
                    <div class="widget-close"><i class="fas fa-times"></i></div>
                </div>
                <div class="widget-content">
                    <div class="music-player">
                        <div class="now-playing">
                            <div class="album-cover"></div>
                            <div class="track-info">
                                <div class="track-title">Imagine</div>
                                <div class="track-artist">John Lennon</div>
                            </div>
                        </div>
                        <div class="player-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 45%"></div>
                            </div>
                            <div class="progress-time">
                                <span class="current-time">1:45</span>
                                <span class="total-time">3:52</span>
                            </div>
                        </div>
                        <div class="player-controls">
                            <button class="control-btn"><i class="fas fa-step-backward"></i></button>
                            <button class="control-btn play-btn"><i class="fas fa-play"></i></button>
                            <button class="control-btn"><i class="fas fa-step-forward"></i></button>
                            <button class="control-btn"><i class="fas fa-random"></i></button>
                            <button class="control-btn"><i class="fas fa-redo"></i></button>
                        </div>
                    </div>
                </div>`;
            break;
        case 'translator':
            newWidget.innerHTML = `
                <div class="widget-header">
                    <div class="widget-move-handle" title="Trascina per riordinare"><i class="fas fa-grip-vertical"></i></div>
                    <div class="widget-title"><i class="fas fa-language"></i> Traduttore</div>
                    <div class="widget-close"><i class="fas fa-times"></i></div>
                </div>
                <div class="widget-content">
                    <div class="translator-container">
                        <div class="translator-header">
                            <select class="language-select">
                                <option value="it">Italiano</option>
                                <option value="en">Inglese</option>
                                <option value="fr">Francese</option>
                                <option value="de">Tedesco</option>
                                <option value="es">Spagnolo</option>
                            </select>
                            <button class="swap-btn"><i class="fas fa-exchange-alt"></i></button>
                            <select class="language-select">
                                <option value="en">Inglese</option>
                                <option value="it">Italiano</option>
                                <option value="fr">Francese</option>
                                <option value="de">Tedesco</option>
                                <option value="es">Spagnolo</option>
                            </select>
                        </div>
                        <div class="translator-content">
                            <textarea class="translator-input" placeholder="Inserisci il testo da tradurre..."></textarea>
                            <div class="translator-output">Enter the text to translate...</div>
                        </div>
                        <div class="translator-footer">
                            <button class="translate-btn">Traduci</button>
                            <button class="copy-btn"><i class="fas fa-copy"></i></button>
                        </div>
                    </div>
                </div>`;
            break;
        case 'color-picker':
            newWidget.innerHTML = `
                <div class="widget-header">
                    <div class="widget-move-handle" title="Trascina per riordinare"><i class="fas fa-grip-vertical"></i></div>
                    <div class="widget-title"><i class="fas fa-palette"></i> Color Picker</div>
                    <div class="widget-close"><i class="fas fa-times"></i></div>
                </div>
                <div class="widget-content">
                    <div class="color-picker-container">
                        <div class="color-preview" style="background-color: #6b62ff;"></div>
                        <div class="color-inputs">
                            <div class="color-input-group">
                                <label>HEX</label>
                                <input type="text" value="#6b62ff" class="color-input hex-input">
                            </div>
                            <div class="color-input-group">
                                <label>RGB</label>
                                <input type="text" value="107, 98, 255" class="color-input rgb-input">
                            </div>
                        </div>
                        <div class="saved-colors">
                            <div class="saved-color" style="background-color: #6b62ff;"></div>
                            <div class="saved-color" style="background-color: #ff6262;"></div>
                            <div class="saved-color" style="background-color: #62ff8a;"></div>
                            <div class="saved-color" style="background-color: #62c4ff;"></div>
                            <div class="saved-color" style="background-color: #ffcc62;"></div>
                            <div class="add-color"><i class="fas fa-plus"></i></div>
                        </div>
                    </div>
                </div>`;
            break;
        case 'videos':
            newWidget.innerHTML = `
                <div class="widget-header">
                    <div class="widget-move-handle" title="Trascina per riordinare"><i class="fas fa-grip-vertical"></i></div>
                    <div class="widget-title"><i class="fas fa-film"></i> Video Recenti</div>
                    <div class="widget-close"><i class="fas fa-times"></i></div>
                </div>
                <div class="widget-content">
                    <div class="videos-container">
                        <div class="video-item">
                            <div class="video-thumbnail">
                                <div class="video-play-icon"><i class="fas fa-play"></i></div>
                            </div>
                            <div class="video-info">
                                <div class="video-title">Tutorial: Creare una Landing Page</div>
                                <div class="video-duration">12:34</div>
                            </div>
                        </div>
                        <div class="video-item">
                            <div class="video-thumbnail">
                                <div class="video-play-icon"><i class="fas fa-play"></i></div>
                            </div>
                            <div class="video-info">
                                <div class="video-title">Come usare l'API di Synapse</div>
                                <div class="video-duration">8:45</div>
                            </div>
                        </div>
                        <div class="video-item">
                            <div class="video-thumbnail">
                                <div class="video-play-icon"><i class="fas fa-play"></i></div>
                            </div>
                            <div class="video-info">
                                <div class="video-title">Demo dell'interfaccia AI</div>
                                <div class="video-duration">5:21</div>
                            </div>
                        </div>
                    </div>
                </div>`;
            break;
        case 'media-controls':
            newWidget.innerHTML = `
                <div class="widget-header">
                    <div class="widget-move-handle" title="Trascina per riordinare"><i class="fas fa-grip-vertical"></i></div>
                    <div class="widget-title"><i class="fas fa-play-circle"></i> Controlli Multimediali</div>
                    <div class="widget-close"><i class="fas fa-times"></i></div>
                </div>
                <div class="widget-content">
                    <div class="media-controls-container">
                        <div class="media-info">
                            <div class="media-title">Nessun media in riproduzione</div>
                            <div class="media-source">Apri un'app multimediale per iniziare</div>
                        </div>
                        <div class="media-playback-controls">
                            <button class="media-control-btn"><i class="fas fa-step-backward"></i></button>
                            <button class="media-control-btn play-pause-btn"><i class="fas fa-play"></i></button>
                            <button class="media-control-btn"><i class="fas fa-step-forward"></i></button>
                        </div>
                        <div class="volume-control">
                            <i class="fas fa-volume-up"></i>
                            <div class="volume-slider">
                                <div class="volume-slider-fill" style="width: 70%"></div>
                            </div>
                        </div>
                    </div>
                </div>`;
            break;
        case 'code-snippets':
            newWidget.innerHTML = `
                <div class="widget-header">
                    <div class="widget-move-handle" title="Trascina per riordinare"><i class="fas fa-grip-vertical"></i></div>
                    <div class="widget-title"><i class="fas fa-code"></i> Snippet di Codice</div>
                    <div class="widget-close"><i class="fas fa-times"></i></div>
                </div>
                <div class="widget-content">
                    <div class="code-snippets-container">
                        <div class="code-snippet-item">
                            <div class="snippet-header">
                                <div class="snippet-name">Fetch API Template</div>
                                <div class="snippet-lang">JavaScript</div>
                            </div>
                            <pre class="snippet-code">fetch('https://api.example.com/data')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));</pre>
                            <div class="snippet-actions">
                                <button class="snippet-copy-btn"><i class="fas fa-copy"></i></button>
                                <button class="snippet-edit-btn"><i class="fas fa-edit"></i></button>
                            </div>
                        </div>
                        <div class="add-snippet-button">
                            <i class="fas fa-plus"></i>
                            <span>Aggiungi snippet</span>
                        </div>
                    </div>
                </div>`;
            break;
        default:
            newWidget.innerHTML = `
                <div class="widget-header">
                    <div class="widget-move-handle"><i class="fas fa-grip-vertical"></i></div>
                    <div class="widget-title"><i class="fas fa-puzzle-piece"></i> Widget Personalizzato</div>
                    <div class="widget-close"><i class="fas fa-times"></i></div>
                </div>
                <div class="widget-content">
                    <p>Personalizza questo widget con le tue informazioni</p>
                </div>`;
    }
    
    // Aggiunge il nuovo widget al container
    widgetsContainer.prepend(newWidget);
    
    // Aggiungi la pulsazione animata alla maniglia di trascinamento per attirare l'attenzione
    const moveHandle = newWidget.querySelector('.widget-move-handle');
    if (moveHandle) {
        setTimeout(() => {
            moveHandle.style.animation = 'pulse 2s infinite alternate';
            // Rimuovi l'animazione dopo alcuni secondi
            setTimeout(() => {
                moveHandle.style.animation = '';
            }, 5000);
        }, 1000);
    }
    
    // Aggiunge funzionalità di chiusura al widget
    const closeBtn = newWidget.querySelector('.widget-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', function(e) {
            const widget = e.target.closest('.widget');
            if (widget) {
                widget.classList.add('widget-removing');
                setTimeout(() => widget.remove(), 300);
            }
        });
    }
    
    // Aggiorna performance widget se necessario
    if (widgetType === 'performance') {
        updateSystemPerformance();
    }
}

function showChatInterface() {
  console.log('Showing Chat Interface');
  const chatMessages = document.getElementById('chatMessages');
  if (!chatMessages) return;
  
  chatMessages.innerHTML = '';
  chatMessages.style = ''; // Reset any custom styles
  chatMessages.classList.remove('workflow-fullscreen', 'calendar-fullscreen', 'community-fullscreen');
  
  // Assicurati che l'input chat sia visibile e impostato correttamente
  const chatInputContainer = document.getElementById('userInput')?.closest('.input-container');
  if (chatInputContainer) {
    chatInputContainer.style.display = '';
    
    // Ripristina il placeholder predefinito per l'input chat
    const userInput = document.getElementById('userInput');
    if (userInput) {
      userInput.placeholder = 'Come posso aiutarti oggi?';
    }
  }
  
  // Mostra la sidebar e ripristina la larghezza del contenuto
  const sidebar = document.querySelector('.sidebar');
  if (sidebar) {
    sidebar.classList.remove('community-hidden');
  }
  
  const chatContainer = document.querySelector('.chat-container');
  if (chatContainer) {
    chatContainer.classList.remove('community-fullwidth');
  }
}

function showWorkflowEditor() {
    console.log("Showing Workflow Editor");
    const chatMessages = document.getElementById('chatMessages'); const chatInputContainer = document.getElementById('userInput')?.closest('.input-container');
    if (!chatMessages) { console.error("Cannot show workflow"); return; }
    chatMessages.innerHTML = '';
    chatMessages.classList.remove('calendar-fullscreen', 'community-fullscreen');
    chatMessages.classList.add('workflow-fullscreen');
    if (chatInputContainer) chatInputContainer.style.display = 'none';
    
    if (window.workflowFunctions?.initialize) { try { window.workflowFunctions.initialize(); } catch (error) { console.error('Workflow init error:', error); } }
    else { console.error('Workflow functions not available.'); }
    document.title = 'Workflow - Synapse'; const _updateWindowTitle = () => { const wt=document.querySelector('.window-title'); if(wt) wt.textContent = document.title || 'Synapse'; }; _updateWindowTitle();
}

function showCalendar() {
  console.log('Showing Calendar UI');
  const chatMessages = document.getElementById('chatMessages');
  if (chatMessages) {
    chatMessages.innerHTML = ''; // Clear existing content
    chatMessages.classList.add('calendar-fullscreen');
    
    // Load calendar content if not already loaded
    if (!chatMessages.querySelector('.calendar-container')) {
      loadCalendarContent(chatMessages);
    }
  }
  
  // Hide chat input if needed
  const chatInputContainer = document.getElementById('userInput')?.closest('.input-container');
  if (chatInputContainer) chatInputContainer.style.display = 'none';
  
  document.title = 'Calendar - Synapse'; const _updateWindowTitle = () => { const wt=document.querySelector('.window-title'); if(wt) wt.textContent = document.title || 'Synapse'; }; _updateWindowTitle();
}

function showCommunity() {
  console.log('Showing Community UI');
  const chatMessages = document.getElementById('chatMessages');
  if (chatMessages) {
    chatMessages.innerHTML = ''; // Clear existing content
    chatMessages.classList.add('community-fullscreen');
    
    // Load community content
    loadCommunityContent(chatMessages);
  }
  
  // Nascondi l'input della chat nella Community
  const chatInputContainer = document.getElementById('userInput')?.closest('.input-container');
  if (chatInputContainer) {
    chatInputContainer.style.display = 'none';
  }
  
  // Nascondi la sidebar quando si visualizza la Community
  const sidebar = document.querySelector('.sidebar');
  if (sidebar) {
    sidebar.classList.add('community-hidden');
  }
  
  // Allarga il contenuto a tutta la larghezza disponibile
  const chatContainer = document.querySelector('.chat-container');
  if (chatContainer) {
    chatContainer.classList.add('community-fullwidth');
  }
  
  document.title = 'Community - Synapse'; 
  const _updateWindowTitle = () => { 
    const wt = document.querySelector('.window-title'); 
    if(wt) wt.textContent = document.title || 'Synapse'; 
  }; 
  _updateWindowTitle();
}

function loadCommunityContent(container) {
  // Create main container for community
  const communityContainer = document.createElement('div');
  communityContainer.className = 'community-container';
  
  // Create two-column layout
  const communityLayout = document.createElement('div');
  communityLayout.className = 'community-layout';
  
  // Left column - Research & Projects Feed
  const feedColumn = document.createElement('div');
  feedColumn.className = 'community-feed-column';
  
  // Create header for feed
  const feedHeader = document.createElement('div');
  feedHeader.className = 'community-header';
  feedHeader.innerHTML = `
    <div class="community-header-left">
      <h2>Hub Ricerca & Innovazione</h2>
    </div>
    <div class="community-header-right">
      <button class="community-filter-btn">
        <i class="fas fa-filter"></i>
        <span>Filtra per: Più recenti</span>
      </button>
    </div>
  `;
  feedColumn.appendChild(feedHeader);
  
  // Create feed content
  const feedContent = document.createElement('div');
  feedContent.className = 'community-feed-content';
  
  // Add category navigation
  const categoryNav = document.createElement('div');
  categoryNav.className = 'community-categories';
  categoryNav.innerHTML = `
    <div class="category-item active" data-category="all">
      <i class="fas fa-globe"></i>
      <span>Tutti</span>
    </div>
    <div class="category-item" data-category="ai-research">
      <i class="fas fa-brain"></i>
      <span>Ricerca AI</span>
    </div>
    <div class="category-item" data-category="projects">
      <i class="fas fa-project-diagram"></i>
      <span>Progetti</span>
    </div>
    <div class="category-item" data-category="papers">
      <i class="fas fa-file-alt"></i>
      <span>Paper</span>
    </div>
    <div class="category-item" data-category="datasets">
      <i class="fas fa-database"></i>
      <span>Dataset</span>
    </div>
  `;
  feedContent.appendChild(categoryNav);
  
  // Add some sample research posts
  const posts = [
    {
      id: 1,
      type: 'research',
      category: 'ai-research',
      title: 'Progressi nel Transfer Learning per modelli di linguaggio',
      author: 'Marco Rossi',
      authorTitle: 'AI Researcher @ UniversitàTech',
      avatar: 'https://i.pravatar.cc/150?img=1',
      summary: 'Questa ricerca esplora le tecniche avanzate di transfer learning nei Large Language Models, con particolare attenzione all\'efficienza computazionale in contesti a risorse limitate.',
      tags: ['NLP', 'Transfer Learning', 'LLM'],
      likes: 42,
      comments: 8,
      date: '2 giorni fa',
      hasAttachment: true,
      attachmentType: 'pdf'
    },
    {
      id: 2,
      type: 'project',
      category: 'projects',
      title: 'Framework open source per ottimizzazione di reti neurali su edge devices',
      author: 'Elena Verdi',
      authorTitle: 'Senior Software Engineer',
      avatar: 'https://i.pravatar.cc/150?img=5',
      summary: 'Il nostro team ha sviluppato un nuovo framework per l\'ottimizzazione di modelli di deep learning su dispositivi con risorse limitate. I test dimostrano un miglioramento del 40% nella velocità di inferenza con riduzione minima di accuratezza.',
      tags: ['Edge AI', 'Optimization', 'Open Source'],
      likes: 36,
      comments: 12,
      date: '3 giorni fa',
      hasAttachment: true,
      attachmentType: 'github',
      image: 'https://picsum.photos/500/300?random=2'
    },
    {
      id: 3,
      type: 'paper',
      category: 'papers',
      title: 'Neural Ensemble Methods for Uncertainty Quantification in Medical Imaging',
      author: 'Paolo Bianchi',
      authorTitle: 'PhD Researcher',
      avatar: 'https://i.pravatar.cc/150?img=3',
      summary: 'Presentiamo un nuovo metodo per quantificare l\'incertezza nelle predizioni di modelli di deep learning per immagini mediche, utilizzando ensemble di reti neurali con dropout bayesiano.',
      tags: ['Medical Imaging', 'Uncertainty', 'Bayesian DL'],
      likes: 29,
      comments: 5,
      date: '5 giorni fa',
      hasAttachment: true,
      attachmentType: 'pdf'
    },
    {
      id: 4,
      type: 'dataset',
      category: 'datasets',
      title: 'ItalianVoices: Dataset per sintesi vocale in italiano',
      author: 'Laura Romano',
      authorTitle: 'Data Scientist',
      avatar: 'https://i.pravatar.cc/150?img=4',
      summary: 'Rilasciamo un nuovo dataset di 100+ ore di registrazioni audio in italiano, annotate e bilanciate per genere e accenti regionali, ideale per training di modelli TTS di alta qualità.',
      tags: ['TTS', 'Dataset', 'Italian'],
      likes: 51,
      comments: 7,
      date: '1 settimana fa',
      hasAttachment: true,
      attachmentType: 'dataset'
    }
  ];
  
  posts.forEach(post => {
    const postElement = createResearchPostElement(post);
    feedContent.appendChild(postElement);
  });
  
  feedColumn.appendChild(feedContent);
  
  // Right column - Resources & Highlights
  const resourcesColumn = document.createElement('div');
  resourcesColumn.className = 'community-trends-column';
  
  // Create highlighted research section
  const highlightedSection = document.createElement('div');
  highlightedSection.className = 'community-section highlighted-section';
  highlightedSection.innerHTML = `
    <h3>Paper in evidenza</h3>
    <div class="featured-paper">
      <div class="paper-header">
        <div class="paper-journal">arXiv 2023</div>
        <div class="paper-badge new-badge">Nuovo</div>
      </div>
      <h4 class="paper-title">Scaling Laws for Generative Mixed-Modal Models</h4>
      <div class="paper-authors">A. Johnson, S. Chen, M. Müller, et al.</div>
      <p class="paper-abstract">Analizziamo come i modelli multimodali scalino con dimensioni, dataset e computing, proponendo nuove leggi di scaling che predicono performance e generalizzazione.</p>
      <div class="paper-actions">
        <button class="paper-action-btn">
          <i class="fas fa-file-pdf"></i> PDF
        </button>
        <button class="paper-action-btn">
          <i class="fas fa-code"></i> Codice
        </button>
        <button class="paper-action-btn">
          <i class="fas fa-bookmark"></i> Salva
        </button>
      </div>
    </div>
  `;
  
  // Create upcoming events section
  const eventsSection = document.createElement('div');
  eventsSection.className = 'community-section events-section';
  eventsSection.innerHTML = `
    <h3>Eventi in arrivo</h3>
    <div class="upcoming-events">
      <div class="event-item">
        <div class="event-date">
          <div class="event-month">MAG</div>
          <div class="event-day">15</div>
        </div>
        <div class="event-details">
          <div class="event-title">AI Research Symposium</div>
          <div class="event-info"><i class="fas fa-video"></i> Online</div>
          <div class="event-participants">12 partecipanti</div>
        </div>
      </div>
      <div class="event-item">
        <div class="event-date">
          <div class="event-month">GIU</div>
          <div class="event-day">02</div>
        </div>
        <div class="event-details">
          <div class="event-title">Workshop Deep Learning</div>
          <div class="event-info"><i class="fas fa-map-marker-alt"></i> Milano</div>
          <div class="event-participants">45 partecipanti</div>
        </div>
      </div>
      <div class="event-action">
        <button class="view-all-btn">Visualizza tutti gli eventi</button>
      </div>
    </div>
  `;
  
  // Create resources section
  const resourcesSection = document.createElement('div');
  resourcesSection.className = 'community-section resources-section';
  resourcesSection.innerHTML = `
    <h3>Risorse utili</h3>
    <div class="resources-list">
      <div class="resource-item">
        <div class="resource-icon">
          <i class="fas fa-code"></i>
        </div>
        <div class="resource-content">
          <div class="resource-title">Libreria di algoritmi AI</div>
          <div class="resource-description">Implementazioni ottimizzate di algoritmi ML/DL</div>
        </div>
      </div>
      <div class="resource-item">
        <div class="resource-icon collection-icon">
          <i class="fas fa-cube"></i>
        </div>
        <div class="resource-content">
          <div class="resource-title">Modelli pre-addestrati</div>
          <div class="resource-description">Collection di modelli per vari task</div>
        </div>
      </div>
      <div class="resource-item">
        <div class="resource-icon tutorial-icon">
          <i class="fas fa-graduation-cap"></i>
        </div>
        <div class="resource-content">
          <div class="resource-title">Corsi e tutorial</div>
          <div class="resource-description">Materiale educativo aggiornato</div>
        </div>
      </div>
      <div class="resource-item">
        <div class="resource-icon mentorship-icon">
          <i class="fas fa-users"></i>
        </div>
        <div class="resource-content">
          <div class="resource-title">Mentorship program</div>
          <div class="resource-description">Trova un mentor per i tuoi progetti</div>
        </div>
      </div>
    </div>
  `;
  
  resourcesColumn.appendChild(highlightedSection);
  resourcesColumn.appendChild(eventsSection);
  resourcesColumn.appendChild(resourcesSection);
  
  // Add columns to layout
  communityLayout.appendChild(feedColumn);
  communityLayout.appendChild(resourcesColumn);
  
  // Add layout to container
  communityContainer.appendChild(communityLayout);
  
  // Add container to main content
  container.appendChild(communityContainer);
  
  // Add event listeners for interactions
  addCommunityEventListeners();
}

function createResearchPostElement(post) {
  const postElement = document.createElement('div');
  postElement.className = `community-post research-post ${post.type}-post`;
  postElement.dataset.postId = post.id;
  postElement.dataset.category = post.category;
  
  // Post header with author info
  const postHeader = document.createElement('div');
  postHeader.className = 'post-header research-header';
  
  // Post type badge
  let typeBadge = '';
  if (post.type === 'research') {
    typeBadge = '<div class="post-type-badge research-badge">Ricerca</div>';
  } else if (post.type === 'project') {
    typeBadge = '<div class="post-type-badge project-badge">Progetto</div>';
  } else if (post.type === 'paper') {
    typeBadge = '<div class="post-type-badge paper-badge">Paper</div>';
  } else if (post.type === 'dataset') {
    typeBadge = '<div class="post-type-badge dataset-badge">Dataset</div>';
  }
  
  postHeader.innerHTML = `
    <img src="${post.avatar}" alt="${post.author}" class="post-avatar">
    <div class="post-author-info">
      <div class="post-author-name">${post.author}</div>
      <div class="post-author-title">${post.authorTitle}</div>
    </div>
    ${typeBadge}
    <div class="post-date">${post.date}</div>
    <div class="post-actions">
      <button class="post-action-btn">
        <i class="fas fa-ellipsis-h"></i>
      </button>
    </div>
  `;
  
  // Post title
  const postTitle = document.createElement('div');
  postTitle.className = 'post-title';
  postTitle.textContent = post.title;
  
  // Post content
  const postContent = document.createElement('div');
  postContent.className = 'post-content research-content';
  postContent.textContent = post.summary;
  
  // Post image (if any)
  let postImage = '';
  if (post.image) {
    postImage = document.createElement('div');
    postImage.className = 'post-image';
    postImage.innerHTML = `<img src="${post.image}" alt="Research visualization">`;
  }
  
  // Post tags
  const postTags = document.createElement('div');
  postTags.className = 'post-tags';
  postTags.innerHTML = post.tags.map(tag => `<span class="post-tag">${tag}</span>`).join('');
  
  // Post attachment (if any)
  let attachmentElement = '';
  if (post.hasAttachment) {
    attachmentElement = document.createElement('div');
    
    let attachmentIcon = 'fa-file';
    let attachmentLabel = 'File';
    let attachmentSize = '2.4 MB';
    let attachmentDate = 'Caricato il ' + post.date;
    let attachmentClass = 'post-attachment';
    
    if (post.attachmentType === 'pdf') {
      attachmentIcon = 'fa-file-pdf';
      attachmentLabel = 'PDF';
      attachmentSize = '3.2 MB';
      attachmentClass += ' post-attachment-pdf';
    } else if (post.attachmentType === 'github') {
      attachmentIcon = 'fa-github';
      attachmentLabel = 'Repository GitHub';
      attachmentSize = 'Ultimo aggiornamento: ieri';
      attachmentClass += ' post-attachment-github';
    } else if (post.attachmentType === 'dataset') {
      attachmentIcon = 'fa-database';
      attachmentLabel = 'Dataset';
      attachmentSize = '1.2 GB';
      attachmentClass += ' post-attachment-dataset';
    }
    
    attachmentElement.className = attachmentClass;
    
    attachmentElement.innerHTML = `
      <div class="attachment-icon">
        <i class="fas ${attachmentIcon}"></i>
      </div>
      <div class="attachment-details">
        <div class="attachment-title">${post.title.substring(0, 25)}.${post.attachmentType}</div>
        <div class="attachment-meta">${attachmentSize} • ${attachmentDate}</div>
      </div>
      <div class="attachment-action">
        <i class="fas fa-eye"></i>
        Visualizza
      </div>
    `;
  }
  
  // Post interactions (stats and buttons)
  const postInteractions = document.createElement('div');
  postInteractions.className = 'post-interactions research-interactions';
  postInteractions.innerHTML = `
    <div class="post-stats">
      <div class="stat-item">
        <i class="far fa-thumbs-up"></i>
        <span>${post.likes}</span>
      </div>
      <div class="stat-item">
        <i class="far fa-comment"></i>
        <span>${post.comments}</span>
      </div>
    </div>
    <div class="post-buttons">
      <button class="interaction-btn like-btn">
        <i class="far fa-thumbs-up"></i>
        <span>Mi piace</span>
      </button>
      <button class="interaction-btn comment-btn">
        <i class="far fa-comment"></i>
        <span>Commenta</span>
      </button>
      <button class="interaction-btn share-btn">
        <i class="far fa-share-square"></i>
        <span>Condividi</span>
      </button>
      <button class="interaction-btn save-btn">
        <i class="far fa-bookmark"></i>
        <span>Salva</span>
      </button>
    </div>
  `;
  
  // Assemble post
  postElement.appendChild(postHeader);
  postElement.appendChild(postTitle);
  postElement.appendChild(postContent);
  if (postImage) postElement.appendChild(postImage);
  postElement.appendChild(postTags);
  if (attachmentElement) postElement.appendChild(attachmentElement);
  postElement.appendChild(postInteractions);
  
  return postElement;
}

function addCommunityEventListeners() {
  // Category filter
  document.querySelectorAll('.category-item').forEach(item => {
    item.addEventListener('click', function() {
      // Remove active class from all categories
      document.querySelectorAll('.category-item').forEach(cat => cat.classList.remove('active'));
      
      // Add active class to clicked category
      this.classList.add('active');
      
      const category = this.dataset.category;
      const posts = document.querySelectorAll('.community-post');
      
      if (category === 'all') {
        posts.forEach(post => post.style.display = '');
      } else {
        posts.forEach(post => {
          if (post.dataset.category === category) {
            post.style.display = '';
          } else {
            post.style.display = 'none';
          }
        });
      }
    });
  });
  
  // Like button interactions
  document.querySelectorAll('.like-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const icon = this.querySelector('i');
      const isLiked = icon.classList.contains('fas');
      
      if (isLiked) {
        icon.classList.replace('fas', 'far');
        icon.style.color = '';
        this.classList.remove('liked');
        
        // Update count
        const countElement = this.closest('.post-interactions').querySelector('.post-stats .stat-item:first-child span');
        if (countElement) {
          countElement.textContent = parseInt(countElement.textContent) - 1;
        }
      } else {
        icon.classList.replace('far', 'fas');
        icon.style.color = '';
        this.classList.add('liked');
        
        // Update count
        const countElement = this.closest('.post-interactions').querySelector('.post-stats .stat-item:first-child span');
        if (countElement) {
          countElement.textContent = parseInt(countElement.textContent) + 1;
        }
        
        // Add animation effect
        icon.style.animation = 'none';
        setTimeout(() => {
          icon.style.animation = '';
        }, 10);
      }
    });
  });
  
  // Save button interactions
  document.querySelectorAll('.save-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const icon = this.querySelector('i');
      const isSaved = icon.classList.contains('fas');
      
      if (isSaved) {
        icon.classList.replace('fas', 'far');
        icon.style.color = '';
        this.classList.remove('saved');
        this.querySelector('span').textContent = 'Salva';
      } else {
        icon.classList.replace('far', 'fas');
        icon.style.color = '';
        this.classList.add('saved');
        this.querySelector('span').textContent = 'Salvato';
        
        // Show feedback
        const post = this.closest('.research-post');
        if (post) {
          // Show notification
          const notification = document.createElement('div');
          notification.className = 'save-notification';
          notification.innerHTML = '<i class="fas fa-check-circle"></i> Contenuto salvato';
          post.appendChild(notification);
          
          // Animate and remove
          setTimeout(() => {
            notification.classList.add('show');
            setTimeout(() => {
              notification.classList.remove('show');
              setTimeout(() => notification.remove(), 300);
            }, 2000);
          }, 10);
        }
      }
    });
  });
  
  // Attachment actions
  document.querySelectorAll('.attachment-action').forEach(action => {
    action.addEventListener('click', function() {
      const postTitle = this.closest('.research-post').querySelector('.post-title').textContent;
      const attachmentType = this.closest('.post-attachment').querySelector('.attachment-title').textContent.split('.').pop();
      
      if (attachmentType === 'pdf') {
        // Show feedback for PDF view
        alert(`Visualizzazione PDF: ${postTitle}`);
      } else if (attachmentType === 'github') {
        alert(`Apertura repository GitHub: ${postTitle}`);
      } else if (attachmentType === 'dataset') {
        alert(`Download dataset: ${postTitle}`);
      }
    });
  });
  
  // Post tags click
  document.querySelectorAll('.post-tag').forEach(tag => {
    tag.addEventListener('click', function() {
      const tagText = this.textContent.trim();
      
      // Find category that matches this tag
      const matchingCategories = document.querySelectorAll('.category-item');
      let found = false;
      
      matchingCategories.forEach(cat => {
        if (cat.textContent.trim().includes(tagText)) {
          // Simulate click on matching category
          cat.click();
          found = true;
        }
      });
      
      if (!found) {
        // If no direct match found, click "All" to reset and show this alert
        document.querySelector('.category-item[data-category="all"]').click();
        alert(`Ricerca per tag: ${tagText}`);
      }
    });
  });
  
  // Post image click for zoom effect
  document.querySelectorAll('.post-image img').forEach(img => {
    img.addEventListener('click', function() {
      // Create a modal to show the image
      const modal = document.createElement('div');
      modal.className = 'image-modal';
      
      const modalContent = document.createElement('div');
      modalContent.className = 'image-modal-content';
      
      const image = document.createElement('img');
      image.src = this.src;
      
      const closeBtn = document.createElement('button');
      closeBtn.className = 'image-modal-close';
      closeBtn.innerHTML = '<i class="fas fa-times"></i>';
      
      modalContent.appendChild(image);
      modalContent.appendChild(closeBtn);
      modal.appendChild(modalContent);
      document.body.appendChild(modal);
      
      // Show modal with animation
      setTimeout(() => modal.classList.add('show'), 10);
      
      // Close button event
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
      });
      
      // Click outside to close
      modal.addEventListener('click', function(e) {
        if (e.target === modal) {
          modal.classList.remove('show');
          setTimeout(() => modal.remove(), 300);
        }
      });
    });
  });
  
  // Post actions menu
  document.querySelectorAll('.post-action-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      
      // Remove any existing menus
      const existingMenu = document.querySelector('.post-actions-menu');
      if (existingMenu) existingMenu.remove();
      
      // Create actions menu for research posts
      const actionsMenu = document.createElement('div');
      actionsMenu.className = 'post-actions-menu';
      actionsMenu.innerHTML = `
        <div class="menu-item"><i class="fas fa-bookmark"></i> Salva post</div>
        <div class="menu-divider"></div>
        <div class="menu-item"><i class="fas fa-file-export"></i> Esporta come PDF</div>
        <div class="menu-item"><i class="fas fa-share-alt"></i> Condividi via email</div>
        <div class="menu-divider"></div>
        <div class="menu-item"><i class="fas fa-list-alt"></i> Aggiungi a collezione</div>
        <div class="menu-item"><i class="fas fa-bell"></i> Attiva notifiche</div>
        <div class="menu-divider"></div>
        <div class="menu-item danger"><i class="fas fa-flag"></i> Segnala contenuto</div>
      `;
      
      // Position menu
      const buttonRect = this.getBoundingClientRect();
      actionsMenu.style.top = null; // Clear any previous positioning
      actionsMenu.style.right = null;
      actionsMenu.style.position = 'absolute';
      
      // Get post container to position relative to it
      const postContainer = this.closest('.research-post');
      if (postContainer) {
        postContainer.style.position = 'relative';
        actionsMenu.style.top = '40px';
        actionsMenu.style.right = '20px';
        postContainer.appendChild(actionsMenu);
      } else {
        // Fallback to fixed positioning if post container not found
        actionsMenu.style.position = 'fixed';
        actionsMenu.style.top = `${buttonRect.bottom + 5}px`;
        actionsMenu.style.right = `${window.innerWidth - buttonRect.right}px`;
        document.body.appendChild(actionsMenu);
      }
      
      // Add animation
      setTimeout(() => actionsMenu.classList.add('menu-active'), 10);
      
      // Menu item clicks
      actionsMenu.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', function() {
          const action = this.textContent.trim();
          console.log(`Azione: ${action}`);
          
          // Perform action based on menu item
          if (action.includes('Salva')) {
            // Simulate a save animation
            const notification = document.createElement('div');
            notification.className = 'save-notification';
            notification.innerHTML = '<i class="fas fa-check-circle"></i> Post salvato';
            document.body.appendChild(notification);
            
            setTimeout(() => notification.classList.add('show'), 10);
            setTimeout(() => {
              notification.classList.remove('show');
              setTimeout(() => notification.remove(), 300);
            }, 2000);
          } else {
            alert(`Azione: ${action}`);
          }
          
          actionsMenu.remove();
        });
      });
      
      // Close on outside click
      setTimeout(() => {
        document.addEventListener('click', function closeMenu(e) {
          if (!actionsMenu.contains(e.target) && !btn.contains(e.target)) {
            actionsMenu.classList.remove('menu-active');
            setTimeout(() => {
              actionsMenu.remove();
              document.removeEventListener('click', closeMenu);
            }, 200);
          }
        });
      }, 0);
    });
  });
  
  // Paper action buttons
  document.querySelectorAll('.paper-action-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      // Add animation feedback
      this.classList.add('clicked');
      setTimeout(() => this.classList.remove('clicked'), 300);
      
      // For demo, just show a message
      const action = this.querySelector('i').className;
      if (action.includes('pdf')) {
        console.log('Visualizzazione PDF');
      } else if (action.includes('code')) {
        console.log('Visualizzazione codice');
      } else if (action.includes('bookmark')) {
        const icon = this.querySelector('i');
        if (icon.classList.contains('far')) {
          icon.classList.replace('far', 'fas');
          icon.style.color = '#FFD700';
        } else {
          icon.classList.replace('fas', 'far');
          icon.style.color = '';
        }
      }
    });
  });
  
  // Resource items interaction
  document.querySelectorAll('.resource-item').forEach(item => {
    item.addEventListener('click', function() {
      // Add hover effect
      this.classList.add('active');
      setTimeout(() => this.classList.remove('active'), 300);
      
      // For demo, just log the resource
      console.log('Resource selected:', this.querySelector('.resource-title').textContent);
    });
  });
  
  // View all events button
  const viewAllBtn = document.querySelector('.view-all-btn');
  if (viewAllBtn) {
    viewAllBtn.addEventListener('click', function() {
      console.log('Visualizzazione di tutti gli eventi');
      alert('Apertura calendario eventi');
    });
  }
  
  // Create post interactions
  const createPostInput = document.querySelector('.create-post-input input');
  if (createPostInput) {
    createPostInput.addEventListener('focus', function() {
      const createPostBar = this.closest('.community-create-post');
      if (createPostBar) {
        createPostBar.classList.add('focused');
      }
    });
    
    createPostInput.addEventListener('blur', function() {
      const createPostBar = this.closest('.community-create-post');
      if (createPostBar) {
        setTimeout(() => {
          if (!createPostBar.matches(':hover')) {
            createPostBar.classList.remove('focused');
          }
        }, 100);
      }
    });
  }
  
  // Community create post actions
  document.querySelectorAll('.post-action').forEach(action => {
    action.addEventListener('click', function() {
      const actionType = this.querySelector('span').textContent.trim();
      alert(`Azione: ${actionType}`);
    });
  });
  
  // Community search behavior
  const searchInput = document.querySelector('.community-search input');
  if (searchInput) {
    searchInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        alert(`Ricerca: ${this.value}`);
        this.value = '';
      }
    });
  }
}

window.communityFunctions = {
  // Save state of community tab
  saveCommunityState: function(tabId) {
    console.log('Saving community state for tab:', tabId);
    // In a real implementation, you would save the current state of the community feed
  },
  
  // Load state of community tab
  loadCommunityState: function(tabId) {
    console.log('Loading community state for tab:', tabId);
    // In a real implementation, you would restore the state of the community feed
  },
  
  // Get state of community tab for saving
  getCommunityState: function(tabId) {
    return { type: 'community', id: tabId, timestamp: Date.now() };
  }
};

// NSN Functions (Implementations needed)
async function checkNSNStatus() { const icon = document.getElementById('nsnStatusIcon'); const text = document.getElementById('nsnStatusText'); if(!icon || !text) return; /*...*/ }
async function loadNSNNeurons() { const list = document.getElementById('nsnNeuronsList'); if(!list) return; /*...*/ }
function renderNeuronsList() { const list = document.getElementById('nsnNeuronsList'); const sectionSelect = document.getElementById('nsnSectionSelect'); if(!list || !sectionSelect) return; /*...*/ }
function showNeuronDetails(neuron) { console.log('Showing details for neuron:', neuron); /* Placeholder */ }
function initializeNSNVisualization() { const vizContainer = document.getElementById('nsnVisualization'); if(vizContainer) vizContainer.innerHTML = '<div class="nsn-visualization-placeholder">NSN Visualization Placeholder</div>'; }
async function handleSaveNsnNeuronAdd() { /* ... Needs careful re-getting of elements ... */ }
async function handleActivateNeuron() { /* ... Needs careful re-getting of elements ... */ }
async function handleProcessWebUrl() { /* ... Needs careful re-getting of elements ... */ }
function initializeNSNInterface() { console.log("Initializing NSN Interface"); checkNSNStatus(); loadNSNNeurons(); initializeNSNVisualization(); }

// Other Helpers
function toggleVoiceRecognition() { const sendBtn = document.getElementById('sendBtn'); if(sendBtn){ const isRec = sendBtn.classList.toggle('recording'); sendBtn.innerHTML= isRec ? '<i class="fas fa-stop"></i>':'<i class="fas fa-microphone"></i>'; if(isRec) startVoiceRecording();} }
function toggleCamera() { console.log('Camera Placeholder'); alert('Camera not implemented'); }
function toggleVideo() { console.log('Video Placeholder'); alert('Video not implemented'); }

console.log("Single DOMContentLoaded setup complete.");

// Funzione per mostrare la pagina di onboarding
function showOnboardingPage() {
  // Ottieni il container dei messaggi di chat
  const chatMessages = document.getElementById('chatMessages');
  if (!chatMessages) return;
  
  // Carica la pagina di onboarding
  fetch('landing-page.html')
    .then(response => response.text())
    .then(html => {
      chatMessages.innerHTML = html;
      
      // Aggiungi event listener per i pulsanti di onboarding
      const startButtons = chatMessages.querySelectorAll('.start-button, .create-button');
      startButtons.forEach(button => {
        button.addEventListener('click', () => {
          openNewWorkflowTab();
        });
      });
    })
    .catch(error => {
      console.error('Error loading onboarding page:', error);
      // In caso di errore, apri comunque un canvas vuoto
      openNewWorkflowTab();
    });
}

// Funzione per gestire il drop di file .syn
document.addEventListener('dragover', function(e) {
  e.preventDefault();
  e.stopPropagation();
});

document.addEventListener('drop', function(e) {
  e.preventDefault();
  e.stopPropagation();
  
  // Controlla se ci sono file
  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
    const file = e.dataTransfer.files[0];
    
    // Verifica se è un file .syn
    if (file.name.endsWith('.syn')) {
      // Apri il file nel workflow
      const reader = new FileReader();
      
      reader.onload = function(event) {
        const fileContent = event.target.result;
        // Crea un nuovo tab per il workflow
        const tabId = openNewWorkflowTab(file.name);
        
        // Carica il contenuto del file nel workflow
        setTimeout(() => {
          if (window.workflowFunctions && window.workflowFunctions.loadWorkflowState) {
            window.workflowFunctions.loadWorkflowState(tabId, fileContent);
          }
        }, 300);
      };
      
      reader.readAsText(file);
    }
  }
});

// Sostituisci la funzione di apertura del workflow
function openNewWorkflowTab(name = null) {
  // Genera un ID univoco per il workflow
  const tabId = 'workflow-' + Date.now();
  
  // Crea un nuovo tab
  const tabButton = document.createElement('div');
  tabButton.className = 'tab-button workflow-tab active';
  tabButton.id = tabId + '-tab';
  tabButton.innerHTML = `
    <i class="fas fa-project-diagram"></i>
    <span>${name || 'Nuovo Canvas'}</span>
    <i class="tab-close-btn fas fa-times"></i>
  `;
  
  // Aggiungi il tab al container dei tab
  const tabsWrapper = document.getElementById('dynamicTabsWrapper');
  const addTabBtn = document.getElementById('addTabBtn');
  
  if (tabsWrapper && addTabBtn) {
    tabsWrapper.insertBefore(tabButton, addTabBtn);
    
    // Rendi attivo il nuovo tab
    const allTabs = document.querySelectorAll('.tab-button');
    allTabs.forEach(tab => tab.classList.remove('active'));
    tabButton.classList.add('active');
    
    // Cambia l'area di chat in un'area di workflow
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
      chatMessages.innerHTML = '';
      chatMessages.dataset.activeTab = tabId;
      
      // Inizializza il workflow
      if (window.workflowFunctions && window.workflowFunctions.initialize) {
        window.workflowFunctions.initialize();
      }
    }
    
    // Aggiungi event listener per il click sul tab
    tabButton.addEventListener('click', function(e) {
      // Se è stato cliccato il pulsante di chiusura, chiudi il tab
      if (e.target.classList.contains('tab-close-btn')) {
        closeWorkflowTab(tabId, tabButton);
        return;
      }
      
      // Altrimenti, attiva il tab
      activateWorkflowTab(tabId, tabButton);
    });
    
    // Aggiungi event listener per salvare il workflow con Ctrl+S
    document.addEventListener('keydown', function(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's' && chatMessages.dataset.activeTab === tabId) {
        e.preventDefault();
        saveCurrentWorkflow(tabId);
      }
    });
  }
  
  return tabId;
}

// Funzione per attivare un tab di workflow
function activateWorkflowTab(tabId, tabButton) {
  // Rendi attivo il tab cliccato
  const allTabs = document.querySelectorAll('.tab-button');
  allTabs.forEach(tab => tab.classList.remove('active'));
  tabButton.classList.add('active');
  
  // Cambia l'area di chat in un'area di workflow
  const chatMessages = document.getElementById('chatMessages');
  if (chatMessages) {
    chatMessages.innerHTML = '';
    chatMessages.dataset.activeTab = tabId;
    
    // Carica lo stato del workflow
    if (window.workflowFunctions && window.workflowFunctions.loadWorkflowState) {
      window.workflowFunctions.loadWorkflowState(tabId);
    }
  }
}

// Funzione per chiudere un tab di workflow
function closeWorkflowTab(tabId, tabButton) {
  // Rimuovi il tab
  tabButton.remove();
  
  // Salva lo stato attuale del workflow prima di chiuderlo
  if (window.workflowFunctions && window.workflowFunctions.saveWorkflowState) {
    window.workflowFunctions.saveWorkflowState(tabId);
  }
  
  // Attiva il primo tab disponibile
  const allTabs = document.querySelectorAll('.tab-button');
  if (allTabs.length > 0) {
    const firstTab = allTabs[0];
    
    if (firstTab.classList.contains('workflow-tab')) {
      // Se è un tab di workflow, attivalo
      const firstTabId = firstTab.id.replace('-tab', '');
      activateWorkflowTab(firstTabId, firstTab);
    } else if (firstTab.classList.contains('home-tab')) {
      // Se è il tab home, attivalo
      activateHomeTab();
    }
  } else {
    // Se non ci sono altri tab, torna alla home
    activateHomeTab();
  }
}

// Funzione per salvare il workflow corrente
function saveCurrentWorkflow(tabId) {
  if (window.workflowFunctions && window.workflowFunctions.saveWorkflowState) {
    // Chiedi il nome del file
    const filename = prompt('Salva workflow come:', `Workflow ${new Date().toLocaleString('it-IT', { 
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    })}.syn`);
    
    if (filename) {
      // Salva lo stato con il nome del file
      window.workflowFunctions.saveWorkflowState(tabId, filename);
      
      // Aggiorna il titolo del tab
      const tabButton = document.getElementById(tabId + '-tab');
      if (tabButton) {
        const tabTitle = tabButton.querySelector('span');
        if (tabTitle) {
          tabTitle.textContent = filename;
        }
      }
    }
  }
}

// Funzione per attivare il tab home
function activateHomeTab() {
  // Rendi attivo il tab home
  const allTabs = document.querySelectorAll('.tab-button');
  allTabs.forEach(tab => tab.classList.remove('active'));
  
  const homeTab = document.getElementById('homeTab');
  if (homeTab) {
    homeTab.classList.add('active');
  }
  
  // Ripristina l'area di chat
  const chatMessages = document.getElementById('chatMessages');
  if (chatMessages) {
    chatMessages.innerHTML = '';
    chatMessages.dataset.activeTab = 'home';
    
    // Mostra la pagina di onboarding o l'interfaccia normale
    showOnboardingPage();
  }
}

// Aggiungi questo alla sezione di gestione delle tab nel renderer.js

// Funzione per gestire il cambio di tab
function handleTabChange(targetTab) {
  // Se c'è una funzione di workflow e stiamo uscendo dalla tab Workflow
  if (window.workflowFunctions && window.workflowFunctions.cleanup) {
    // Nascondi il workflow se non siamo nella tab Workflow
    if (targetTab !== 'Workflow') {
      window.workflowFunctions.cleanup();
    }
  }
}

// Aggiungi event listener a tutte le tab
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', function() {
    const tabName = this.textContent.trim();
    handleTabChange(tabName);
  });
});

// Funzione per creare i widget
function createWidgets() {
    const widgets = [];
    
    // Widget Sistema
    const performanceWidget = document.createElement('div'); 
    performanceWidget.className = 'widget performance-widget'; 
    performanceWidget.id = 'performanceWidget'; 
    performanceWidget.innerHTML = `
        <div class="widget-header">
            <div class="widget-title"><i class="fas fa-microchip"></i> Prestazioni Sistema</div>
            <div class="widget-close"><i class="fas fa-times"></i></div>
        </div>
        <div class="widget-content">
            <div class="performance-stats">
                <div class="stat-item">
                    <div class="stat-value" id="cpuValue">--</div>
                    <div class="stat-label">CPU</div>
                    <div class="progress-bar"><div class="progress-fill cpu" id="cpuFill"></div></div>
                </div>
                <div class="stat-item">
                    <div class="stat-value" id="memoryValue">--</div>
                    <div class="stat-label">Memoria</div>
                    <div class="progress-bar"><div class="progress-fill memory" id="memoryFill"></div></div>
                </div>
                <div class="stat-item">
                    <div class="stat-value" id="diskValue">--</div>
                    <div class="stat-label">Disco</div>
                    <div class="progress-bar"><div class="progress-fill disk" id="diskFill"></div></div>
                </div>
                <div class="stat-item">
                    <div class="stat-value" id="networkValue">--</div>
                    <div class="stat-label">Rete</div>
                    <div class="progress-bar"><div class="progress-fill network" id="networkFill"></div></div>
                </div>
            </div>
        </div>`;
    widgets.push(performanceWidget);
    
    // Widget Notizie
    const newsWidget = document.createElement('div'); 
    newsWidget.className = 'widget news-widget'; 
    newsWidget.innerHTML = `
        <div class="widget-header">
            <div class="widget-title"><i class="fas fa-newspaper"></i> Ultime Notizie</div>
            <div class="widget-close"><i class="fas fa-times"></i></div>
        </div>
        <div class="widget-content">
            <div class="news-list">
                <div class="news-item">
                    <div class="news-image"><i class="fas fa-newspaper"></i></div>
                    <div class="news-content">
                        <div class="news-title">L'intelligenza artificiale continua a evolversi rapidamente</div>
                        <div class="news-source">Tech Daily</div>
                    </div>
                </div>
                <div class="news-item">
                    <div class="news-image"><i class="fas fa-newspaper"></i></div>
                    <div class="news-content">
                        <div class="news-title">Nuovi modelli linguistici raggiungono risultati impressionanti</div>
                        <div class="news-source">AI News</div>
                    </div>
                </div>
            </div>
        </div>`;
    widgets.push(newsWidget);
    
    // Widget Azioni Rapide
    const quickActionsWidget = document.createElement('div'); 
    quickActionsWidget.className = 'widget quick-actions-widget'; 
    quickActionsWidget.innerHTML = `
        <div class="widget-header">
            <div class="widget-title"><i class="fas fa-bolt"></i> Azioni Rapide</div>
            <div class="widget-close"><i class="fas fa-times"></i></div>
        </div>
        <div class="widget-content">
            <div class="quick-actions">
                <button class="action-button"><i class="fas fa-image"></i> Crea Immagine</button>
                <button class="action-button"><i class="fas fa-code"></i> Scrivi Codice</button>
                <button class="action-button"><i class="fas fa-tasks"></i> Crea Piano</button>
                <button class="action-button"><i class="fas fa-search"></i> Ricerca Web</button>
            </div>
        </div>`;
    widgets.push(quickActionsWidget);
    
    // Widget Note
    const notesWidget = document.createElement('div');
    notesWidget.className = 'widget notes-widget';
    notesWidget.innerHTML = `
        <div class="widget-header">
            <div class="widget-title"><i class="fas fa-sticky-note"></i> Note Rapide</div>
            <div class="widget-close"><i class="fas fa-times"></i></div>
        </div>
        <div class="widget-content">
            <div class="notes-container">
                <div class="note-item">
                    <div class="note-title">Riunione Progetto</div>
                    <div class="note-date">Oggi, 15:30</div>
                    <div class="note-preview">Discutere lo stato del progetto e le prossime attività...</div>
                </div>
                <div class="note-item">
                    <div class="note-title">Idee per nuovi widget</div>
                    <div class="note-date">Ieri</div>
                    <div class="note-preview">Aggiungere widget per calendario, meteo, e integrazione servizi...</div>
                </div>
                <button class="add-note-button"><i class="fas fa-plus"></i> Aggiungi nota</button>
            </div>
        </div>`;
    widgets.push(notesWidget);
        
    // Widget Calendario
    const calendarWidget = document.createElement('div');
    calendarWidget.className = 'widget calendar-widget';
    calendarWidget.innerHTML = `
        <div class="widget-header">
            <div class="widget-title"><i class="fas fa-calendar-alt"></i> Calendario</div>
            <div class="widget-close"><i class="fas fa-times"></i></div>
        </div>
        <div class="widget-content">
            <div class="mini-calendar">
                <div class="calendar-header">
                    <div class="month-nav"><i class="fas fa-chevron-left"></i></div>
                    <div class="current-month">Novembre 2023</div>
                    <div class="month-nav"><i class="fas fa-chevron-right"></i></div>
                </div>
                <div class="weekdays">
                    <div>Lun</div>
                    <div>Mar</div>
                    <div>Mer</div>
                    <div>Gio</div>
                    <div>Ven</div>
                    <div>Sab</div>
                    <div>Dom</div>
                </div>
                <div class="calendar-days">
                    <!-- I numeri dei giorni verrebbero generati dinamicamente da JS -->
                    <div class="prev-month">30</div>
                    <div class="prev-month">31</div>
                    <div>1</div>
                    <div>2</div>
                    <div>3</div>
                    <div>4</div>
                    <div>5</div>
                    <div>6</div>
                    <div>7</div>
                    <div class="today">8</div>
                    <div class="has-event">9</div>
                    <div>10</div>
                    <div>11</div>
                    <div>12</div>
                    <div>13</div>
                    <div>14</div>
                    <div>15</div>
                    <div>16</div>
                    <div>17</div>
                    <div>18</div>
                    <div>19</div>
                    <div>20</div>
                    <div>21</div>
                    <div>22</div>
                    <div>23</div>
                    <div>24</div>
                    <div>25</div>
                    <div>26</div>
                    <div>27</div>
                    <div>28</div>
                    <div>29</div>
                    <div>30</div>
                    <div class="next-month">1</div>
                    <div class="next-month">2</div>
                    <div class="next-month">3</div>
                </div>
                <div class="upcoming-events">
                    <div class="upcoming-title">Prossimi eventi</div>
                    <div class="event-item">
                        <div class="event-dot"></div>
                        <div class="event-info">
                            <div class="event-name">Riunione Team</div>
                            <div class="event-time">9 Nov, 10:00</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    widgets.push(calendarWidget);
        
    // Widget Meteo
    const weatherWidget = document.createElement('div');
    weatherWidget.className = 'widget weather-widget';
    weatherWidget.innerHTML = `
        <div class="widget-header">
            <div class="widget-title"><i class="fas fa-cloud-sun"></i> Meteo</div>
            <div class="widget-close"><i class="fas fa-times"></i></div>
        </div>
        <div class="widget-content">
            <div class="weather-container">
                <div class="current-weather">
                    <div class="weather-location">Milano, IT</div>
                    <div class="weather-icon"><i class="fas fa-sun"></i></div>
                    <div class="weather-temp">18°C</div>
                    <div class="weather-description">Soleggiato</div>
                </div>
                <div class="weather-forecast">
                    <div class="forecast-item">
                        <div class="forecast-day">Dom</div>
                        <div class="forecast-icon"><i class="fas fa-cloud-sun"></i></div>
                        <div class="forecast-temp">16°C</div>
                    </div>
                    <div class="forecast-item">
                        <div class="forecast-day">Lun</div>
                        <div class="forecast-icon"><i class="fas fa-cloud"></i></div>
                        <div class="forecast-temp">15°C</div>
                    </div>
                    <div class="forecast-item">
                        <div class="forecast-day">Mar</div>
                        <div class="forecast-icon"><i class="fas fa-cloud-rain"></i></div>
                        <div class="forecast-temp">13°C</div>
                    </div>
                </div>
            </div>
        </div>`;
    widgets.push(weatherWidget);
    
    return widgets;
}

// Funzione per creare un widget
function createWidget(widgetType, widgetTitle, iconName) {
    const widget = document.createElement('div');
    widget.className = `widget ${widgetType}`;
    
    // Crea l'header del widget
    const widgetHeader = document.createElement('div');
    widgetHeader.className = 'widget-header';
    
    // Crea la maniglia per il trascinamento
    const moveHandle = document.createElement('div');
    moveHandle.className = 'widget-move-handle';
    moveHandle.setAttribute('title', 'Trascina per riordinare');
    moveHandle.innerHTML = '<i class="fas fa-grip-vertical"></i>';
    
    // Aggiungi un effetto di pulsazione per attirare l'attenzione sulla maniglia
    setTimeout(() => {
        moveHandle.style.animation = 'pulse 2s infinite alternate';
        // Rimuovi l'animazione dopo alcuni secondi
        setTimeout(() => {
            moveHandle.style.animation = '';
        }, 5000);
    }, 1000);
    
    // Crea il titolo del widget
    const widgetTitleEl = document.createElement('div');
    widgetTitleEl.className = 'widget-title';
    widgetTitleEl.innerHTML = `<i class="fas fa-${iconName}"></i> ${widgetTitle}`;
    
    // Crea il pulsante di chiusura
    const widgetClose = document.createElement('div');
    widgetClose.className = 'widget-close';
    widgetClose.innerHTML = '<i class="fas fa-times"></i>';
    
    // Aggiungi il gestore eventi per la chiusura
    widgetClose.addEventListener('click', function() {
        widget.classList.add('widget-removing');
        setTimeout(() => widget.remove(), 300);
    });
    
    // Aggiungi gli elementi all'header
    widgetHeader.appendChild(moveHandle);
    widgetHeader.appendChild(widgetTitleEl);
    widgetHeader.appendChild(widgetClose);
    
    // Crea il contenuto del widget
    const widgetContent = document.createElement('div');
    widgetContent.className = 'widget-content';
    
    // Assembla il widget
    widget.appendChild(widgetHeader);
    widget.appendChild(widgetContent);
    
    return widget;
}

// Funzione per generare giorni del calendario
function generateCalendarDays() {
    const daysHTML = [];
    
    // Giorni del mese precedente
    for (let i = 1; i <= 3; i++) {
        daysHTML.push(`<div class="prev-month">${28 + i}</div>`);
    }
    
    // Giorni del mese corrente
    for (let i = 1; i <= 31; i++) {
        if (i === 10) {
            daysHTML.push(`<div class="today">${i}</div>`);
        } else if (i === 15 || i === 22) {
            daysHTML.push(`<div class="has-event">${i}</div>`);
        } else {
            daysHTML.push(`<div>${i}</div>`);
        }
    }
    
    // Giorni del mese successivo
    for (let i = 1; i <= 7; i++) {
        daysHTML.push(`<div class="next-month">${i}</div>`);
    }
    
    return daysHTML.join('');
}

// Funzione per impostare gli eventi delle guide
function setupTutorialLinks(landingPage) {
    const tutorialLinks = landingPage.querySelectorAll('.tutorial-link');
    tutorialLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            // Qui puoi implementare la logica per mostrare i tutorial
            console.log('Tutorial clicked:', link.textContent.trim());
        });
    });
}

// Funzione per impostare gli eventi delle azioni rapide
function setupQuickActions(landingPage) {
    const actionButtons = landingPage.querySelectorAll('.action-button');
    actionButtons.forEach(button => {
        button.addEventListener('click', () => {
            const action = button.getAttribute('data-action');
            if (action === 'newChat') {
                startNewChat();
            } else if (action === 'newProject') {
                console.log('New project action');
                // Implementare la logica per creare un nuovo progetto
            } else if (action === 'openSettings') {
                console.log('Open settings action');
                // Implementare la logica per aprire le impostazioni
            } else if (action === 'checkUpdates') {
                console.log('Check updates action');
                // Implementare la logica per verificare gli aggiornamenti
            }
        });
    });
}

// Aggiungi il gestore dell'evento DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    initializeUI();
    loadSavedChats();
    initializeDemoChatSelectors();
    
    // Avvia i timers per il salvataggio automatico
    setInterval(saveCurrentTabs, 60000); // Salva le tab aperte ogni minuto
    
    // Aggiungi il gestore per la chiusura della finestra
    window.addEventListener('beforeunload', function() {
        console.log('Saving all tabs before closing');
        
        // Se siamo in modalità documento, salva prima di uscire
        if (document.body.classList.contains('document-mode')) {
            const overlay = document.getElementById('documentOverlay');
            if (overlay && typeof window.exitDocumentMode === 'function') {
                console.log('Exiting document mode before closing');
                window.exitDocumentMode();
            }
        }
        
        // Salva lo stato di tutte le tab
        const tabs = document.querySelectorAll('#dynamicTabsWrapper .tab-button:not(#addTabBtn)');
        tabs.forEach(tab => {
            const tabId = tab.id.replace('-tab', '');
            if (tabId.startsWith('workflow-') && window.workflowFunctions?.saveWorkflowState) {
                window.workflowFunctions.saveWorkflowState(tabId);
            } else if (tabId.startsWith('calendar-') && window.calendarFunctions?.saveCalendarState) {
                window.calendarFunctions.saveCalendarState(tabId);
            } else if (tabId.startsWith('community-') && window.communityFunctions?.saveCommunityState) {
                window.communityFunctions.saveCommunityState(tabId);
            }
        });
        
        // Salva le chat
        saveChatsToLocalStorage();
    });
});
