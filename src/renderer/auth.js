// auth.js - Gestione autenticazione locale
document.addEventListener('DOMContentLoaded', () => {
  console.log('Auth script loaded');
  
  // Elementi UI
  const authTabs = document.querySelectorAll('.auth-tab');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const loginButton = document.getElementById('loginButton');
  const registerButton = document.getElementById('registerButton');
  const togglePasswordButtons = document.querySelectorAll('.toggle-password');
  const googleLoginBtn = document.getElementById('googleLoginBtn');
  
  // Campi del form di login
  const loginEmail = document.getElementById('loginEmail');
  const loginPassword = document.getElementById('loginPassword');
  const loginEmailError = document.getElementById('loginEmailError');
  const loginPasswordError = document.getElementById('loginPasswordError');
  const rememberMe = document.getElementById('rememberMe');
  
  // Campi del form di registrazione
  const registerName = document.getElementById('registerName');
  const registerEmail = document.getElementById('registerEmail');
  const registerPassword = document.getElementById('registerPassword');
  const registerNameError = document.getElementById('registerNameError');
  const registerEmailError = document.getElementById('registerEmailError');
  const registerPasswordError = document.getElementById('registerPasswordError');
  const acceptTerms = document.getElementById('acceptTerms');
  const termsError = document.getElementById('termsError');
  const passwordStrength = document.getElementById('passwordStrength');
  const strengthText = document.getElementById('strengthText');
  
  console.log('Auth elements initialized:', {
    loginForm: !!loginForm,
    registerForm: !!registerForm,
    loginButton: !!loginButton,
    registerButton: !!registerButton
  });
  
  // Funzione per passare da login a registrazione e viceversa
  authTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabType = tab.getAttribute('data-tab');
      const activeForm = (tabType === 'login') ? loginForm : registerForm;
      const inactiveForm = (tabType === 'login') ? registerForm : loginForm;
      
      // Se il tab cliccato è già attivo, non fare nulla
      if (tab.classList.contains('active')) {
        return;
      }
      
      // Disabilita i tab durante la transizione
      authTabs.forEach(t => t.disabled = true);
      
      // Pulisci gli errori
      clearErrors();
      
      // Aggiorna le classi delle tab
      authTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Listener per la fine della transizione di scomparsa
      const onTransitionEnd = () => {
        inactiveForm.removeEventListener('transitionend', onTransitionEnd);
        // Mostra il nuovo form
        activeForm.classList.remove('hidden');
        // Riabilita i tab
        authTabs.forEach(t => t.disabled = false);
      };

      // Avvia l'animazione di scomparsa del form inattivo
      if (!inactiveForm.classList.contains('hidden')) {
        inactiveForm.addEventListener('transitionend', onTransitionEnd);
        inactiveForm.classList.add('hidden');
      } else {
        // Se il form inattivo era già nascosto (improbabile ma sicuro)
        activeForm.classList.remove('hidden');
        authTabs.forEach(t => t.disabled = false);
      }
    });
  });
  
  // Toggle per mostrare/nascondere password
  togglePasswordButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const input = this.previousElementSibling;
      const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
      input.setAttribute('type', type);
      this.classList.toggle('fa-eye');
      this.classList.toggle('fa-eye-slash');
    });
  });
  
  // Validazione Email
  function isValidEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }
  
  // Validazione password
  function isStrongPassword(password) {
    // Almeno 8 caratteri, una maiuscola, una minuscola, un numero e un carattere speciale
    const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})");
    const mediumRegex = new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})");
    
    if (strongRegex.test(password)) {
      return { strength: 'forte', score: 100 };
    } else if (mediumRegex.test(password)) {
      return { strength: 'media', score: 60 };
    } else if (password.length >= 4) {
      return { strength: 'debole', score: 30 };
    } else {
      return { strength: 'molto debole', score: 10 };
    }
  }
  
  // Valutazione forza password in tempo reale
  if (registerPassword) {
    registerPassword.addEventListener('input', () => {
      const password = registerPassword.value;
      const { strength, score } = isStrongPassword(password);
      
      // Aggiorna barra di forza
      passwordStrength.style.width = `${score}%`;
      
      // Cambia colore in base alla forza
      if (score >= 80) {
        passwordStrength.style.backgroundColor = 'var(--success-color)';
      } else if (score >= 50) {
        passwordStrength.style.backgroundColor = '#FFA500';
      } else {
        passwordStrength.style.backgroundColor = 'var(--danger-color)';
      }
      
      // Aggiorna testo
      strengthText.textContent = `Sicurezza password: ${strength.charAt(0).toUpperCase() + strength.slice(1)}`;
    });
  }
  
  // Pulizia errori
  function clearErrors() {
    const errorElements = document.querySelectorAll('.form-error');
    errorElements.forEach(el => el.textContent = '');
  }
  
  // Funzioni di login e registrazione
  // --- LOGIN ---
  if (loginButton) {
    loginButton.addEventListener('click', (e) => {
      console.log('Login button clicked!');
      e.preventDefault();
      clearErrors();
      
      let isValid = true;
      
      // Validazione email
      if (!loginEmail.value.trim()) {
        loginEmailError.textContent = 'L\'email è obbligatoria';
        isValid = false;
      } else if (!isValidEmail(loginEmail.value)) {
        loginEmailError.textContent = 'Inserisci un\'email valida';
        isValid = false;
      }
      
      // Validazione password
      if (!loginPassword.value) {
        loginPasswordError.textContent = 'La password è obbligatoria';
        isValid = false;
      }
      
      if (isValid) {
        console.log('Login form is valid, calling handleLogin...');
        handleLogin(loginEmail.value, loginPassword.value, rememberMe.checked);
      }
    });
  } else {
    console.error('Login button (loginButton) not found!');
  }
  
  // --- REGISTRAZIONE ---
  if (registerButton) {
    registerButton.addEventListener('click', (e) => {
      e.preventDefault();
      clearErrors();
      
      let isValid = true;
      
      // Validazione nome
      if (!registerName.value.trim()) {
        registerNameError.textContent = 'Il nome è obbligatorio';
        isValid = false;
      }
      
      // Validazione email
      if (!registerEmail.value.trim()) {
        registerEmailError.textContent = 'L\'email è obbligatoria';
        isValid = false;
      } else if (!isValidEmail(registerEmail.value)) {
        registerEmailError.textContent = 'Inserisci un\'email valida';
        isValid = false;
      }
      
      // Validazione password
      if (!registerPassword.value) {
        registerPasswordError.textContent = 'La password è obbligatoria';
        isValid = false;
      } else {
        const { strength, score } = isStrongPassword(registerPassword.value);
        if (score < 50) {
          registerPasswordError.textContent = 'La password è troppo debole';
          isValid = false;
        }
      }
      
      // Validazione termini
      if (!acceptTerms.checked) {
        termsError.textContent = 'Devi accettare i termini per continuare';
        isValid = false;
      }
      
      if (isValid) {
        // Registra l'utente localmente
        handleRegistration(registerName.value, registerEmail.value, registerPassword.value);
      }
    });
  } else {
    console.error('Register button (registerButton) not found!');
  }
  
  // --- MOCK API IMPLEMENTATION (Uses synapseStore if available, else localStorage) ---
  const storage = window.synapseStore || localStorage;
  
  // Helper to ensure consistency
  const storageGet = (key) => {
    console.log(`Retrieving storage key: ${key}`);
    if (storage.get) { // Using synapseStore API from preload
      // Preload's get() already returns parsed object or null/original string
      const value = storage.get(key);
      console.log(`Retrieved value using synapseStore:`, value);
      return value; 
    } else { // Using standard localStorage fallback
      const value = storage.getItem(key);
      console.log(`Retrieved raw value using localStorage: ${value}`);
      // Parse only if using localStorage fallback
      try {
        return value ? JSON.parse(value) : null;
      } catch (e) {
        console.error(`Failed to parse localStorage item [${key}]:`, value, e);
        return null; // Return null if parsing fails
      }
    }
  };
  const storageSet = (key, value) => {
    console.log(`Setting storage key: ${key}`, value);
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    return storage.set ? storage.set(key, value) : storage.setItem(key, stringValue);
  };
  const storageRemove = (key) => {
    console.log(`Removing storage key: ${key}`);
    return storage.remove ? storage.remove(key) : storage.removeItem(key);
  };

  // Hash della password (simulato per ambiente locale)
  function hashPassword(password) {
    // In una implementazione reale si userebbe bcrypt.js
    // Qui facciamo solo un hash molto semplice per demo
    return btoa(password + 'synapse-salt'); // NON USARE IN PRODUZIONE
  }
  
  // Funzione per simulare il login
  function handleLogin(email, password, remember) {
    console.log('handleLogin function called with email:', email, 'remember:', remember);
    
    // Recupera gli utenti (storageGet now returns object or null)
    const users = storageGet('synapse_users') || [];
    console.log('Auth.js: Retrieved users:', users);
    
    // Cerca l'utente
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      console.log('Auth.js: User not found');
      loginEmailError.textContent = 'Utente non trovato';
      return;
    }
    
    // Verifica password (hash simulato)
    const hashedPassword = hashPassword(password);
    if (user.password !== hashedPassword) {
      console.log('Auth.js: Incorrect password');
      loginPasswordError.textContent = 'Password non corretta';
      return;
    }
    
    // Genera un token di autenticazione e memorizza la sessione
    const token = generateAuthToken();
    const expiresAt = remember ? null : Date.now() + (24 * 60 * 60 * 1000); // 24 ore se non "ricordami"
    
    console.log('Auth.js: Creating session with "Remember me":', remember);
    console.log('Auth.js: Session expiry set to:', expiresAt ? new Date(expiresAt).toLocaleString() : 'No expiration (remember me)');
    
    const session = {
      token,
      userId: user.id,
      name: user.name,
      email: user.email,
      expiresAt
    };
    
    storageSet('synapse_session', session);
    console.log('Auth.js: Session saved successfully');
    
    console.log('Auth.js: Login successful, redirecting...');
    // Redirect alla dashboard
    redirectToDashboard();
  }

  // Funzione per gestire la registrazione
  function handleRegistration(name, email, password) {
    console.log('handleRegistration called with:', name, email);
    // Recupera gli utenti attuali
    const users = storageGet('synapse_users') || [];
    console.log('Retrieved users for registration:', users);
    
    // Verifica se l'utente esiste già
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      registerEmailError.textContent = 'Email già registrata';
      return;
    }
    
    // Crea un nuovo utente
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password: hashPassword(password),
      createdAt: new Date().toISOString()
    };
    
    // Aggiungi l'utente alla lista
    users.push(newUser);
    storageSet('synapse_users', users);
    
    // Genera un token di autenticazione e memorizza la sessione
    const token = generateAuthToken();
    const session = {
      token,
      userId: newUser.id,
      name: newUser.name,
      email: newUser.email,
      expiresAt: null // Nessuna scadenza per un nuovo utente
    };
    
    storageSet('synapse_session', session);
    
    // Redirect alla dashboard
    redirectToDashboard();
  }
  
  // Funzione per generare un token casuale
  function generateAuthToken() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
  
  // Controlla se esiste già una sessione valida
  function checkSession() {
    console.log('Checking for existing session...');
    const session = storageGet('synapse_session');
    console.log('Auth.js: Session found:', session);
    
    if (session) {
      // Verifica se la sessione è scaduta
      if (session.expiresAt && session.expiresAt < Date.now()) {
        console.log('Auth.js: Session has expired, removing it. Expiry:', session.expiresAt, 'Current:', Date.now());
        storageRemove('synapse_session');
        return false;
      }
      
      console.log('Auth.js: Valid session found. Expiry status:', session.expiresAt ? `Expires at ${new Date(session.expiresAt).toLocaleString()}` : 'No expiration (remember me active)');
      return true;
    }
    
    console.log('Auth.js: No session found, staying on login page');
    return false;
  }
  
  // Funzione per reindirizzare alla dashboard
  function redirectToDashboard() {
    // In Electron, usiamo la comunicazione IPC tramite l'API esposta nel preload
    console.log('Redirecting to dashboard...');
    if (window.api && window.api.navigate) {
      // Utilizziamo 'index' invece di 'dashboard' per evitare errori
      console.log('Using api.navigate to go to index.html');
      window.api.navigate('index');
    } else {
      console.error('Navigation API not available!');
      // Fallback
      window.location.href = 'index.html';
    }
  }
  
  // Google Login Button
  if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      console.log('Google login button clicked');
      
      try {
        // Show loading state
        googleLoginBtn.classList.add('loading');
        googleLoginBtn.disabled = true;
        googleLoginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Simulazione login...</span>';
        
        // Clear any previous errors
        clearErrors();
        
        // Simulate successful Google login with a test account
        setTimeout(() => {
          console.log('Simulating successful Google login with test account');
          
          // Create a mock Google user
          const mockGoogleUser = {
            id: 'google-123456789',
            name: 'Test User',
            email: 'test.user@example.com',
            picture: 'https://ui-avatars.com/api/?name=Test+User&background=4285F4&color=fff',
            oauthProvider: 'google'
          };
          
          // Store the user in local storage
          const users = storageGet('synapse_users') || [];
          let user = users.find(u => u.email.toLowerCase() === mockGoogleUser.email.toLowerCase());
          
          if (!user) {
            // Create new user if not exists
            user = {
              ...mockGoogleUser,
              createdAt: new Date().toISOString()
            };
            users.push(user);
            storageSet('synapse_users', users);
          }
          
          // Create a session
          const session = {
            token: 'mock-google-token-' + Date.now(),
            userId: user.id,
            name: user.name,
            email: user.email,
            picture: user.picture,
            oauthProvider: 'google',
            expiresAt: null // We want Google logins to always be remembered
          };
          
          // Save the session
          storageSet('synapse_session', session);
          
          // Show success and redirect
          googleLoginBtn.innerHTML = '<i class="fas fa-check"></i><span>Accesso effettuato!</span>';
          
          setTimeout(() => {
            redirectToDashboard();
          }, 1000);
        }, 1500);
      } catch (error) {
        console.error('Error during Google authentication:', error);
        loginEmailError.textContent = 'Si è verificato un errore: ' + error.message;
        
        // Reset button state
        googleLoginBtn.classList.remove('loading');
        googleLoginBtn.disabled = false;
        googleLoginBtn.innerHTML = '<i class="fab fa-google"></i><span>Accedi con Google</span><div class="feature-badge">Nuovo</div>';
      }
    });
  } else {
    console.error('Google login button (googleLoginBtn) not found!');
  }
  
  // Controlla la sessione all'avvio
  checkSession();
}); 