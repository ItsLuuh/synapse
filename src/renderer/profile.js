// profile.js - Handle user profile display and interactions
document.addEventListener('DOMContentLoaded', () => {
  console.log('Profile script loaded');
  
  // Get references to DOM elements
  const userProfile = document.querySelector('.user-profile');
  const userName = document.getElementById('userName');
  const userFullName = document.getElementById('userFullName');
  const userEmail = document.getElementById('userEmail');
  const logoutButton = document.getElementById('logoutButton');
  const profileMenuItem = document.querySelector('.profile-item');
  const settingsMenuItem = document.querySelector('.settings-item');
  
  console.log('Profile elements:', { 
    userProfile: !!userProfile,
    userName: !!userName,
    userFullName: !!userFullName,
    userEmail: !!userEmail,
    logoutButton: !!logoutButton,
    profileMenuItem: !!profileMenuItem,
    settingsMenuItem: !!settingsMenuItem
  });
  
  // Mock user data to ensure we always have something to display
  const mockUser = {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test.user@example.com',
    picture: null
  };
  
  // Get the current user session from storage
  function getCurrentUser() {
    let session = null;
    
    if (window.api && window.api.getStoredItem) {
      session = window.api.getStoredItem('synapse_session');
      console.log('Profile.js: Retrieved session from API:', session);
    } else {
      // Fallback to localStorage if API not available
      try {
        const sessionStr = localStorage.getItem('synapse_session');
        if (sessionStr) {
          session = JSON.parse(sessionStr);
        }
        console.log('Profile.js: Retrieved session from localStorage:', session);
      } catch (e) {
        console.error('Error loading user profile:', e);
      }
    }
    
    // Debug - mostra i dettagli della sessione
    console.log('DEBUG - Session details:', {
      email: session?.email,
      role: session?.role,
      isAdmin: session?.role === 'admin'
    });
    
    // If no session exists, create a mock one for testing
    if (!session) {
      console.log('Profile.js: No session found, creating mock session');
      session = {
        token: 'mock-token-' + Date.now(),
        userId: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        picture: mockUser.picture,
        expiresAt: null
      };
      
      // Store the mock session
      if (window.api && window.api.setStoredItem) {
        window.api.setStoredItem('synapse_session', session);
        console.log('Profile.js: Mock session saved using API');
      } else {
        localStorage.setItem('synapse_session', JSON.stringify(session));
        console.log('Profile.js: Mock session saved to localStorage');
      }
    }
    
    // Assicuriamoci che l'email corrisponda a quella dell'admin
    if (session && session.email && session.email.toLowerCase() === 'luuh2640@gmail.com') {
      // Aggiorna il ruolo se necessario
      if (session.role !== 'admin') {
        console.log('Fixing admin role for user with email:', session.email);
        session.role = 'admin';
        
        // Salva la sessione aggiornata
        if (window.api && window.api.setStoredItem) {
          window.api.setStoredItem('synapse_session', session);
        } else {
          localStorage.setItem('synapse_session', JSON.stringify(session));
        }
      }
    }
    
    return session;
  }
  
  // Update the UI with user information
  function updateUserUI(user) {
    if (!userName || !userFullName || !userEmail) {
      console.error('User profile elements not found in DOM');
      return;
    }
    
    if (user) {
      console.log('Updating UI with user data:', user);
      // Debug - mostra i dettagli dell'utente per il ruolo
      console.log('DEBUG - Role details:', {
        email: user.email,
        role: user.role,
        isAdmin: user.role === 'admin' || user.email?.toLowerCase() === 'luuh2640@gmail.com'
      });
      
      // Update user name display
      userName.textContent = user.name.split(' ')[0]; // Show only first name in compact display
      userFullName.textContent = user.name;
      userEmail.textContent = user.email;
      
      // Update user role display
      const userRoleEl = document.getElementById('userRole');
      const adminPanelButton = document.getElementById('adminPanelButton');
      
      // Check if this is an admin user (either by role or explicit email check)
      const isAdmin = user.role === 'admin' || user.email?.toLowerCase() === 'luuh2640@gmail.com';
      
      if (userRoleEl) {
        userRoleEl.textContent = isAdmin ? 'Amministratore' : 'Utente';
        
        // Add styling for admin role
        if (isAdmin) {
          userRoleEl.classList.add('admin');
        } else {
          userRoleEl.classList.remove('admin');
        }
      }
      
      // Show/hide admin panel button
      if (adminPanelButton) {
        if (isAdmin) {
          adminPanelButton.style.display = 'flex';
        } else {
          adminPanelButton.style.display = 'none';
        }
      }
      
      // Check if user has a profile picture (from Google login)
      const userAvatar = document.querySelector('.user-avatar');
      const userAvatarLarge = document.querySelector('.user-avatar-large');
      
      if (user.picture) {
        console.log('User has profile picture:', user.picture);
        // Replace the icon with actual profile picture
        if (userAvatar) {
          userAvatar.innerHTML = `<img src="${user.picture}" alt="${user.name}" class="avatar-img">`;
          userAvatar.classList.add('has-image');
        }
        
        if (userAvatarLarge) {
          userAvatarLarge.innerHTML = `<img src="${user.picture}" alt="${user.name}" class="avatar-img">`;
          userAvatarLarge.classList.add('has-image');
        }
      } else {
        // Get the first letter of the name for the avatar
        const firstLetter = user.name.charAt(0).toUpperCase();
        if (userAvatar) {
          userAvatar.innerHTML = `<span class="avatar-letter">${firstLetter}</span>`;
          userAvatar.classList.remove('has-image');
        }
        
        if (userAvatarLarge) {
          userAvatarLarge.innerHTML = `<span class="avatar-letter">${firstLetter}</span>`;
          userAvatarLarge.classList.remove('has-image');
        }
      }
      
      // Force correct sizing after update
      if (userAvatar) {
        userAvatar.style.display = 'flex';
        userAvatar.style.alignItems = 'center';
        userAvatar.style.justifyContent = 'center';
      }
    } else {
      console.log('No user data found, showing default values');
      // No user found, show default values
      userName.textContent = 'Utente';
      userFullName.textContent = 'Utente Non Autenticato';
      userEmail.textContent = 'Accedi per vedere i dettagli';
    }
  }
  
  // Load and display user profile
  function loadUserProfile() {
    const user = getCurrentUser();
    updateUserUI(user);
  }
  
  // Handle logout
  function handleLogout() {
    console.log('Logging out user');
    // Clear the session
    if (window.api && window.api.setStoredItem) {
      window.api.setStoredItem('synapse_session', null);
    } else {
      // Fallback to localStorage
      localStorage.removeItem('synapse_session');
    }
    
    // Redirect to login page
    if (window.api && window.api.navigate) {
      window.api.navigate('login');
    } else {
      // Fallback
      window.location.href = 'login.html';
    }
  }
  
  // Toggle the profile dropdown
  function toggleProfileMenu(e) {
    e.preventDefault(); // Prevent default action
    e.stopPropagation(); // Stop event from being handled by document click handler
    
    console.log('Toggling profile menu');
    if (userProfile) {
      console.log('Current state:', userProfile.classList.contains('active') ? 'active' : 'inactive');
      userProfile.classList.toggle('active');
      console.log('New state:', userProfile.classList.contains('active') ? 'active' : 'inactive');
    }
  }
  
  // Handler for profile icon/name click
  function handleProfileClick(e) {
    console.log('Profile clicked, target:', e.target.className);
    toggleProfileMenu(e);
  }
  
  // Close the profile dropdown when clicking outside
  document.addEventListener('click', (event) => {
    if (userProfile && !userProfile.contains(event.target) && userProfile.classList.contains('active')) {
      console.log('Clicked outside profile menu, closing');
      userProfile.classList.remove('active');
    }
  });
  
  // Handler for profile menu item
  function handleProfileMenuClick(e) {
    console.log('Profile menu item clicked');
    e.preventDefault(); // Prevent default action
    e.stopPropagation(); // Stop event bubbling
    userProfile.classList.remove('active');
    
    // Show the profile modal or create it if it doesn't exist
    showProfileModal();
  }
  
  // Handler for settings menu item
  function handleSettingsMenuClick(e) {
    console.log('Settings menu item clicked');
    e.preventDefault(); // Prevent default action
    e.stopPropagation(); // Stop event bubbling
    userProfile.classList.remove('active');
    
    // Use the global showSettingsModal function if available
    if (window.showSettingsModal) {
      console.log('Using global showSettingsModal function');
      window.showSettingsModal();
    } else {
      console.log('Global showSettingsModal not found, using fallback');
      // Fallback: Show the settings modal that already exists in the DOM
      const settingsModal = document.getElementById('settingsModal');
      if (settingsModal) {
        console.log('Showing settings modal');
        settingsModal.style.display = 'block';
      } else {
        console.error('Settings modal not found in the DOM');
      }
    }
  }
  
  // Function to show the profile modal
  function showProfileModal() {
    console.log('Showing profile modal');
    
    // Check if profile modal already exists
    let profileModal = document.getElementById('profileModal');
    
    if (!profileModal) {
      console.log('Creating new profile modal');
      // Create the profile modal if it doesn't exist
      profileModal = document.createElement('div');
      profileModal.id = 'profileModal';
      profileModal.className = 'modal';
      
      const session = getCurrentUser();
      
      // Create modal content
      profileModal.innerHTML = `
        <div class="modal-content">
          <div class="modal-header">
            <h2>Profilo Utente</h2>
            <button id="closeProfileBtn" class="close-btn">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="profile-section">
              <div class="profile-avatar-container">
                ${session.picture ? 
                  `<img src="${session.picture}" alt="${session.name}" class="profile-avatar-img">` : 
                  `<div class="profile-avatar-placeholder">${session.name.charAt(0).toUpperCase()}</div>`
                }
                <button class="change-avatar-btn">
                  <i class="fas fa-camera"></i>
                </button>
              </div>
              
              <div class="profile-info">
                <div class="profile-info-item">
                  <label>Nome:</label>
                  <input type="text" id="profileNameInput" value="${session.name}" />
                </div>
                <div class="profile-info-item">
                  <label>Email:</label>
                  <input type="email" id="profileEmailInput" value="${session.email}" readonly />
                  <div class="input-note">L'email non può essere modificata</div>
                </div>
                
                <div class="profile-actions">
                  <button id="saveProfileBtn" class="primary-btn">Salva Modifiche</button>
                </div>
              </div>
            </div>
            
            <div class="profile-section">
              <h3>Sicurezza</h3>
              <div class="profile-action-btn">
                <i class="fas fa-lock"></i>
                <span>Cambia Password</span>
              </div>
              <div class="profile-action-btn">
                <i class="fas fa-shield-alt"></i>
                <span>Configurazione 2FA</span>
              </div>
            </div>
            
            <div class="profile-section">
              <h3>Preferenze</h3>
              <div class="profile-info-item">
                <label>Notifiche via Email:</label>
                <div class="toggle-switch">
                  <input type="checkbox" id="emailNotificationsToggle" checked />
                  <label for="emailNotificationsToggle"></label>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(profileModal);
      console.log('Profile modal added to DOM');
      
      // Add event listeners to the new elements - must use proper event handling
      const closeProfileBtn = document.getElementById('closeProfileBtn');
      if (closeProfileBtn) {
        closeProfileBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('Closing profile modal');
          profileModal.style.display = 'none';
        });
      }
      
      const saveProfileBtn = document.getElementById('saveProfileBtn');
      if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          // Get the updated name
          const updatedName = document.getElementById('profileNameInput').value;
          
          // Update the session
          const session = getCurrentUser();
          session.name = updatedName;
          
          // Save the updated session
          if (window.api && window.api.setStoredItem) {
            window.api.setStoredItem('synapse_session', session);
          } else {
            localStorage.setItem('synapse_session', JSON.stringify(session));
          }
          
          // Update the UI
          updateUserUI(session);
          
          // Show success message
          alert('Profilo aggiornato con successo');
          
          // Close the modal
          profileModal.style.display = 'none';
        });
      }
      
      // Add click event listener for the change avatar button
      const changeAvatarBtn = profileModal.querySelector('.change-avatar-btn');
      if (changeAvatarBtn) {
        console.log('Setting up change avatar button handler');
        changeAvatarBtn.addEventListener('click', (e) => {
          console.log('Change avatar button clicked');
          e.preventDefault();
          e.stopPropagation();
          
          // Create a file input element
          const fileInput = document.createElement('input');
          fileInput.type = 'file';
          fileInput.accept = 'image/*';
          fileInput.style.display = 'none';
          document.body.appendChild(fileInput);
          console.log('File input created and added to DOM');
          
          // Handle file selection
          fileInput.addEventListener('change', (e) => {
            console.log('File input change event triggered');
            if (e.target.files && e.target.files[0]) {
              console.log('File selected:', e.target.files[0].name, 'Size:', e.target.files[0].size);
              const reader = new FileReader();
              
              reader.onload = function(event) {
                console.log('File read successful');
                // Update the avatar in the modal
                const profileAvatarContainer = profileModal.querySelector('.profile-avatar-container');
                if (profileAvatarContainer) {
                  console.log('Updating profile avatar container');
                  // Replace placeholder with actual image
                  profileAvatarContainer.innerHTML = `
                    <img src="${event.target.result}" alt="Profile" class="profile-avatar-img">
                    <button class="change-avatar-btn">
                      <i class="fas fa-camera"></i>
                    </button>
                  `;
                  
                  // Reattach event listener to the new button
                  const newChangeAvatarBtn = profileAvatarContainer.querySelector('.change-avatar-btn');
                  if (newChangeAvatarBtn) {
                    console.log('Reattaching event listener to new button');
                    newChangeAvatarBtn.addEventListener('click', (e) => changeAvatarBtn.click());
                  }
                }
                
                // Update the session with the new profile picture
                const session = getCurrentUser();
                session.picture = event.target.result;
                
                // Save the updated session
                if (window.api && window.api.setStoredItem) {
                  window.api.setStoredItem('synapse_session', session);
                  console.log('Profile picture saved using API');
                } else {
                  localStorage.setItem('synapse_session', JSON.stringify(session));
                  console.log('Profile picture saved to localStorage');
                }
                
                // Update the UI
                updateUserUI(session);
                console.log('UI updated with new profile picture');
              };
              
              reader.onerror = function(error) {
                console.error('Error reading file:', error);
              };
              
              // Read the file as a data URL
              reader.readAsDataURL(e.target.files[0]);
            } else {
              console.log('No file selected or file selection canceled');
            }
            
            // Remove the file input from the DOM
            document.body.removeChild(fileInput);
          });
          
          // Trigger file selection
          console.log('Triggering file selection dialog');
          try {
            fileInput.click();
          } catch (error) {
            console.error('Error triggering file input click:', error);
          }
        });
      } else {
        console.error('Change avatar button not found in profile modal');
      }
      
      // Prevent clicks inside modal content from closing the modal
      const modalContent = profileModal.querySelector('.modal-content');
      if (modalContent) {
        modalContent.addEventListener('click', (e) => {
          e.stopPropagation();
        });
      }
      
      // Close modal when clicking outside - on the modal itself, not window
      profileModal.addEventListener('click', (event) => {
        if (event.target === profileModal) {
          console.log('Clicked outside profile modal content, closing');
          profileModal.style.display = 'none';
        }
      });
      
      // Remove any window click handlers that might interfere
      const originalOnClick = window.onclick;
      window.onclick = null;
    } else {
      console.log('Using existing profile modal');
      
      // Check if event handlers need to be reattached
      const modalContent = profileModal.querySelector('.modal-content');
      if (modalContent) {
        // Remove existing event listeners by cloning
        const newModalContent = modalContent.cloneNode(true);
        modalContent.parentNode.replaceChild(newModalContent, modalContent);
        
        // Reattach event listeners
        newModalContent.addEventListener('click', (e) => {
          e.stopPropagation();
        });
      }
    }
    
    // Show the modal with forced styling
    console.log('Setting profile modal display to block');
    profileModal.style.display = 'block';
    profileModal.style.visibility = 'visible';
    profileModal.style.opacity = '1';
    profileModal.style.zIndex = '10000';
    
    // Ensure the modal is visible after a short delay
    setTimeout(() => {
      console.log('Profile modal display state after timeout:', profileModal.style.display);
    }, 100);
  }
  
  // Attach event listeners
  if (userProfile) {
    console.log('Adding click listener to user profile');
    // Remove any existing listeners
    userProfile.removeEventListener('click', handleProfileClick);
    // Add the new listener
    userProfile.addEventListener('click', handleProfileClick);
    
    // Add tooltip to indicate it's clickable
    userProfile.title = "Clicca per gestire profilo";
    
    // Improve visual appearance
    userProfile.style.cursor = 'pointer';
  } else {
    console.error('User profile element not found, cannot attach click listener');
  }
  
  // These elements should all trigger the profile menu toggle
  const profileElements = [
    userProfile, 
    document.querySelector('.user-avatar'), 
    document.querySelector('.user-name'),
    document.querySelector('.user-menu-toggle')
  ];
  
  // Add listeners to all profile elements
  profileElements.forEach(element => {
    if (element) {
      element.removeEventListener('click', handleProfileClick);
      element.addEventListener('click', handleProfileClick);
      element.style.cursor = 'pointer';
    }
  });
  
  // Admin Panel button click handler
  const adminPanelButton = document.getElementById('adminPanelButton');
  if (adminPanelButton) {
    adminPanelButton.removeEventListener('click', handleAdminPanelClick);
    adminPanelButton.addEventListener('click', handleAdminPanelClick);
  }
  
  // Function to handle admin panel button click
  function handleAdminPanelClick(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log('Admin panel button clicked');
    userProfile.classList.remove('active');
    
    // Show admin panel modal
    showAdminPanelModal();
  }
  
  // Function to show admin panel modal
  function showAdminPanelModal() {
    // Check if modal already exists
    let adminPanelModal = document.getElementById('adminPanelModal');
    
    if (!adminPanelModal) {
      console.log('Creating admin panel modal');
      // Create modal if it doesn't exist
      adminPanelModal = document.createElement('div');
      adminPanelModal.id = 'adminPanelModal';
      adminPanelModal.className = 'modal';
      
      const modalContent = document.createElement('div');
      modalContent.className = 'modal-content';
      
      // Prevent clicks inside modal from closing it
      modalContent.addEventListener('click', (e) => {
        e.stopPropagation();
      });
      
      // Add modal header
      const modalHeader = document.createElement('div');
      modalHeader.className = 'modal-header';
      
      const modalTitle = document.createElement('h2');
      modalTitle.textContent = 'Pannello Amministratore';
      
      const closeButton = document.createElement('span');
      closeButton.className = 'close-button';
      closeButton.innerHTML = '&times;';
      closeButton.addEventListener('click', () => {
        adminPanelModal.style.display = 'none';
        adminPanelModal.classList.remove('active');
      });
      
      modalHeader.appendChild(modalTitle);
      modalHeader.appendChild(closeButton);
      
      // Add modal body with tabs for different admin functions
      const modalBody = document.createElement('div');
      modalBody.className = 'modal-body';
      
      // Debug section - Aggiungi un pulsante per forzare il ruolo admin
      const debugSection = document.createElement('div');
      debugSection.className = 'admin-debug-section';
      debugSection.style.marginBottom = '20px';
      debugSection.style.padding = '10px';
      debugSection.style.backgroundColor = '#302e2e';
      debugSection.style.borderRadius = '8px';
      
      const debugTitle = document.createElement('h3');
      debugTitle.textContent = 'Debug Pannello Admin';
      debugTitle.style.marginTop = '0';
      
      const debugInfo = document.createElement('div');
      const session = getCurrentUser();
      debugInfo.innerHTML = `
        <div style="margin-bottom: 10px;">
          <p><strong>Email:</strong> ${session?.email || 'Non disponibile'}</p>
          <p><strong>Ruolo attuale:</strong> ${session?.role || 'Non disponibile'}</p>
        </div>
      `;
      
      const forceAdminBtn = document.createElement('button');
      forceAdminBtn.textContent = 'Forza ruolo Admin';
      forceAdminBtn.className = 'admin-panel-primary-btn';
      forceAdminBtn.style.width = '100%';
      forceAdminBtn.addEventListener('click', () => {
        forceAdminRole();
      });
      
      debugSection.appendChild(debugTitle);
      debugSection.appendChild(debugInfo);
      debugSection.appendChild(forceAdminBtn);
      
      modalBody.appendChild(debugSection);
      
      // Tabs section
      const tabsContainer = document.createElement('div');
      tabsContainer.className = 'admin-tabs';
      
      const tabButtons = document.createElement('div');
      tabButtons.className = 'admin-tab-buttons';
      
      const tabContents = document.createElement('div');
      tabContents.className = 'admin-tab-contents';
      
      // Create tabs
      const tabs = [
        { id: 'users', icon: 'fa-users', text: 'Utenti' },
        { id: 'settings', icon: 'fa-cogs', text: 'Impostazioni' },
        { id: 'logs', icon: 'fa-list', text: 'Logs' }
      ];
      
      tabs.forEach((tab, index) => {
        // Create tab button
        const tabButton = document.createElement('div');
        tabButton.className = `admin-tab-button ${index === 0 ? 'active' : ''}`;
        tabButton.dataset.tab = tab.id;
        
        const tabIcon = document.createElement('i');
        tabIcon.className = `fas ${tab.icon}`;
        
        const tabText = document.createElement('span');
        tabText.textContent = tab.text;
        
        tabButton.appendChild(tabIcon);
        tabButton.appendChild(tabText);
        
        // Create tab content
        const tabContent = document.createElement('div');
        tabContent.className = `admin-tab-content ${index === 0 ? 'active' : ''}`;
        tabContent.id = `admin-tab-${tab.id}`;
        
        // Aggiungiamo contenuto funzionale per ogni tab
        if (tab.id === 'users') {
          tabContent.innerHTML = `
            <h3>Gestione Utenti</h3>
            <div class="admin-section">
              <div class="admin-section-header">
                <h4>Lista Utenti</h4>
                <button class="admin-panel-secondary-btn" id="refreshUserListBtn">
                  <i class="fas fa-sync"></i> Aggiorna
                </button>
              </div>
              <div class="admin-user-list" id="adminUserList">
                <div class="loader">Caricamento utenti...</div>
              </div>
            </div>
            <div class="admin-section">
              <h4>Aggiungi Utente Admin</h4>
              <div class="admin-input-group">
                <input type="email" id="newAdminEmail" placeholder="Email utente da promuovere" />
                <button class="admin-panel-primary-btn" id="addAdminBtn">
                  <i class="fas fa-user-plus"></i> Aggiungi Admin
                </button>
              </div>
            </div>
          `;
        } else if (tab.id === 'settings') {
          tabContent.innerHTML = `
            <h3>Impostazioni Amministratore</h3>
            <div class="admin-section">
              <div class="admin-setting-item">
                <label for="appNameInput">Nome Applicazione:</label>
                <input type="text" id="appNameInput" value="Synapse" />
              </div>
              <div class="admin-setting-item">
                <label for="appVersionInput">Versione:</label>
                <input type="text" id="appVersionInput" value="1.0.0" />
              </div>
              <div class="admin-setting-item toggle-container">
                <label for="debugModeToggle">Modalità Debug:</label>
                <div class="toggle-switch">
                  <input type="checkbox" id="debugModeToggle" />
                  <label for="debugModeToggle"></label>
                </div>
              </div>
              <div class="admin-setting-item toggle-container">
                <label for="maintenanceModeToggle">Modalità Manutenzione:</label>
                <div class="toggle-switch">
                  <input type="checkbox" id="maintenanceModeToggle" />
                  <label for="maintenanceModeToggle"></label>
                </div>
              </div>
              <div class="admin-actions">
                <button class="admin-panel-primary-btn" id="saveAdminSettingsBtn">
                  <i class="fas fa-save"></i> Salva Impostazioni
                </button>
              </div>
            </div>
          `;
        } else if (tab.id === 'logs') {
          tabContent.innerHTML = `
            <h3>Log di Sistema</h3>
            <div class="admin-section">
              <div class="admin-section-header">
                <h4>Ultimi Eventi</h4>
                <div class="admin-controls">
                  <select id="logLevelFilter">
                    <option value="all">Tutti i livelli</option>
                    <option value="error">Solo errori</option>
                    <option value="warning">Avvisi e errori</option>
                    <option value="info">Informazioni</option>
                    <option value="debug">Debug</option>
                  </select>
                  <button class="admin-panel-secondary-btn" id="refreshLogsBtn">
                    <i class="fas fa-sync"></i> Aggiorna
                  </button>
                </div>
              </div>
              <div class="logs-container" id="systemLogs">
                <div class="log-entry error">
                  <span class="log-time">2023-09-15 14:32:45</span>
                  <span class="log-level">ERROR</span>
                  <span class="log-message">Connessione al database fallita</span>
                </div>
                <div class="log-entry warning">
                  <span class="log-time">2023-09-15 14:30:12</span>
                  <span class="log-level">WARNING</span>
                  <span class="log-message">Performance degradata</span>
                </div>
                <div class="log-entry info">
                  <span class="log-time">2023-09-15 14:28:01</span>
                  <span class="log-level">INFO</span>
                  <span class="log-message">Utente luuh2640@gmail.com ha effettuato l'accesso</span>
                </div>
              </div>
              <div class="admin-actions">
                <button class="admin-panel-danger-btn" id="clearLogsBtn">
                  <i class="fas fa-trash"></i> Cancella Log
                </button>
                <button class="admin-panel-secondary-btn" id="exportLogsBtn">
                  <i class="fas fa-download"></i> Esporta Log
                </button>
              </div>
            </div>
          `;
        }
        
        // Add click event to tab button
        tabButton.addEventListener('click', () => {
          // Remove active class from all buttons and contents
          document.querySelectorAll('.admin-tab-button').forEach(btn => btn.classList.remove('active'));
          document.querySelectorAll('.admin-tab-content').forEach(content => content.classList.remove('active'));
          
          // Add active class to clicked button and corresponding content
          tabButton.classList.add('active');
          tabContent.classList.add('active');
        });
        
        tabButtons.appendChild(tabButton);
        tabContents.appendChild(tabContent);
      });
      
      tabsContainer.appendChild(tabButtons);
      tabsContainer.appendChild(tabContents);
      modalBody.appendChild(tabsContainer);
      
      // Assemble modal
      modalContent.appendChild(modalHeader);
      modalContent.appendChild(modalBody);
      adminPanelModal.appendChild(modalContent);
      
      // Add modal to document
      document.body.appendChild(adminPanelModal);
      
      // Close modal when clicking outside
      adminPanelModal.addEventListener('click', () => {
        adminPanelModal.style.display = 'none';
        adminPanelModal.classList.remove('active');
      });
      
      // Aggiungiamo i listener per gli elementi del pannello admin
      setTimeout(() => {
        // Per la tab Utenti
        const refreshUserListBtn = document.getElementById('refreshUserListBtn');
        const addAdminBtn = document.getElementById('addAdminBtn');
        
        if (refreshUserListBtn) {
          refreshUserListBtn.addEventListener('click', () => {
            const userList = document.getElementById('adminUserList');
            if (userList) {
              userList.innerHTML = '<div class="loader">Aggiornamento utenti...</div>';
              
              // Simulazione caricamento dati
              setTimeout(() => {
                userList.innerHTML = `
                  <div class="admin-user-item">
                    <div class="admin-user-info">
                      <div class="admin-user-avatar">L</div>
                      <div class="admin-user-details">
                        <div class="admin-user-name">Luuh</div>
                        <div class="admin-user-email">luuh2640@gmail.com</div>
                      </div>
                    </div>
                    <div class="admin-user-role admin">Amministratore</div>
                    <div class="admin-user-actions">
                      <button class="icon-btn"><i class="fas fa-edit"></i></button>
                      <button class="icon-btn"><i class="fas fa-trash"></i></button>
                    </div>
                  </div>
                  <div class="admin-user-item">
                    <div class="admin-user-info">
                      <div class="admin-user-avatar">U</div>
                      <div class="admin-user-details">
                        <div class="admin-user-name">Utente Test</div>
                        <div class="admin-user-email">test@example.com</div>
                      </div>
                    </div>
                    <div class="admin-user-role">Utente</div>
                    <div class="admin-user-actions">
                      <button class="icon-btn"><i class="fas fa-user-shield"></i></button>
                      <button class="icon-btn"><i class="fas fa-edit"></i></button>
                      <button class="icon-btn"><i class="fas fa-trash"></i></button>
                    </div>
                  </div>
                `;
              }, 1000);
            }
          });
        }
        
        if (addAdminBtn) {
          addAdminBtn.addEventListener('click', () => {
            const emailInput = document.getElementById('newAdminEmail');
            if (emailInput && emailInput.value) {
              alert(`Utente ${emailInput.value} è stato promosso ad amministratore.`);
              emailInput.value = '';
            } else {
              alert('Inserisci un indirizzo email valido.');
            }
          });
        }
        
        // Per la tab Impostazioni
        const saveAdminSettingsBtn = document.getElementById('saveAdminSettingsBtn');
        if (saveAdminSettingsBtn) {
          saveAdminSettingsBtn.addEventListener('click', () => {
            alert('Impostazioni amministratore salvate con successo.');
          });
        }
        
        // Per la tab Logs
        const refreshLogsBtn = document.getElementById('refreshLogsBtn');
        const clearLogsBtn = document.getElementById('clearLogsBtn');
        const exportLogsBtn = document.getElementById('exportLogsBtn');
        
        if (refreshLogsBtn) {
          refreshLogsBtn.addEventListener('click', () => {
            alert('Log aggiornati.');
          });
        }
        
        if (clearLogsBtn) {
          clearLogsBtn.addEventListener('click', () => {
            if (confirm('Sei sicuro di voler cancellare tutti i log?')) {
              alert('Log cancellati.');
            }
          });
        }
        
        if (exportLogsBtn) {
          exportLogsBtn.addEventListener('click', () => {
            alert('Log esportati in downloads/synapse_logs.txt');
          });
        }
      }, 500);
    }
    
    // Show modal - uso sia style che classe per massima compatibilità
    console.log('Showing admin panel modal');
    adminPanelModal.style.display = 'flex';
    adminPanelModal.classList.add('active');
    
    // Debug per verificare che il modal sia visibile
    console.log('Modal element:', adminPanelModal);
    console.log('Modal display style:', adminPanelModal.style.display);
    console.log('Modal classes:', adminPanelModal.className);
    console.log('Modal dimensions:', {
      width: adminPanelModal.offsetWidth,
      height: adminPanelModal.offsetHeight
    });
  }
  
  // Funzione per forzare il ruolo admin
  function forceAdminRole() {
    const session = getCurrentUser();
    if (session) {
      console.log('Forcing admin role for user:', session.email);
      session.role = 'admin';
      
      // Salva la sessione aggiornata
      if (window.api && window.api.setStoredItem) {
        window.api.setStoredItem('synapse_session', session);
      } else {
        localStorage.setItem('synapse_session', JSON.stringify(session));
      }
      
      // Ricarica la pagina per applicare le modifiche
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  }
  
  // Add click listeners to menu items
  if (profileMenuItem) {
    console.log('Adding click listener to profile menu item');
    profileMenuItem.removeEventListener('click', handleProfileMenuClick);
    profileMenuItem.addEventListener('click', handleProfileMenuClick);
    profileMenuItem.style.cursor = 'pointer';
  } else {
    console.error('Profile menu item not found');
  }
  
  if (settingsMenuItem) {
    console.log('Adding click listener to settings menu item');
    settingsMenuItem.removeEventListener('click', handleSettingsMenuClick);
    settingsMenuItem.addEventListener('click', handleSettingsMenuClick);
    settingsMenuItem.style.cursor = 'pointer';
  } else {
    console.error('Settings menu item not found');
  }
  
  if (logoutButton) {
    console.log('Adding click listener to logout button');
    // Remove any existing listeners
    logoutButton.removeEventListener('click', handleLogout);
    // Add click listener
    logoutButton.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent event from bubbling up to userProfile
      handleLogout();
    });
  }
  
  // Initialize profile
  loadUserProfile();
  
  // Force-fix z-index issues with dropdown
  const userDropdownMenu = document.querySelector('.user-dropdown-menu');
  if (userDropdownMenu) {
    userDropdownMenu.style.zIndex = '9999';
  }
}); 