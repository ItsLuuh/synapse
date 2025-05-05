/**
 * Voice-to-Text funzionalità per Synapse
 * Versione semplificata con widget onde visuale ma senza audio reale - solo simulazione
 */

document.addEventListener('DOMContentLoaded', () => {
  try {
    // Elementi
    const voiceToTextBtn = document.getElementById('voiceToTextBtn');
    
    // Verifica che gli elementi necessari esistano
    if (!voiceToTextBtn) {
      console.error("Elemento 'voiceToTextBtn' non trovato nella pagina");
      return;
    }
    
    // Trova l'elemento input
    const userInput = document.getElementById('userInput') || document.querySelector('textarea[id*="input"]');
    
    if (!userInput) {
      console.error("Elemento input utente non trovato nella pagina");
      return;
    }

    // Configurazioni di base
    let isRecording = false;
    let recognition = null;
    let audioWaveWidget = null;
    let animationFrameId = null;
    let canvasContext = null;
    let recordingStartTime = 0;
    let lastPhraseTime = 0; // Per l'animazione delle onde audio
    let retryCount = 0;  // Contatore per i tentativi di riconnessione
    const MAX_RETRY_ATTEMPTS = 3;  // Numero massimo di tentativi
    let useHTTPS = true; // La Web Speech API richiede HTTPS in molti browser
    let networkTestPassed = false; // Flag per test di connettività
    let availableMicrophones = []; // Array per i microfoni disponibili
    let selectedMicrophoneId = null; // ID del microfono selezionato
    let audioStream = null; // Stream audio corrente
    let offlineMode = false; // Modalità offline per il riconoscimento vocale
    let audioContext = null; // Contesto audio per la modalità offline
    let audioProcessor = null; // Processore audio per la modalità offline
    let audioAnalyser = null; // Analizzatore per visualizzare l'audio reale
    let audioDataArray = null; // Array per i dati audio
    let useDemoMode = false; // Modalità demo che usa frasi simulate per simulare il riconoscimento
    let demoTimerId = null; // Timer per la modalità demo
    let permissionState = 'prompt'; // Stato del permesso: 'granted', 'denied', 'prompt'
    
    // Configurazione per debug
    const DEBUG_MODE = true;

    // Opzioni alternative di linguaggio
    const AVAILABLE_LANGUAGES = [
      { code: 'it-IT', name: 'Italiano' },
      { code: 'en-US', name: 'Inglese (USA)' },
      { code: 'en-GB', name: 'Inglese (UK)' },
      { code: 'es-ES', name: 'Spagnolo' },
      { code: 'fr-FR', name: 'Francese' },
      { code: 'de-DE', name: 'Tedesco' }
    ];
    
    // Lingua predefinita
    let currentLanguage = 'it-IT';
    
    // Frasi per simulare il riconoscimento vocale con categorie diverse
    const voiceRecognitionPhrases = {
      greeting: [
        "Ciao, come posso aiutarti oggi?",
        "Bentornato, sono pronto ad aiutarti",
        "Buongiorno, sono il tuo assistente vocale",
        "Salve, sono in ascolto"
      ],
      acknowledgement: [
        "Ho compreso correttamente?",
        "Sto elaborando la tua richiesta",
        "Ho capito quello che hai detto",
        "Sto analizzando il tuo messaggio"
      ],
      response: [
        "Ecco il testo che hai dettato",
        "Ecco la trascrizione della tua voce",
        "Ho trascritto quello che hai detto",
        "Ecco il risultato della conversione vocale"
      ],
      feedback: [
        "Ottimo, hai inserito del testo tramite voce",
        "Continua pure a parlare, ti sto ascoltando",
        "La registrazione sta funzionando correttamente",
        "Sto registrando la tua voce senza problemi"
      ],
      system: [
        "Avvio riconoscimento vocale...",
        "Connessione al servizio vocale stabilita",
        "Microfono attivo e funzionante",
        "Modalità dettatura attivata"
      ],
      contextual: [
        "Posso cercare informazioni per te",
        "Dimmi pure cosa cerchi",
        "Posso prendere appunti mentre parli",
        "Sto convertendo la tua voce in testo"
      ],
      demo: [
        "Questa è una simulazione di riconoscimento vocale",
        "Sto mostrando un esempio di funzionamento",
        "In questo momento sto simulando la tua voce",
        "Questo è un testo di esempio per dimostrare la funzionalità",
        "Immagina che questo sia il risultato della tua voce",
        "Questa è una modalità dimostrativa senza riconoscimento reale",
        "Quando parli, il testo apparirebbe qui come questo esempio",
        "Il riconoscimento vocale reale non è attivo, ma questa è la sua simulazione",
        "Synapse è un'applicazione molto potente per l'organizzazione",
        "Puoi creare note, gestire progetti e molto altro",
        "La modalità di dettatura vocale ti permette di scrivere senza tastiera",
        "Questo testo è generato per simulare il riconoscimento vocale"
      ]
    };
    
    // Sequenza iniziale di frasi (per dare l'impressione di un sistema reale)
    const initialSequence = [
      { text: "Avvio riconoscimento vocale...", delay: 500, category: "system" },
      { text: "Microfono attivo e funzionante", delay: 1500, category: "system" },
      { text: "Sto ascoltando...", delay: 2500, category: "system" }
    ];

    // Funzione di debug
    function logDebug(message) {
      if (DEBUG_MODE) {
        console.log(`[Voice-to-Text Debug] ${message}`);
      }
    }
    
    // Test dei dispositivi audio disponibili
    async function getAvailableMicrophones() {
      try {
        // Resetta l'array dei microfoni
        availableMicrophones = [];
        
        // Ottieni la lista dei dispositivi
        const devices = await navigator.mediaDevices.enumerateDevices();
        
        // Filtra solo i dispositivi di input audio (microfoni)
        const microphones = devices.filter(device => device.kind === 'audioinput');
        
        // Se non ci sono microfoni, mostra un errore
        if (microphones.length === 0) {
          showToast('Nessun microfono trovato nel sistema', 'error');
          logDebug('Nessun microfono trovato');
          return false;
        }
        
        // Aggiorna l'array dei microfoni disponibili
        availableMicrophones = microphones;
        
        // Se non è stato selezionato alcun microfono, seleziona il primo
        if (!selectedMicrophoneId && microphones.length > 0) {
          selectedMicrophoneId = microphones[0].deviceId;
          logDebug(`Microfono predefinito selezionato: ${microphones[0].label || 'Microfono predefinito'}`);
        }
        
        logDebug(`Trovati ${microphones.length} microfoni`);
        microphones.forEach((mic, index) => {
          logDebug(`Microfono ${index + 1}: ${mic.label || 'Microfono ' + (index + 1)} (${mic.deviceId})`);
        });
        
        return true;
      } catch (error) {
        console.error('Errore nell\'enumerazione dei dispositivi audio:', error);
        logDebug(`Errore nell'enumerazione dei dispositivi: ${error.message}`);
        return false;
      }
    }
    
    // Inizializzazione dell'audio context per la modalità offline
    function initAudioContext() {
      try {
        // Crea un nuovo contesto audio se non esiste già
        if (!audioContext) {
          window.AudioContext = window.AudioContext || window.webkitAudioContext;
          audioContext = new AudioContext();
          logDebug('Audio context inizializzato');
        }
        
        return true;
      } catch (error) {
        console.error('Errore nell\'inizializzazione dell\'audio context:', error);
        logDebug(`Errore nell'inizializzazione dell'audio context: ${error.message}`);
        return false;
      }
    }
    
    // Avvia il microfono e crea l'analizzatore per visualizzare l'audio
    async function startMicrophone() {
      try {
        console.log('Avvio microfono...');
        
        // Controllo specifico per l'ambiente Electron
        const isElectronEnv = window.electron !== undefined;
        console.log('Ambiente Electron rilevato:', isElectronEnv);
        
        // Se esiste già uno stream, fermalo
        if (audioStream) {
          console.log('Stream audio esistente trovato, fermando...');
          audioStream.getTracks().forEach(track => track.stop());
          audioStream = null;
        }
        
        // Opzioni per il microfono
        const constraints = {
          audio: selectedMicrophoneId ? 
            { deviceId: { exact: selectedMicrophoneId } } : 
            true
        };
        
        console.log('Richiesta accesso al microfono con constraints:', constraints);
        
        // Richiedi l'accesso al microfono
        try {
          audioStream = await navigator.mediaDevices.getUserMedia(constraints);
          console.log('Accesso al microfono ottenuto con successo!', audioStream.getAudioTracks().length, 'tracce audio');
          
          // Log delle informazioni sulle tracce
          audioStream.getAudioTracks().forEach((track, index) => {
            console.log(`Traccia audio ${index}:`, {
              enabled: track.enabled,
              id: track.id,
              kind: track.kind,
              label: track.label,
              muted: track.muted,
              readyState: track.readyState
            });
          });
        } catch (error) {
          console.error('Errore nella getUserMedia:', error);
          
          // In Electron, proviamo ad utilizzare l'API dedicata se disponibile
          if (isElectronEnv && window.electron.requestMicrophonePermission) {
            console.log('Tentativo di richiesta permesso microfono tramite API Electron...');
            const result = await window.electron.requestMicrophonePermission();
            console.log('Risultato richiesta permessi Electron:', result);
            
            if (result.granted) {
              console.log('Permesso concesso tramite Electron, riprovo getUserMedia...');
              // Riprova la getUserMedia
              try {
                audioStream = await navigator.mediaDevices.getUserMedia(constraints);
                console.log('Secondo tentativo riuscito!');
              } catch (secondError) {
                console.error('Secondo tentativo fallito:', secondError);
                return false;
              }
            } else {
              console.error('Permesso negato anche tramite Electron');
              return false;
            }
          } else {
            return false;
          }
        }
        
        // Inizializza l'audio context se siamo in modalità offline
        if (offlineMode) {
          console.log('Inizializzazione AudioContext in modalità offline...');
          initAudioContext();
          
          // Crea una sorgente audio dallo stream del microfono
          const source = audioContext.createMediaStreamSource(audioStream);
          
          // Crea un analizzatore per visualizzare l'audio
          audioAnalyser = audioContext.createAnalyser();
          audioAnalyser.fftSize = 256; // Valore più comune per visualizzare l'audio
          
          // Crea un array per i dati audio
          const bufferLength = audioAnalyser.frequencyBinCount;
          audioDataArray = new Uint8Array(bufferLength);
          
          // Connetti la sorgente all'analizzatore
          source.connect(audioAnalyser);
          
          // Non colleghiamo l'analizzatore all'output per evitare effetti echo
          // audioAnalyser.connect(audioContext.destination);
          
          logDebug('Microfono avviato in modalità offline');
          console.log('Microfono avviato in modalità offline con analizzatore audio');
        } else {
          console.log('Microfono avviato in modalità online');
        }
        
        return true;
      } catch (error) {
        console.error('Errore nell\'avvio del microfono:', error);
        logDebug(`Errore nell'avvio del microfono: ${error.message}`);
        console.error('Stack trace errore:', error.stack);
        return false;
      }
    }
    
    // Ferma il microfono
    function stopMicrophone() {
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
        audioStream = null;
        logDebug('Microfono fermato');
      }
      
      if (audioProcessor) {
        audioProcessor.disconnect();
        audioProcessor = null;
      }
      
      if (audioAnalyser) {
        audioAnalyser.disconnect();
        audioAnalyser = null;
      }
    }
    
    // Gestisci l'audio in modalità offline
    function processAudioOffline() {
      if (!audioAnalyser || !isRecording || !audioDataArray) return;
      
      // Ottieni i dati audio dall'analizzatore
      audioAnalyser.getByteFrequencyData(audioDataArray);
      
      // Calcola il volume medio
      let sum = 0;
      for (let i = 0; i < audioDataArray.length; i++) {
        sum += audioDataArray[i];
      }
      const average = sum / audioDataArray.length;
      
      // Aggiorna il livello audio visualizzato
      const audioLevel = Math.floor((average / 255) * 100);
      const audioLevelEl = document.getElementById('audio-level');
      if (audioLevelEl) {
        audioLevelEl.textContent = audioLevel + '%';
        audioLevelEl.style.color = audioLevel > 70 ? '#e74c3c' : 
                               audioLevel > 40 ? '#f39c12' : '#3498db';
      }
      
      // Aggiorna il timestamp dell'ultima "frase" per l'animazione
      if (audioLevel > 30) {
        lastPhraseTime = Date.now();
      }
    }
    
    // Verifica lo stato dei permessi del microfono
    async function checkMicrophonePermission() {
      try {
        // Prima verifichiamo se siamo in Electron e usiamo l'API dedicata
        if (window.electron && window.electron.requestMicrophonePermission) {
          // Usando l'API dedicata di Electron
          console.log('Controllo permessi tramite API Electron');
          const result = await window.electron.checkMicrophonePermission();
          console.log('Risultato controllo permessi Electron:', result);
          
          // Aggiorniamo lo stato del permesso in base alla risposta
          permissionState = result.state;
          localStorage.setItem('microphonePermission', permissionState);
          
          return permissionState === 'granted';
        }
        
        // Continua con il metodo standard per browser
        // Prima controlla se il permesso è stato già memorizzato
        const savedPermission = localStorage.getItem('microphonePermission');
        
        if (savedPermission) {
          logDebug(`Permesso microfono memorizzato: ${savedPermission}`);
          permissionState = savedPermission;
          
          // Se il permesso è negato, chiedi all'utente di cambiare le impostazioni
          if (savedPermission === 'denied') {
            return false;
          }
          
          // Se il permesso è stato concesso, proviamo comunque ad ottenerlo per verificare
          if (savedPermission === 'granted') {
            try {
              const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
              stream.getTracks().forEach(track => track.stop());
              return true;
            } catch (err) {
              // Se c'è un errore, il permesso potrebbe essere stato revocato
              permissionState = 'prompt';
              localStorage.setItem('microphonePermission', 'prompt');
              return false;
            }
          }
        }
        
        // Se supportato, usiamo Permissions API per controllare lo stato
        if (navigator.permissions && navigator.permissions.query) {
          const permissionStatus = await navigator.permissions.query({ name: 'microphone' });
          
          logDebug(`Stato attuale permesso microfono: ${permissionStatus.state}`);
          permissionState = permissionStatus.state;
          
          // Memorizza lo stato del permesso
          localStorage.setItem('microphonePermission', permissionState);
          
          // Listener per cambiamenti futuri
          permissionStatus.onchange = function() {
            logDebug(`Permesso microfono cambiato a: ${this.state}`);
            permissionState = this.state;
            localStorage.setItem('microphonePermission', permissionState);
          };
          
          return permissionStatus.state === 'granted';
        } else {
          // Fallback: prova direttamente a ottenere accesso
          logDebug('Permissions API non supportata, tentativo diretto');
          return false; // Richiederemo esplicitamente più tardi
        }
      } catch (error) {
        console.error('Errore nella verifica dei permessi del microfono:', error);
        logDebug(`Errore verifica permessi: ${error.message}`);
        return false;
      }
    }
    
    // Richiedi esplicitamente il permesso del microfono
    async function requestMicrophonePermission() {
      return new Promise(async (resolve) => {
        try {
          // Prima verifichiamo se siamo in Electron e usiamo l'API dedicata
          if (window.electron && window.electron.requestMicrophonePermission) {
            console.log('Richiedo permesso tramite API Electron');
            const result = await window.electron.requestMicrophonePermission();
            console.log('Risultato richiesta permessi Electron:', result);
            
            // Se il permesso è stato concesso, aggiorniamo lo stato e ritorniamo
            if (result.granted) {
              permissionState = 'granted';
              localStorage.setItem('microphonePermission', 'granted');
              resolve(true);
              return;
            } else {
              // Se negato, mostra la nostra finestra di dialogo personalizzata
              permissionState = 'denied';
              localStorage.setItem('microphonePermission', 'denied');
              showPermissionDialog('denied', resolve);
              return;
            }
          }
          
          // Continua con il metodo standard per browser
          // Prima verifica lo stato attuale
          await checkMicrophonePermission();
          
          if (permissionState === 'granted') {
            logDebug('Permesso già concesso');
            resolve(true);
            return;
          }
          
          // Se è stato negato, mostra una finestra di dialogo personalizzata
          if (permissionState === 'denied') {
            showPermissionDialog('denied', resolve);
            return;
          }
          
          // Mostra una finestra di dialogo informativa prima di chiedere il permesso
          showPermissionDialog('prompt', async (proceed) => {
            if (proceed) {
              try {
                // Richiedi il permesso
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                
                // Successo, ferma lo stream di test e salva lo stato
                stream.getTracks().forEach(track => track.stop());
                permissionState = 'granted';
                localStorage.setItem('microphonePermission', 'granted');
                
                logDebug('Permesso microfono concesso');
                resolve(true);
              } catch (err) {
                // Permesso negato o errore
                console.error('Errore nella richiesta del permesso:', err);
                permissionState = 'denied';
                localStorage.setItem('microphonePermission', 'denied');
                
                logDebug(`Permesso negato o errore: ${err.message}`);
                showPermissionDialog('denied', resolve);
              }
            } else {
              // L'utente ha annullato dalla nostra finestra di dialogo
              logDebug('Richiesta permesso annullata dall\'utente');
              resolve(false);
            }
          });
        } catch (error) {
          console.error('Errore nella richiesta del permesso:', error);
          logDebug(`Errore richiesta permesso: ${error.message}`);
          resolve(false);
        }
      });
    }
    
    // Mostra una finestra di dialogo informativa per i permessi
    function showPermissionDialog(state, callback) {
      // Crea la finestra di dialogo
      const dialog = document.createElement('div');
      dialog.className = 'permission-dialog';
      dialog.style.position = 'fixed';
      dialog.style.top = '50%';
      dialog.style.left = '50%';
      dialog.style.transform = 'translate(-50%, -50%)';
      dialog.style.backgroundColor = '#2a2a2a';
      dialog.style.borderRadius = '10px';
      dialog.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.5)';
      dialog.style.padding = '25px';
      dialog.style.width = '450px';
      dialog.style.maxWidth = '90%';
      dialog.style.zIndex = '10002';
      dialog.style.color = 'white';
      
      // Titolo
      const title = document.createElement('h2');
      title.style.margin = '0 0 20px 0';
      title.style.fontSize = '20px';
      title.style.fontWeight = 'bold';
      title.style.textAlign = 'center';
      
      // Contenuto
      const content = document.createElement('div');
      content.style.marginBottom = '25px';
      content.style.lineHeight = '1.5';
      
      // Pulsanti
      const buttons = document.createElement('div');
      buttons.style.display = 'flex';
      buttons.style.justifyContent = 'center';
      buttons.style.gap = '15px';
      
      // Overlay di sfondo
      const overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      overlay.style.zIndex = '10001';
      
      // Crea un'icona per il microfono
      const micIcon = document.createElement('div');
      micIcon.style.textAlign = 'center';
      micIcon.style.marginBottom = '20px';
      micIcon.innerHTML = `
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 15.5C14.21 15.5 16 13.71 16 11.5V6C16 3.79 14.21 2 12 2C9.79 2 8 3.79 8 6V11.5C8 13.71 9.79 15.5 12 15.5Z" 
            stroke="${state === 'denied' ? '#ff5555' : '#3498db'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M4.34961 9.65039V11.3504C4.34961 15.5704 7.77961 19.0004 11.9996 19.0004C16.2196 19.0004 19.6496 15.5704 19.6496 11.3504V9.65039" 
            stroke="${state === 'denied' ? '#ff5555' : '#3498db'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 19V22" stroke="${state === 'denied' ? '#ff5555' : '#3498db'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          ${state === 'denied' ? '<path d="M4 4L20 20" stroke="#ff5555" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' : ''}
        </svg>
      `;
      
      // Configura in base allo stato
      if (state === 'prompt') {
        title.textContent = 'Permesso Microfono Richiesto';
        content.innerHTML = `
          <p>Per utilizzare la funzionalità di riconoscimento vocale, Synapse ha bisogno dell'accesso al tuo microfono.</p>
          <p>Quando richiesto dal browser, seleziona "Consenti" per attivare il riconoscimento vocale.</p>
          <p>Questa autorizzazione verrà ricordata per i futuri utilizzi.</p>
        `;
        
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Annulla';
        cancelBtn.style.padding = '10px 20px';
        cancelBtn.style.backgroundColor = '#555';
        cancelBtn.style.border = 'none';
        cancelBtn.style.borderRadius = '5px';
        cancelBtn.style.color = 'white';
        cancelBtn.style.cursor = 'pointer';
        cancelBtn.style.fontSize = '14px';
        cancelBtn.onclick = () => {
          document.body.removeChild(overlay);
          document.body.removeChild(dialog);
          callback(false);
        };
        
        const allowBtn = document.createElement('button');
        allowBtn.textContent = 'Consenti Accesso';
        allowBtn.style.padding = '10px 20px';
        allowBtn.style.backgroundColor = '#3498db';
        allowBtn.style.border = 'none';
        allowBtn.style.borderRadius = '5px';
        allowBtn.style.color = 'white';
        allowBtn.style.cursor = 'pointer';
        allowBtn.style.fontSize = '14px';
        allowBtn.style.fontWeight = 'bold';
        allowBtn.onclick = () => {
          document.body.removeChild(overlay);
          document.body.removeChild(dialog);
          callback(true);
        };
        
        buttons.appendChild(cancelBtn);
        buttons.appendChild(allowBtn);
      } else if (state === 'denied') {
        title.textContent = 'Accesso al Microfono Bloccato';
        content.innerHTML = `
          <p>L'accesso al microfono è stato bloccato. Per utilizzare la funzionalità voice-to-text, dovrai abilitare il permesso nelle impostazioni del browser.</p>
          <p>Ecco come fare:</p>
          <ol style="margin-left: 20px; margin-top: 10px;">
            <li>Clicca sull'icona del lucchetto (o simile) nella barra degli indirizzi</li>
            <li>Trova l'impostazione "Microfono" o "Permessi"</li>
            <li>Cambia l'impostazione su "Consenti"</li>
            <li>Ricarica la pagina</li>
          </ol>
        `;
        
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Chiudi';
        closeBtn.style.padding = '10px 20px';
        closeBtn.style.backgroundColor = '#555';
        closeBtn.style.border = 'none';
        closeBtn.style.borderRadius = '5px';
        closeBtn.style.color = 'white';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.fontSize = '14px';
        closeBtn.onclick = () => {
          document.body.removeChild(overlay);
          document.body.removeChild(dialog);
          callback(false);
        };
        
        const settingsBtn = document.createElement('button');
        settingsBtn.textContent = 'Apri Impostazioni';
        settingsBtn.style.padding = '10px 20px';
        settingsBtn.style.backgroundColor = '#3498db';
        settingsBtn.style.border = 'none';
        settingsBtn.style.borderRadius = '5px';
        settingsBtn.style.color = 'white';
        settingsBtn.style.cursor = 'pointer';
        settingsBtn.style.fontSize = '14px';
        settingsBtn.style.fontWeight = 'bold';
        
        // Tenta di aprire le impostazioni del sito o mostra istruzioni
        settingsBtn.onclick = () => {
          // In Electron, apriamo la pagina delle impostazioni microfono
          if (window.electron && window.electron.openExternalLink) {
            if (window.api && window.api.openMicrophoneSettings) {
              window.api.openMicrophoneSettings().catch(err => {
                console.error('Errore apertura impostazioni:', err);
              });
            } else {
              // Fallback per aprire le impostazioni in Electron
              window.electron.openExternalLink('ms-settings:privacy-microphone').catch(err => {
                console.error('Errore apertura impostazioni:', err);
              });
            }
          } else {
            // In un browser normale, mostriamo istruzioni più dettagliate
            alert('Per favore, segui questi passi:\n\n' +
                  '1. Clicca sull\'icona del lucchetto nella barra degli indirizzi\n' +
                  '2. Trova "Microfono" nelle impostazioni del sito\n' +
                  '3. Seleziona "Consenti"\n' +
                  '4. Ricarica la pagina');
          }
          
          document.body.removeChild(overlay);
          document.body.removeChild(dialog);
          callback(false);
        };
        
        buttons.appendChild(closeBtn);
        buttons.appendChild(settingsBtn);
      }
      
      // Assembla la finestra di dialogo
      dialog.appendChild(micIcon);
      dialog.appendChild(title);
      dialog.appendChild(content);
      dialog.appendChild(buttons);
      
      // Aggiungi al DOM
      document.body.appendChild(overlay);
      document.body.appendChild(dialog);
    }
    
    // Test di connettività e requisiti
    async function testSpeechRecognitionRequirements() {
      // Resetta il flag
      networkTestPassed = false;
      
      logDebug('Verifica requisiti per Speech Recognition');
      console.log('Iniziando verifica requisiti riconoscimento vocale...');
      
      // Controllo specifico per l'ambiente Electron
      const isElectronEnv = window.electron !== undefined;
      console.log('Ambiente Electron rilevato:', isElectronEnv);
      
      // Test 0: Verifica permessi microfono
      const micPermissionGranted = await checkMicrophonePermission();
      logDebug(`Permesso microfono già concesso: ${micPermissionGranted}`);
      console.log('Permesso microfono già concesso:', micPermissionGranted);
      
      if (!micPermissionGranted) {
        console.log('Permesso microfono non concesso, richiedo permesso...');
        const permissionResult = await requestMicrophonePermission();
        logDebug(`Risultato richiesta permesso: ${permissionResult}`);
        console.log('Risultato richiesta permesso:', permissionResult);
        
        if (!permissionResult) {
          // Se l'utente ha rifiutato il permesso, usiamo la modalità demo
          if (confirm('Vuoi attivare la modalità demo che simula il riconoscimento vocale?')) {
            useDemoMode = true;
            return true; // Permetti di continuare con la modalità demo
          }
          return false;
        }
      }
      
      // Test 1: Verifica che il browser supporti l'API
      const apiSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
      logDebug(`API supportata: ${apiSupported}`);
      console.log('API Web Speech supportata:', apiSupported);
      
      if (!apiSupported) {
        showToast('Il tuo browser non supporta il riconoscimento vocale', 'error');
        return false;
      }
      
      // In ambiente Electron, possiamo saltare alcuni controlli
      if (isElectronEnv) {
        console.log('In ambiente Electron: salto i controlli di rete e protocollo');
        networkTestPassed = true; // Consideriamo il test di rete superato in Electron
        return true;
      }
      
      // Test 2: Verifica connessione internet
      const isOnline = navigator.onLine;
      logDebug(`Connessione internet: ${isOnline ? 'Attiva' : 'Non attiva'}`);
      console.log('Connessione internet:', isOnline ? 'Attiva' : 'Non attiva');
      
      if (!isOnline) {
        showToast('Nessuna connessione internet rilevata', 'error');
        return false;
      }
      
      // Test 3: Protocollo HTTPS
      const isSecure = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
      logDebug(`Protocollo sicuro (HTTPS): ${isSecure ? 'Sì' : 'No'}`);
      console.log('Protocollo sicuro (HTTPS):', isSecure ? 'Sì' : 'No');
      
      if (!isSecure) {
        logDebug('ATTENZIONE: Web Speech API potrebbe non funzionare senza HTTPS');
        console.warn('ATTENZIONE: Web Speech API potrebbe non funzionare senza HTTPS');
        showToast('La connessione non è sicura (HTTPS). Il riconoscimento vocale potrebbe non funzionare.', 'warning');
        // Non blocchiamo, ma segnaliamo il problema
      }
      
      // Test 4: Test di connettività al servizio di riconoscimento vocale
      try {
        console.log('Avvio test di connettività al servizio di riconoscimento vocale...');
        // Creiamo una temporanea istanza di SpeechRecognition per testare la connessione
        const testRecognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        
        // Impostiamo un timeout di 5 secondi per il test
        const timeoutId = setTimeout(() => {
          try { testRecognition.abort(); } catch (e) {}
          logDebug('Test di connettività: Timeout');
          console.log('Test di connettività: Timeout');
          showToast('Impossibile connettersi al servizio di riconoscimento vocale', 'error');
        }, 5000);
        
        // Event handler temporaneo per errori
        testRecognition.onerror = (event) => {
          clearTimeout(timeoutId);
          console.log('Test di connettività - Errore:', event.error);
          
          if (event.error === 'network') {
            logDebug('Test di connettività: Fallito - Errore di rete');
            console.error('Test di connettività: Fallito - Errore di rete');
            showPermissionsAndSettingsDialog();
            return false;
          } else if (event.error === 'not-allowed') {
            logDebug('Test di connettività: Fallito - Permessi negati');
            console.error('Test di connettività: Fallito - Permessi negati');
            showPermissionsAndSettingsDialog();
            return false;
          }
          
          // Altri errori non critici per il test
          logDebug(`Test di connettività: Avvertimento - ${event.error}`);
          console.warn(`Test di connettività: Avvertimento - ${event.error}`);
        };
        
        // Event handler per la fine del test
        testRecognition.onend = () => {
          clearTimeout(timeoutId);
          networkTestPassed = true;
          logDebug('Test di connettività: Completato con successo');
          console.log('Test di connettività: Completato con successo');
        };
        
        // Configurazione minimale per il test
        testRecognition.continuous = false;
        testRecognition.interimResults = false;
        testRecognition.maxAlternatives = 1;
        testRecognition.lang = currentLanguage;
        
        // Avvio del test
        logDebug('Avvio test di connettività...');
        testRecognition.start();
        
        // Fermiamo dopo 2 secondi, è sufficiente per verificare la connettività
        setTimeout(() => {
          try { 
            testRecognition.abort();
            // Se siamo arrivati qui senza errori, consideriamo il test superato
            networkTestPassed = true;
            logDebug('Test di connettività: Superato');
            console.log('Test di connettività: Superato');
          } catch (e) {
            console.error('Errore durante l\'arresto del test:', e);
          }
        }, 2000);
        
      } catch (err) {
        logDebug(`Test di connettività: Errore durante l'inizializzazione del test - ${err.message}`);
        console.error(`Test di connettività: Errore durante l'inizializzazione del test - ${err.message}`);
        return false;
      }
      
      console.log('Verifica requisiti completata con successo');
      return true;
    }
    
    // Mostra una finestra di dialogo con informazioni sui permessi e le impostazioni
    function showPermissionsAndSettingsDialog() {
      // Crea una finestra di dialogo per aiutare l'utente a risolvere i problemi
      const dialog = document.createElement('div');
      dialog.className = 'permissions-dialog';
      dialog.style.position = 'fixed';
      dialog.style.top = '50%';
      dialog.style.left = '50%';
      dialog.style.transform = 'translate(-50%, -50%)';
      dialog.style.backgroundColor = '#2a2a2a';
      dialog.style.borderRadius = '8px';
      dialog.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.5)';
      dialog.style.padding = '20px';
      dialog.style.width = '500px';
      dialog.style.maxWidth = '90%';
      dialog.style.zIndex = '10001';
      dialog.style.color = 'white';
      
      // Titolo
      const title = document.createElement('h2');
      title.textContent = 'Problemi con il riconoscimento vocale';
      title.style.margin = '0 0 15px 0';
      title.style.fontSize = '18px';
      title.style.borderBottom = '1px solid #444';
      title.style.paddingBottom = '10px';
      
      // Contenuto
      const content = document.createElement('div');
      content.innerHTML = `
        <p style="margin-bottom: 15px;">
          È stato rilevato un problema con il servizio di riconoscimento vocale. 
          Ecco alcune possibili soluzioni:
        </p>
        
        <h3 style="font-size: 16px; margin: 15px 0 10px;">Permessi del microfono</h3>
        <ul style="margin: 0 0 15px 20px; padding: 0; line-height: 1.5;">
          <li>Verifica che il permesso del microfono sia concesso per questo sito</li>
          <li>Controlla le impostazioni del browser (icona del lucchetto nella barra degli indirizzi)</li>
          <li>Riavvia il browser dopo aver modificato i permessi</li>
        </ul>
        
        <h3 style="font-size: 16px; margin: 15px 0 10px;">Problemi di rete</h3>
        <ul style="margin: 0 0 15px 20px; padding: 0; line-height: 1.5;">
          <li>Verifica che la tua connessione internet sia stabile</li>
          <li>Prova a disattivare temporaneamente firewall o VPN</li>
          <li>Il servizio potrebbe essere temporaneamente non disponibile nel tuo paese</li>
        </ul>
        
        <h3 style="font-size: 16px; margin: 15px 0 10px;">Impostazioni lingua</h3>
        <div style="margin-bottom: 15px;">
          <p style="margin-bottom: 10px;">Prova a cambiare la lingua:</p>
          <select id="language-select" style="width: 100%; padding: 8px; background: #333; color: white; border: 1px solid #555; border-radius: 4px;">
            ${AVAILABLE_LANGUAGES.map(lang => 
              `<option value="${lang.code}" ${lang.code === currentLanguage ? 'selected' : ''}>${lang.name}</option>`
            ).join('')}
          </select>
        </div>
      `;
      
      // Pulsanti
      const buttons = document.createElement('div');
      buttons.style.display = 'flex';
      buttons.style.justifyContent = 'flex-end';
      buttons.style.marginTop = '20px';
      
      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = 'Chiudi';
      cancelBtn.style.backgroundColor = '#555';
      cancelBtn.style.color = 'white';
      cancelBtn.style.border = 'none';
      cancelBtn.style.padding = '8px 15px';
      cancelBtn.style.marginRight = '10px';
      cancelBtn.style.borderRadius = '4px';
      cancelBtn.style.cursor = 'pointer';
      
      const tryAgainBtn = document.createElement('button');
      tryAgainBtn.textContent = 'Prova di nuovo';
      tryAgainBtn.style.backgroundColor = '#007aff';
      tryAgainBtn.style.color = 'white';
      tryAgainBtn.style.border = 'none';
      tryAgainBtn.style.padding = '8px 15px';
      tryAgainBtn.style.borderRadius = '4px';
      tryAgainBtn.style.cursor = 'pointer';
      
      // Overlay di sfondo
      const overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      overlay.style.zIndex = '10000';
      
      // Eventi
      cancelBtn.onclick = () => {
        document.body.removeChild(overlay);
        document.body.removeChild(dialog);
      };
      
      tryAgainBtn.onclick = () => {
        // Recupera la lingua selezionata
        const selectElement = document.getElementById('language-select');
        if (selectElement) {
          currentLanguage = selectElement.value;
          logDebug(`Lingua cambiata in: ${currentLanguage}`);
        }
        
        document.body.removeChild(overlay);
        document.body.removeChild(dialog);
        
        // Avvia un nuovo test
        testSpeechRecognitionRequirements().then(result => {
          if (result) {
            startRecording();
          }
        });
      };
      
      // Assembla la finestra di dialogo
      buttons.appendChild(cancelBtn);
      buttons.appendChild(tryAgainBtn);
      
      dialog.appendChild(title);
      dialog.appendChild(content);
      dialog.appendChild(buttons);
      
      // Aggiungi al DOM
      document.body.appendChild(overlay);
      document.body.appendChild(dialog);
    }

    // Inizializza il riconoscimento vocale
    function initSpeechRecognition() {
      try {
        console.log('Inizializzazione del riconoscimento vocale...');
        
        // Controllo specifico per l'ambiente Electron
        const isElectronEnv = window.electron !== undefined;
        console.log('Ambiente Electron rilevato:', isElectronEnv);
        
        // Controlla che il browser supporti l'API
        window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        // Log dell'oggetto SpeechRecognition disponibile
        console.log('SpeechRecognition API disponibile:', !!window.SpeechRecognition);
        
        if (!window.SpeechRecognition) {
          console.error('API di riconoscimento vocale non supportate dal browser');
          logDebug('API di riconoscimento vocale non supportate, passaggio alla modalità offline');
          
          // Se siamo in Electron e l'API non è supportata, proviamo ad attivare la modalità demo
          if (isElectronEnv) {
            console.log('In ambiente Electron: attivazione modalità demo per simulare il riconoscimento vocale');
            if(confirm('Il riconoscimento vocale non è disponibile in questa versione di Electron. Vuoi attivare la modalità demo che simula il riconoscimento?')) {
              useDemoMode = true;
              return true;
            }
          }
          
          offlineMode = true;
          return false;
        }
        
        // Crea una nuova istanza di riconoscimento vocale
        try {
          // In alcuni casi l'istanza potrebbe già esistere, la resettiamo
          if (recognition) {
            try {
              console.log('Istanza di recognition già esistente, tentativo di reset...');
              recognition.abort();
              recognition.stop();
            } catch (e) {
              console.log('Errore nel reset della recognition:', e);
            }
          }
          
          recognition = new SpeechRecognition();
          console.log('Istanza SpeechRecognition creata:', !!recognition);
        } catch (err) {
          console.error('Errore nella creazione della SpeechRecognition:', err);
          
          // Se siamo in Electron e c'è un errore, proviamo ad attivare la modalità demo
          if (isElectronEnv) {
            console.log('Errore in ambiente Electron: attivazione modalità demo alternativa');
            if(confirm('Si è verificato un errore con il riconoscimento vocale. Vuoi attivare la modalità demo?')) {
              useDemoMode = true;
              return true;
            }
          }
          
          offlineMode = true;
          return false;
        }
        
        // Configurazione
        recognition.continuous = true;       // Continua ad ascoltare anche dopo i risultati
        recognition.interimResults = true;   // Mostra risultati temporanei
        recognition.lang = currentLanguage;  // Usa la lingua corrente
        recognition.maxAlternatives = 1;     // Numero di alternative per ciascun risultato
        
        // Gestione eventi
        recognition.onresult = handleRecognitionResult;
        recognition.onerror = handleRecognitionError;
        recognition.onend = handleRecognitionEnd;
        
        // Log delle proprietà configurate
        console.log('Configurazione riconoscimento vocale:', {
          continuous: recognition.continuous,
          interimResults: recognition.interimResults,
          lang: recognition.lang,
          maxAlternatives: recognition.maxAlternatives
        });
        
        // Timeout più lungo per migliorare problemi di rete
        recognition.timeout = 10000;  // 10 secondi di timeout (se supportato)
        
        logDebug('Inizializzazione riconoscimento vocale completata');
        logDebug(`Lingua corrente: ${recognition.lang}`);
        return true;
      } catch (error) {
        console.error('Errore nell\'inizializzazione del riconoscimento vocale:', error);
        logDebug(`Errore nell'inizializzazione: ${error.message}`);
        
        // Log dettagliato dell'errore
        console.error('Stack trace errore:', error.stack);
        
        // Se siamo in Electron e c'è un errore generico, proviamo la modalità demo
        const isElectronEnv = window.electron !== undefined;
        if (isElectronEnv) {
          console.log('Errore in ambiente Electron: proponiamo la modalità demo');
          if(confirm('Si è verificato un errore con il riconoscimento vocale. Vuoi attivare la modalità demo?')) {
            useDemoMode = true;
            return true;
          }
        }
        
        // Passa alla modalità offline
        offlineMode = true;
        return false;
      }
    }
    
    // Gestisci i risultati del riconoscimento vocale
    function handleRecognitionResult(event) {
      try {
        const results = event.results;
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < results.length; i++) {
          const transcript = results[i][0].transcript;
          
          if (results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Aggiorna il campo di input con il testo riconosciuto
        if (finalTranscript) {
          appendTranscriptToInput(finalTranscript, 'final');
          // Aggiorna il timestamp dell'ultima frase riconosciuta (per l'animazione delle onde)
          lastPhraseTime = Date.now();
          logDebug(`Testo finale rilevato: "${finalTranscript}"`);
        } else if (interimTranscript) {
          // Aggiorna solo il display con il testo temporaneo, non l'input
          updateTranscriptDisplay(interimTranscript, 'interim');
          logDebug(`Testo temporaneo: "${interimTranscript}"`);
        }
      } catch (error) {
        console.error('Errore nell\'elaborazione dei risultati del riconoscimento vocale:', error);
        logDebug(`Errore nell'elaborazione dei risultati: ${error.message}`);
      }
    }
    
    // Gestisci gli errori del riconoscimento vocale
    function handleRecognitionError(event) {
      const errorMessages = {
        'no-speech': 'Nessun audio rilevato',
        'audio-capture': 'Impossibile catturare l\'audio',
        'not-allowed': 'Permesso di utilizzo del microfono negato',
        'network': 'Errore di rete - Impossibile connettersi al servizio di riconoscimento vocale',
        'aborted': 'Riconoscimento vocale interrotto',
        'service-not-allowed': 'Servizio non consentito',
        'bad-grammar': 'Errore nella grammatica',
        'language-not-supported': 'Lingua non supportata'
      };
      
      const errorMessage = errorMessages[event.error] || `Errore sconosciuto: ${event.error}`;
      console.error(`Errore nel riconoscimento vocale: ${errorMessage}`);
      logDebug(`Errore: ${errorMessage}`);
      
      // Informazioni di debug avanzate
      if (event.error === 'network') {
        console.error('Dettagli errore di rete:', {
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          online: navigator.onLine,
          https: location.protocol === 'https:',
          hostname: location.hostname,
          currentLanguage: currentLanguage,
          eventDetails: event
        });
        
        logDebug(`Stato online: ${navigator.onLine ? 'Connesso' : 'Disconnesso'}`);
        logDebug(`Protocollo: ${location.protocol}`);
        logDebug(`Hostname: ${location.hostname}`);
        
        // Se abbiamo un errore di rete persistente, mostriamo la finestra di dialogo
        // per aiutare l'utente a risolvere il problema
        if (retryCount >= MAX_RETRY_ATTEMPTS - 1) {
          showPermissionsAndSettingsDialog();
          return;
        }
      }
      
      // In caso di errore, mostriamo il messaggio
      showToast(errorMessage, 'error');
      
      // Gestione errori specifici con tentativi di riconnessione
      if (event.error === 'network') {
        if (retryCount < MAX_RETRY_ATTEMPTS) {
          retryCount++;
          const retryDelay = retryCount * 1000; // Aumenta il ritardo ad ogni tentativo
          
          updateTranscriptDisplay(`Errore di rete. Tentativo di riconnessione ${retryCount}/${MAX_RETRY_ATTEMPTS} tra ${retryDelay/1000} secondi...`, 'warning');
          
          // Prova a riconnettersi dopo un ritardo
          setTimeout(() => {
            if (isRecording) {
              try {
                logDebug(`Tentativo di riconnessione ${retryCount}/${MAX_RETRY_ATTEMPTS}`);
                recognition.start();
                showToast(`Tentativo di riconnessione ${retryCount}/${MAX_RETRY_ATTEMPTS}`, 'info');
              } catch (error) {
                logDebug(`Errore nel tentativo di riconnessione: ${error.message}`);
                // Se l'ultimo tentativo fallisce, fermiamo
                if (retryCount >= MAX_RETRY_ATTEMPTS) {
                  updateTranscriptDisplay('Impossibile connettersi al servizio dopo ripetuti tentativi. Verifica la tua connessione e riprova.', 'error');
                  setTimeout(stopRecording, 2000);
                }
              }
            }
          }, retryDelay);
          
          return;
        } else {
          // Dopo tutti i tentativi, mostra un messaggio di errore e ferma
          updateTranscriptDisplay('Errore di rete persistente. Verifica la tua connessione internet e riprova più tardi.', 'error');
          // Reset del contatore di tentativi
          retryCount = 0;
        }
      } else if (['service-not-allowed', 'not-allowed', 'audio-capture'].includes(event.error)) {
        // Per altri errori critici, mostriamo un messaggio specifico
        logDebug('Errore critico nel riconoscimento vocale: ' + errorMessage);
        updateTranscriptDisplay(`Errore: ${errorMessage}. Per favore riprova o verifica le impostazioni del browser.`, 'error');
        
        // Mostriamo la finestra di dialogo con istruzioni dettagliate
        if (event.error === 'not-allowed') {
          showPermissionsAndSettingsDialog();
          return;
        }
      }
      
      // Dopo il massimo di tentativi o per errori diversi da quelli di rete, fermiamo 
      setTimeout(() => {
        stopRecording();
      }, 2000);
    }
    
    // Gestisci la fine del riconoscimento vocale
    function handleRecognitionEnd() {
      logDebug('Riconoscimento vocale terminato');
      
      // Se stiamo ancora registrando e non è attivo un processo di riconnessione,
      // riavviamo il riconoscimento vocale
      if (isRecording && retryCount === 0) {
        try {
          recognition.start();
          logDebug('Riavvio del riconoscimento vocale');
        } catch (error) {
          console.error('Errore nel riavvio del riconoscimento vocale:', error);
          logDebug(`Errore nel riavvio: ${error.message}`);
          
          // Mostriamo un errore e fermiamo
          updateTranscriptDisplay('Impossibile riavviare il riconoscimento vocale. Per favore riprova.', 'error');
          setTimeout(() => {
            stopRecording();
          }, 2000);
        }
      }
    }
    
    // Attiva/disattiva registrazione vocale
    function toggleVoiceRecognition() {
      if (isRecording) {
        stopRecording();
      } else {
        // Controlla se siamo in ambiente Electron
        const isElectronEnv = window.electron !== undefined;
        console.log('Ambiente Electron rilevato in toggleVoiceRecognition:', isElectronEnv);
        
        // In ambiente Electron, attiviamo direttamente la modalità demo
        if (isElectronEnv) {
          console.log('Attivazione automatica modalità demo in Electron');
          useDemoMode = true;
          startRecording();
          return;
        }
        
        // Altrimenti verifica i permessi del microfono
        checkMicrophonePermission().then(hasPermission => {
          if (!hasPermission) {
            // Richiedi esplicitamente il permesso
            requestMicrophonePermission().then(granted => {
              if (granted) {
                startRecording();
              } else {
                // Se l'utente rifiuta, offri la modalità demo
                if (confirm('Vuoi attivare la modalità demo che simula il riconoscimento vocale?')) {
                  useDemoMode = true;
                  startRecording();
                }
              }
            });
          } else {
            // Se abbiamo già il permesso, avvia la registrazione
            startRecording();
          }
        });
      }
    }
    
    // Avvia la registrazione
    async function startRecording() {
      try {
        console.log('Tentativo di avvio registrazione...');
        
        // Controllo specifico per l'ambiente Electron
        const isElectronEnv = window.electron !== undefined;
        console.log('Ambiente Electron rilevato:', isElectronEnv);
        
        // In Electron, attiviamo automaticamente la modalità demo
        // Poiché la Web Speech API ha problemi di compatibilità in Electron
        if (isElectronEnv) {
          console.log('Modalità demo attivata automaticamente in ambiente Electron');
          useDemoMode = true;
          showToast('Modalità demo attivata automaticamente in Electron', 'info');
          
          // Aggiorna l'interfaccia utente per mostrare che stiamo usando la modalità demo
          const demoToggle = document.getElementById('demo-mode');
          if (demoToggle) {
            demoToggle.checked = true;
            const toggleBg = demoToggle.nextElementSibling;
            if (toggleBg) {
              const toggleDot = toggleBg.querySelector('span');
              if (toggleDot) {
                toggleBg.style.backgroundColor = '#2196F3';
                toggleDot.style.transform = 'translateX(18px)';
              }
            }
          }
        }
        
        // Imposta lo stato di registrazione
        isRecording = true;
        voiceToTextBtn.classList.add('recording');
        recordingStartTime = Date.now();
        lastPhraseTime = Date.now();
        
        // Mostra widget onde sonore
        showAudioWaveWidget();
        
        // Pulisci eventuali messaggi di attesa nell'area di trascrizione
        const transcriptDisplay = audioWaveWidget.querySelector('.audio-wave-transcript');
        if (transcriptDisplay) {
          // Rimuove tutti i messaggi precedenti per iniziare con un'area pulita
          while (transcriptDisplay.firstChild) {
            transcriptDisplay.removeChild(transcriptDisplay.firstChild);
          }
          
          // Aggiungi un messaggio iniziale che indica l'inizio della registrazione
          const initialMessage = document.createElement('div');
          initialMessage.className = 'transcript-line';
          initialMessage.textContent = useDemoMode ? 'Modalità demo attiva: sto simulando il riconoscimento vocale...' : 'Sto ascoltando...';
          initialMessage.style.opacity = '0.8';
          initialMessage.style.fontStyle = 'italic';
          initialMessage.style.color = '#4fc3f7';
          initialMessage.style.marginTop = '10px';
          transcriptDisplay.appendChild(initialMessage);
        }
        
        // Se è attiva la modalità demo, avviala direttamente
        if (useDemoMode) {
          console.log('Avvio modalità demo...');
          startDemoMode();
          // Disegna le onde simulate
          drawSimulatedWaves();
          return;
        }
        
        // Altrimenti tenta il normale riconoscimento vocale
        // Verifichiamo che tutti i requisiti siano soddisfatti
        const requirementsOk = await testSpeechRecognitionRequirements();
        console.log('Requisiti per il riconoscimento vocale soddisfatti:', requirementsOk);
        
        if (!requirementsOk) {
          logDebug('Requisiti per il riconoscimento vocale non soddisfatti, passaggio a modalità demo');
          console.log('Requisiti non soddisfatti, attivazione automatica modalità demo');
          showToast('Modalità demo attivata per il riconoscimento vocale', 'info');
          useDemoMode = true;
          startDemoMode();
          drawSimulatedWaves();
          return;
        }
        
        // Avvia il microfono
        const micStarted = await startMicrophone();
        console.log('Microfono avviato:', micStarted);
        
        if (!micStarted) {
          showToast('Impossibile avviare il microfono, attivazione modalità demo', 'warning');
          useDemoMode = true;
          startDemoMode();
          drawSimulatedWaves();
          return;
        }
        
        // Verifica modalità offline o online
        if (offlineMode) {
          console.log('Avvio in modalità offline...');
          logDebug('Avvio registrazione in modalità offline');
          showToast('Riconoscimento vocale non disponibile. Modalità solo visualizzazione attiva.', 'warning');
          updateTranscriptDisplay('Modalità offline attiva. Solo visualizzazione dell\'audio senza trascrizione.', 'warning');
          
          // In modalità offline, utilizziamo l'analizzatore audio per visualizzare l'audio
          drawRealWaves(); // Usa le onde reali invece di quelle simulate
        } else {
          // Se il test di connettività è passato, procediamo
          if (!networkTestPassed) {
            updateTranscriptDisplay('Attenzione: Test di connettività non superato. Il riconoscimento vocale potrebbe non funzionare correttamente.', 'warning');
          }
          
          console.log('Tentativo di inizializzazione riconoscimento vocale...');
          
          // Prova ad avviare il riconoscimento vocale
          if (!recognition && !initSpeechRecognition()) {
            console.error('Inizializzazione del riconoscimento vocale fallita, passaggio alla modalità demo');
            useDemoMode = true;
            logDebug('Passaggio alla modalità demo dopo errore di inizializzazione');
            showToast('Problema con il servizio di riconoscimento vocale. Modalità demo attivata.', 'warning');
            startDemoMode();
            drawSimulatedWaves();
            return;
          } 
          
          console.log('Tentativo di avvio riconoscimento vocale...');
          try {
            recognition.start();
            console.log('Riconoscimento vocale avviato correttamente');
            logDebug('Riconoscimento vocale avviato');
            logDebug(`Lingua utilizzata: ${recognition.lang}`);
            showToast('Registrazione vocale avviata', 'success');
          } catch (error) {
            console.error('Errore nell\'avvio del riconoscimento vocale, passaggio alla modalità demo:', error);
            logDebug(`Errore nell'avvio: ${error.message}`);
            showToast(`Passaggio alla modalità demo di simulazione`, 'info');
            
            // Passa alla modalità demo
            useDemoMode = true;
            startDemoMode();
            drawSimulatedWaves();
            return;
          }
          
          // Inizia a disegnare le onde
          drawSimulatedWaves();
        }
      } catch (error) {
        console.error('Errore nell\'avvio della registrazione:', error);
        logDebug(`Errore nell'avvio della registrazione: ${error.message}`);
        showToast(`Attivazione modalità demo automatica`, 'info');
        
        // In caso di errore, passa comunque alla modalità demo
        useDemoMode = true;
        isRecording = true;
        voiceToTextBtn.classList.add('recording');
        showAudioWaveWidget();
        startDemoMode();
        drawSimulatedWaves();
      }
    }
    
    // Ferma la registrazione
    function stopRecording() {
      isRecording = false;
      voiceToTextBtn.classList.remove('recording');
      
      // Reset del contatore di tentativi
      retryCount = 0;
      
      // Ferma la modalità demo se attiva
      if (useDemoMode) {
        stopDemoMode();
      }
      
      // Ferma il microfono
      stopMicrophone();
      
      // Ferma il riconoscimento vocale se attivo
      if (recognition) {
        try {
          recognition.stop();
          logDebug('Riconoscimento vocale fermato');
        } catch (error) {
          console.error('Errore nell\'arresto del riconoscimento vocale:', error);
          logDebug(`Errore nell'arresto: ${error.message}`);
        }
      }
      
      // Nascondi widget
      if (audioWaveWidget && audioWaveWidget.style.display !== 'none') {
        audioWaveWidget.style.display = 'none';
      }
      
      // Ferma l'animazione delle onde
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      
      showToast('Registrazione vocale terminata', 'info');
    }
    
    // Aggiungi trascrizione all'input
    function appendTranscriptToInput(text, type) {
      if (!text || !userInput) return;
      
      try {
        // Aggiorna l'input con il nuovo testo rilevato
        userInput.value = text;
        
        // Focus sull'input e trigger l'evento input
        userInput.focus();
        userInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        // Auto resize
        autoResizeTextarea(userInput);
        
        // Aggiorna il testo visualizzato nel widget delle onde
        updateTranscriptDisplay(text, type);
        
        // Aggiorna il timestamp per l'animazione delle onde
        lastPhraseTime = Date.now();
        
        logDebug('Testo rilevato: ' + text);
      } catch (error) {
        console.error('Errore nell\'aggiunta del testo all\'input:', error);
        logDebug(`Errore nell'aggiunta del testo: ${error.message}`);
      }
    }
    
    // Aggiorna il display della trascrizione nel widget
    function updateTranscriptDisplay(text, type) {
      if (!audioWaveWidget) {
        logDebug('Widget non disponibile per mostrare il testo');
        return;
      }
      
      logDebug('Aggiornamento display trascrizione con testo: ' + text);
      
      const transcriptDisplay = audioWaveWidget.querySelector('.audio-wave-transcript');
      if (!transcriptDisplay) {
        logDebug('Elemento .audio-wave-transcript non trovato');
        return;
      }
      
      try {
        // Per i risultati temporanei, aggiorniamo solo l'ultima riga se è di tipo interim
        if (type === 'interim') {
          const lines = transcriptDisplay.querySelectorAll('.transcript-line');
          if (lines.length > 0) {
            const lastLine = lines[lines.length - 1];
            if (lastLine.dataset.type === 'interim') {
              lastLine.textContent = text;
              return;
            }
          }
        }
        
        // Aggiunge una nuova riga di testo con animazione di fade-in
        const textLine = document.createElement('div');
        textLine.className = 'transcript-line';
        textLine.textContent = text;
        textLine.dataset.type = type;
        textLine.style.opacity = '0';
        textLine.style.transform = 'translateY(20px)';
        textLine.style.transition = 'all 0.3s ease-out';
        textLine.style.marginBottom = '8px';
        textLine.style.padding = '4px 0';
        textLine.style.borderBottom = '1px dotted rgba(255,255,255,0.1)';
        
        // Stile in base al tipo di testo
        if (type === 'interim') {
          textLine.style.color = '#aaaaaa';
          textLine.style.fontStyle = 'italic';
        } else if (type === 'final') {
          textLine.style.color = '#ffffff';
          textLine.style.fontWeight = 'bold';
        } else if (type === 'error') {
          textLine.style.color = '#ff6b6b'; // Colore rosso per gli errori
          textLine.style.fontStyle = 'italic';
          textLine.style.fontWeight = 'normal';
        } else if (type === 'warning') {
          textLine.style.color = '#ffcc00'; // Colore giallo per gli avvisi
          textLine.style.fontStyle = 'italic';
          textLine.style.fontWeight = 'normal';
        } else {
          textLine.style.color = '#ffffff';
        }
        
        // Aggiungi la nuova riga 
        transcriptDisplay.appendChild(textLine);
        
        // Avvia l'animazione dopo un breve ritardo
        setTimeout(() => {
          textLine.style.opacity = '1';
          textLine.style.transform = 'translateY(0)';
        }, 10);
        
        // Limita a mostrare solo le ultime 4 frasi
        const lines = transcriptDisplay.querySelectorAll('.transcript-line');
        if (lines.length > 4) {
          // Fade-out per la linea più vecchia prima di rimuoverla
          const oldestLine = lines[0];
          oldestLine.style.opacity = '0';
          oldestLine.style.transform = 'translateY(-20px)';
          
          setTimeout(() => {
            if (oldestLine.parentNode) {
              oldestLine.parentNode.removeChild(oldestLine);
            }
          }, 300);
        }
        
        // Scroll verso il basso per mostrare il testo più recente
        transcriptDisplay.scrollTop = transcriptDisplay.scrollHeight;
        
        logDebug('Testo aggiunto al display della trascrizione');
      } catch (e) {
        console.error('Errore nell\'aggiornamento del display della trascrizione:', e);
        logDebug('Errore nell\'aggiornamento del display: ' + e.message);
      }
    }

    // =======================================
    // Widget di visualizzazione dell'audio
    // =======================================
    
    // Crea il widget delle onde sonore in stile macOS
    function createAudioWaveWidget() {
      // Se già esiste, restituisci l'istanza
      if (audioWaveWidget) return audioWaveWidget;
      
      // Creare il widget
      audioWaveWidget = document.createElement('div');
      audioWaveWidget.className = 'audio-wave-widget';
      audioWaveWidget.style.display = 'none'; // Inizialmente nascosto
      
      // Stili in-line per il widget (per evitare dipendenze CSS)
      audioWaveWidget.style.position = 'absolute';
      audioWaveWidget.style.top = '100px';
      audioWaveWidget.style.right = '20px';
      audioWaveWidget.style.width = '320px';
      audioWaveWidget.style.backgroundColor = '#1e1e1e';
      audioWaveWidget.style.borderRadius = '10px';
      audioWaveWidget.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.3)';
      audioWaveWidget.style.overflow = 'hidden';
      audioWaveWidget.style.zIndex = '9998';
      audioWaveWidget.style.opacity = '0.95';
      audioWaveWidget.style.transition = 'all 0.3s ease';
      audioWaveWidget.style.border = '1px solid #333';
      audioWaveWidget.style.transform = 'translateZ(0)';
      
      // Intestazione del widget con titolo e controlli
      const header = document.createElement('div');
      header.className = 'audio-wave-header';
      header.style.display = 'flex';
      header.style.justifyContent = 'space-between';
      header.style.alignItems = 'center';
      header.style.padding = '10px 15px';
      header.style.backgroundColor = '#252525';
      header.style.cursor = 'move';
      header.style.borderBottom = '1px solid #333';
      
      // Titolo
      const title = document.createElement('div');
      title.className = 'audio-wave-title';
      title.textContent = 'Registrazione Audio';
      title.style.fontSize = '14px';
      title.style.color = '#fff';
      title.style.fontWeight = '500';
      
      // Pulsanti di controllo
      const controls = document.createElement('div');
      controls.className = 'audio-wave-controls';
      controls.style.display = 'flex';
      controls.style.gap = '8px';
      
      // Pulsante impostazioni
      const settingsBtn = document.createElement('button');
      settingsBtn.className = 'audio-wave-btn settings-btn';
      settingsBtn.innerHTML = '<i class="fas fa-cog"></i>';
      settingsBtn.title = 'Impostazioni';
      settingsBtn.style.width = '24px';
      settingsBtn.style.height = '24px';
      settingsBtn.style.borderRadius = '50%';
      settingsBtn.style.backgroundColor = '#333';
      settingsBtn.style.border = 'none';
      settingsBtn.style.display = 'flex';
      settingsBtn.style.alignItems = 'center';
      settingsBtn.style.justifyContent = 'center';
      settingsBtn.style.cursor = 'pointer';
      settingsBtn.style.color = '#3498db';
      settingsBtn.style.transition = 'all 0.2s ease';
      settingsBtn.style.padding = '0';
      settingsBtn.style.outline = 'none';
      settingsBtn.onclick = showSettings;
      
      // Pulsante diagnostica
      const diagBtn = document.createElement('button');
      diagBtn.className = 'audio-wave-btn diag-btn';
      diagBtn.innerHTML = '<i class="fas fa-tools"></i>';
      diagBtn.title = 'Diagnostica';
      diagBtn.style.width = '24px';
      diagBtn.style.height = '24px';
      diagBtn.style.borderRadius = '50%';
      diagBtn.style.backgroundColor = '#333';
      diagBtn.style.border = 'none';
      diagBtn.style.display = 'flex';
      diagBtn.style.alignItems = 'center';
      diagBtn.style.justifyContent = 'center';
      diagBtn.style.cursor = 'pointer';
      diagBtn.style.color = '#e67e22';
      diagBtn.style.transition = 'all 0.2s ease';
      diagBtn.style.padding = '0';
      diagBtn.style.outline = 'none';
      diagBtn.onclick = showPermissionsAndSettingsDialog;
      
      // Pulsante chiudi
      const closeBtn = document.createElement('button');
      closeBtn.className = 'audio-wave-btn close-btn';
      closeBtn.innerHTML = '&times;';
      closeBtn.title = 'Chiudi';
      closeBtn.style.width = '24px';
      closeBtn.style.height = '24px';
      closeBtn.style.borderRadius = '50%';
      closeBtn.style.backgroundColor = '#333';
      closeBtn.style.border = 'none';
      closeBtn.style.display = 'flex';
      closeBtn.style.alignItems = 'center';
      closeBtn.style.justifyContent = 'center';
      closeBtn.style.cursor = 'pointer';
      closeBtn.style.color = '#e74c3c';
      closeBtn.style.transition = 'all 0.2s ease';
      closeBtn.style.padding = '0';
      closeBtn.style.outline = 'none';
      closeBtn.onclick = () => {
        audioWaveWidget.style.display = 'none';
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
      };
      
      // Aggiungi pulsanti ai controlli
      controls.appendChild(settingsBtn);
      controls.appendChild(diagBtn);
      controls.appendChild(closeBtn);
      
      // Aggiungi elementi all'header
      header.appendChild(title);
      header.appendChild(controls);
      
      // Canvas per la visualizzazione delle onde sonore
      const canvas = document.createElement('canvas');
      canvas.className = 'audio-wave-canvas';
      canvas.width = 320;
      canvas.height = 150;
      canvas.style.width = '100%';
      canvas.style.height = '150px';
      canvas.style.backgroundColor = '#111';
      canvas.style.display = 'block';
      canvas.style.margin = '0';
      canvas.style.padding = '0';
      canvas.style.position = 'relative';
      canvasContext = canvas.getContext('2d');
      
      // Area per mostrare il testo trascritto
      const transcriptArea = document.createElement('div');
      transcriptArea.className = 'audio-wave-transcript';
      transcriptArea.style.padding = '10px 15px';
      transcriptArea.style.backgroundColor = '#252525';
      transcriptArea.style.borderTop = '1px solid #333';
      transcriptArea.style.color = '#fff';
      transcriptArea.style.fontSize = '13px';
      transcriptArea.style.fontFamily = 'Arial, sans-serif';
      transcriptArea.style.maxHeight = '150px'; // Aumentato per mostrare più testo
      transcriptArea.style.minHeight = '100px'; // Aumentato per mostrare più testo
      transcriptArea.style.overflowY = 'auto';
      transcriptArea.style.lineHeight = '1.4';
      transcriptArea.style.transition = 'all 0.3s ease';
      
      // Stili personalizzati per lo scrollbar
      transcriptArea.style.scrollbarWidth = 'thin';
      transcriptArea.style.scrollbarColor = '#666 #252525';
      
      // Stili per il titolo della trascrizione
      const transcriptTitle = document.createElement('div');
      transcriptTitle.className = 'transcript-title';
      transcriptTitle.textContent = 'Testo Rilevato:';
      transcriptTitle.style.fontSize = '12px';
      transcriptTitle.style.fontWeight = 'bold';
      transcriptTitle.style.color = '#999';
      transcriptTitle.style.marginBottom = '8px';
      transcriptTitle.style.display = 'flex';
      transcriptTitle.style.alignItems = 'center';
      transcriptTitle.style.justifyContent = 'space-between';
      
      // Badge per indicare attività
      const activityBadge = document.createElement('span');
      activityBadge.className = 'activity-badge';
      activityBadge.textContent = 'Attivo';
      activityBadge.style.fontSize = '10px';
      activityBadge.style.backgroundColor = '#2ecc71';
      activityBadge.style.color = '#fff';
      activityBadge.style.padding = '2px 6px';
      activityBadge.style.borderRadius = '10px';
      activityBadge.style.fontWeight = 'normal';
      
      transcriptTitle.appendChild(activityBadge);
      transcriptArea.appendChild(transcriptTitle);
      
      // Aggiungi un messaggio iniziale per verificare che l'area del testo funzioni
      const initialMessage = document.createElement('div');
      initialMessage.className = 'transcript-line';
      initialMessage.textContent = 'In attesa della registrazione...';
      initialMessage.style.opacity = '0.5';
      initialMessage.style.fontStyle = 'italic';
      initialMessage.style.marginTop = '10px';
      transcriptArea.appendChild(initialMessage);
      
      // Contenitore delle impostazioni (inizialmente nascosto)
      const settings = document.createElement('div');
      settings.className = 'audio-wave-settings';
      settings.style.display = 'none';
      settings.style.padding = '10px 15px';
      settings.style.backgroundColor = '#252525';
      settings.style.borderTop = '1px solid #333';
      settings.style.borderBottom = '1px solid #333';
      
      // Aggiungi nuova sezione di impostazioni al widget
      addSettingsSection(settings);
      
      // Statistiche audio
      const stats = document.createElement('div');
      stats.className = 'audio-wave-stats';
      stats.style.display = 'flex';
      stats.style.justifyContent = 'space-between';
      stats.style.padding = '10px 15px';
      stats.style.backgroundColor = '#1a1a1a';
      stats.style.borderTop = '1px solid #333';
      
      stats.innerHTML = `
        <div class="stat-item" style="display: flex; align-items: center; font-size: 12px; color: #ccc;">
          <span class="stat-label" style="margin-right: 5px; font-weight: 500;">Livello:</span>
          <span class="stat-value" id="audio-level" style="font-family: monospace; color: #3498db; font-weight: bold;">0%</span>
        </div>
        <div class="stat-item" style="display: flex; align-items: center; font-size: 12px; color: #ccc;">
          <span class="stat-label" style="margin-right: 5px; font-weight: 500;">Durata:</span>
          <span class="stat-value" id="recording-duration" style="font-family: monospace; color: #3498db; font-weight: bold;">00:00</span>
        </div>
      `;
      
      // Evento per rendere il widget draggable
      header.addEventListener('mousedown', initDrag);
      
      // Aggiungi tutti gli elementi al widget
      audioWaveWidget.appendChild(header);
      audioWaveWidget.appendChild(canvas);
      audioWaveWidget.appendChild(settings);
      audioWaveWidget.appendChild(transcriptArea);
      audioWaveWidget.appendChild(stats);
      
      // Aggiungi il widget al body
      document.body.appendChild(audioWaveWidget);
      
      // Aggiungi gli event listener per le impostazioni
      const waveColor = document.getElementById('wave-color');
      if (waveColor) {
        waveColor.addEventListener('change', (e) => {
          // L'aggiornamento avviene automaticamente attraverso getWaveColor()
        });
      }
      
      // Funzione per rendere il widget draggable
      let offsetX, offsetY, isDragging = false;
      
      function initDrag(e) {
        offsetX = e.clientX - audioWaveWidget.getBoundingClientRect().left;
        offsetY = e.clientY - audioWaveWidget.getBoundingClientRect().top;
        isDragging = true;
        
        document.addEventListener('mousemove', doDrag);
        document.addEventListener('mouseup', stopDrag);
      }
      
      function doDrag(e) {
        if (!isDragging) return;
        
        audioWaveWidget.style.left = (e.clientX - offsetX) + 'px';
        audioWaveWidget.style.top = (e.clientY - offsetY) + 'px';
        
        // Imposta right e bottom a 'auto' per evitare conflitti
        audioWaveWidget.style.right = 'auto';
        audioWaveWidget.style.bottom = 'auto';
      }
      
      function stopDrag() {
        isDragging = false;
        document.removeEventListener('mousemove', doDrag);
        document.removeEventListener('mouseup', stopDrag);
      }
      
      logDebug('Widget delle onde sonore creato');
      return audioWaveWidget;
    }
    
    // Mostra o nasconde il pannello impostazioni
    function showSettings() {
      if (!audioWaveWidget) return;
      
      const settings = audioWaveWidget.querySelector('.audio-wave-settings');
      if (settings) {
        settings.style.display = settings.style.display === 'none' ? 'block' : 'none';
      }
    }
    
    // Mostra il widget delle onde sonore
    function showAudioWaveWidget() {
      if (!audioWaveWidget) {
        createAudioWaveWidget();
      }
      
      // Posiziona il widget se è la prima volta
      if (audioWaveWidget.style.left === '') {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        audioWaveWidget.style.left = (viewportWidth - 350) + 'px';
        audioWaveWidget.style.top = '100px';
      }
      
      audioWaveWidget.style.display = 'block';
      
      // Inizia a disegnare le onde simulate
      drawSimulatedWaves();
      
      logDebug('Widget delle onde sonore mostrato');
    }
    
    // Disegna onde simulate con miglioramenti basati sul pattern di parlato
    function drawSimulatedWaves() {
      if (!audioWaveWidget || !isRecording) return;
      if (!canvasContext) return;
      
      const canvas = canvasContext.canvas;
      const width = canvas.width;
      const height = canvas.height;
      
      // Pulisci il canvas
      canvasContext.clearRect(0, 0, width, height);
      
      // Imposta i colori dell'onda in base alle impostazioni
      const waveColor = getWaveColor();
      
      // Calcola il tempo trascorso dall'inizio della registrazione
      const elapsedTime = Date.now() - recordingStartTime;
      const timeSinceLastPhrase = Date.now() - lastPhraseTime;
      
      // Parametri dell'onda
      const maxAmplitude = height / 2 - 10;
      const midY = height / 2;
      const numWaves = 3; // Numero di onde sovrapposte
      
      // Fase iniziale e velocità variabile basata sul tempo trascorso
      const phase = elapsedTime * 0.003;
      
      // Simuliamo l'attività vocale in modalità demo
      // Quando si "rileva" una frase, l'ampiezza aumenta
      let amplitudeMultiplier = 0.2; // Ampiezza di base (silenzio relativo)
      
      // In modalità demo, simuliamo l'attività vocale
      if (useDemoMode) {
        // Creiamo pattern ciclici di "parlato" e "silenzio"
        const cycleDuration = 7000; // 7 secondi per ciclo completo
        const cyclePosition = (elapsedTime % cycleDuration) / cycleDuration;
        
        // Il parlato avviene nella prima metà del ciclo
        if (cyclePosition < 0.6) {
          // Simuliamo un pattern naturale di parlato con variazioni
          const speechPattern = Math.sin(cyclePosition * Math.PI * 5) * 0.5 + 0.5;
          amplitudeMultiplier = 0.3 + (speechPattern * 0.7);
          
          // Aggiungiamo una piccola variazione casuale per renderlo più naturale
          amplitudeMultiplier *= (0.9 + (Math.random() * 0.2));
        } else {
          // Periodo di "silenzio" relativo
          amplitudeMultiplier = 0.2 + (Math.random() * 0.1);
        }
      } else {
        // Comportamento normale basato sul tempo trascorso dall'ultima frase
        amplitudeMultiplier = Math.max(0.2, Math.min(1, 1 - (timeSinceLastPhrase / 3000)));
      }
      
      // Aggiorna il livello audio visualizzato
      const audioLevel = Math.floor(amplitudeMultiplier * 100);
      const audioLevelEl = document.getElementById('audio-level');
      if (audioLevelEl) {
        audioLevelEl.textContent = audioLevel + '%';
        audioLevelEl.style.color = audioLevel > 70 ? '#e74c3c' : 
                                  audioLevel > 40 ? '#f39c12' : '#3498db';
      }
      
      // Aggiorna il tempo trascorso
      updateRecordingTime(elapsedTime);
      
      // Disegna le onde
      for (let w = 0; w < numWaves; w++) {
        const waveOpacity = 1 - (w * 0.2); // Onde successive hanno opacità inferiore
        
        canvasContext.beginPath();
        canvasContext.moveTo(0, midY);
        
        // Crea frequenze e periodi diverse per ogni onda
        const frequency = [0.02, 0.03, 0.015][w]; 
        const period = [7, 11, 17][w]; 
        
        for (let x = 0; x < width; x++) {
          // Crea onde composite combinando seni con diverse frequenze e fasi
          const normalizedX = x / width;
          
          // Fattore tempo per simulare il movimento dell'onda
          const timeFactor = Math.sin(phase * period + normalizedX * Math.PI * 2 * 3);
          
          // Aggiungi una variazione basata sulla posizione x per dare varietà
          const xVariation = Math.sin(normalizedX * Math.PI * frequency * 50);
          
          // Calcola l'altezza dell'onda in questo punto
          const waveHeight = timeFactor * amplitudeMultiplier * maxAmplitude * (1 - Math.pow(Math.abs(normalizedX - 0.5) * 1.8, 2));
          
          // Aggiungi un po' di rumore per rendere l'onda più naturale
          const noise = Math.random() * 4 - 2;
          
          // Calcola la posizione y dell'onda
          const y = midY + waveHeight + (xVariation * 5) + noise;
          
          canvasContext.lineTo(x, y);
        }
        
        canvasContext.lineTo(width, midY);
        canvasContext.closePath();
        
        // Imposta il colore dell'onda con gradiente
        const gradient = canvasContext.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, waveColor.top);
        gradient.addColorStop(1, waveColor.bottom);
        
        canvasContext.fillStyle = gradient;
        canvasContext.globalAlpha = waveOpacity;
        canvasContext.fill();
      }
      
      // Reimposta l'opacità globale
      canvasContext.globalAlpha = 1;
      
      // Aggiungi la linea centrale per riferimento
      canvasContext.beginPath();
      canvasContext.moveTo(0, midY);
      canvasContext.lineTo(width, midY);
      canvasContext.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      canvasContext.stroke();
      
      // Continua l'animazione
      animationFrameId = requestAnimationFrame(drawSimulatedWaves);
    }
    
    // Ottieni il colore dell'onda in base alle impostazioni
    function getWaveColor() {
      const waveColorEl = document.getElementById('wave-color');
      
      // Colori predefiniti e varianti
      const colorSchemes = {
        default: { top: 'rgba(52, 152, 219, 0.8)', bottom: 'rgba(41, 128, 185, 0.4)' },
        green: { top: 'rgba(46, 204, 113, 0.8)', bottom: 'rgba(39, 174, 96, 0.4)' },
        red: { top: 'rgba(231, 76, 60, 0.8)', bottom: 'rgba(192, 57, 43, 0.4)' },
        purple: { top: 'rgba(155, 89, 182, 0.8)', bottom: 'rgba(142, 68, 173, 0.4)' },
        orange: { top: 'rgba(230, 126, 34, 0.8)', bottom: 'rgba(211, 84, 0, 0.4)' },
      };
      
      if (waveColorEl && colorSchemes[waveColorEl.value]) {
        return colorSchemes[waveColorEl.value];
      }
      
      // Ritorna il colore predefinito
      return colorSchemes.default;
    }
    
    // Aggiorna la durata della registrazione
    function updateRecordingDuration() {
      if (!isRecording) {
        recordingStartTime = 0;
        return;
      }
      
      if (recordingStartTime === 0) {
        recordingStartTime = Date.now();
      }
      
      const currentTime = Date.now();
      const elapsedSeconds = Math.floor((currentTime - recordingStartTime) / 1000);
      const minutes = Math.floor(elapsedSeconds / 60);
      const seconds = elapsedSeconds % 60;
      
      const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
      const durationElement = document.getElementById('recording-duration');
      if (durationElement) {
        durationElement.textContent = formattedTime;
      }
    }
    
    // Aggiorna il tempo di registrazione visualizzato
    function updateRecordingTime(elapsedTimeMs) {
      // Calcola minuti e secondi
      const totalSeconds = Math.floor(elapsedTimeMs / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      
      // Formatta il tempo (00:00)
      const formattedTime = 
        (minutes < 10 ? '0' + minutes : minutes) + ':' + 
        (seconds < 10 ? '0' + seconds : seconds);
      
      // Aggiorna l'elemento nella UI
      const durationElement = document.getElementById('recording-duration');
      if (durationElement) {
        durationElement.textContent = formattedTime;
      }
    }
    
    // Helper per mostrare toast
    function showToast(message, type = 'info') {
      console.log(`[Toast] ${type}: ${message}`);
      
      // Controlla se esiste un container per i toast
      let toastContainer = document.getElementById('toastContainer');
      
      if (!toastContainer) {
        // Crea il container se non esiste
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.style.position = 'fixed';
        toastContainer.style.bottom = '20px';
        toastContainer.style.right = '20px';
        toastContainer.style.zIndex = '10000';
        document.body.appendChild(toastContainer);
      }
      
      // Crea il toast
      const toast = document.createElement('div');
      toast.className = `toast ${type}`;
      toast.style.backgroundColor = type === 'error' ? '#ff3b30' : 
                                   type === 'success' ? '#34c759' : 
                                   type === 'warning' ? '#ffcc00' : '#007aff';
      toast.style.color = 'white';
      toast.style.padding = '12px 15px';
      toast.style.borderRadius = '6px';
      toast.style.marginBottom = '10px';
      toast.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.2)';
      toast.style.display = 'flex';
      toast.style.justifyContent = 'space-between';
      toast.style.alignItems = 'center';
      toast.style.minWidth = '250px';
      toast.style.maxWidth = '350px';
      
      // Contenuto del toast
      const content = document.createElement('div');
      content.style.flex = '1';
      content.textContent = message;
      
      // Pulsante chiudi
      const closeBtn = document.createElement('div');
      closeBtn.innerHTML = '&times;';
      closeBtn.style.marginLeft = '10px';
      closeBtn.style.cursor = 'pointer';
      closeBtn.style.fontSize = '18px';
      closeBtn.onclick = () => {
        toastContainer.removeChild(toast);
      };
      
      toast.appendChild(content);
      toast.appendChild(closeBtn);
      toastContainer.appendChild(toast);
      
      // Rimuovi automaticamente dopo 5 secondi
      setTimeout(() => {
        if (toast.parentNode) {
          toastContainer.removeChild(toast);
        }
      }, 5000);
    }
    
    // Helper per auto resize textarea
    function autoResizeTextarea(textarea) {
      if (!textarea) return;
      
      // Reset height e imposta altezza in base al contenuto
      textarea.style.height = 'auto';
      textarea.style.height = (textarea.scrollHeight) + 'px';
    }
    
    // Aggiungi nuova sezione di impostazioni al widget
    function addSettingsSection(settings) {
      // Opzioni per il colore delle onde
      const colorSelector = document.createElement('div');
      colorSelector.className = 'setting-item';
      colorSelector.style.marginBottom = '8px';
      colorSelector.style.display = 'flex';
      colorSelector.style.alignItems = 'center';
      colorSelector.style.justifyContent = 'space-between';
      colorSelector.innerHTML = `
        <label for="wave-color" style="font-size: 12px; color: #ccc; margin-right: 10px;">Colore onde:</label>
        <select id="wave-color" style="background-color: #333; border: 1px solid #444; color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 12px; outline: none; flex: 1; min-width: 100px;">
          <option value="default" selected>Blu</option>
          <option value="green">Verde</option>
          <option value="red">Rosso</option>
          <option value="purple">Viola</option>
          <option value="orange">Arancione</option>
        </select>
      `;
      
      // Selettore di microfono
      const micSelector = document.createElement('div');
      micSelector.className = 'setting-item';
      micSelector.style.marginBottom = '12px';
      micSelector.style.display = 'flex';
      micSelector.style.alignItems = 'center';
      micSelector.style.justifyContent = 'space-between';
      
      // Crea il selettore di microfono
      micSelector.innerHTML = `
        <label for="microphone-select" style="font-size: 12px; color: #ccc; margin-right: 10px;">Microfono:</label>
        <select id="microphone-select" style="background-color: #333; border: 1px solid #444; color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 12px; outline: none; flex: 1; min-width: 100px;">
          <option value="default">Seleziona microfono...</option>
        </select>
      `;
      
      // Checkbox per attivare/disattivare la modalità demo
      const demoModeToggle = document.createElement('div');
      demoModeToggle.className = 'setting-item';
      demoModeToggle.style.marginBottom = '8px';
      demoModeToggle.style.display = 'flex';
      demoModeToggle.style.alignItems = 'center';
      demoModeToggle.style.justifyContent = 'space-between';
      
      demoModeToggle.innerHTML = `
        <label for="demo-mode" style="font-size: 12px; color: #ccc; margin-right: 10px;">Modalità demo:</label>
        <div style="position: relative; display: inline-block; width: 36px; height: 18px;">
          <input type="checkbox" id="demo-mode" style="opacity: 0; width: 0; height: 0;">
          <span style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; border-radius: 18px;">
            <span style="position: absolute; content: ''; height: 14px; width: 14px; left: 2px; bottom: 2px; background-color: white; transition: .4s; border-radius: 50%;"></span>
          </span>
        </div>
      `;
      
      // Checkbox per attivare/disattivare la modalità offline
      const offlineModeToggle = document.createElement('div');
      offlineModeToggle.className = 'setting-item';
      offlineModeToggle.style.marginBottom = '12px';
      offlineModeToggle.style.display = 'flex';
      offlineModeToggle.style.alignItems = 'center';
      offlineModeToggle.style.justifyContent = 'space-between';
      
      offlineModeToggle.innerHTML = `
        <label for="offline-mode" style="font-size: 12px; color: #ccc; margin-right: 10px;">Modalità offline:</label>
        <div style="position: relative; display: inline-block; width: 36px; height: 18px;">
          <input type="checkbox" id="offline-mode" style="opacity: 0; width: 0; height: 0;">
          <span style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; border-radius: 18px;">
            <span style="position: absolute; content: ''; height: 14px; width: 14px; left: 2px; bottom: 2px; background-color: white; transition: .4s; border-radius: 50%;"></span>
          </span>
        </div>
      `;
      
      // Aggiungi selettore lingua al pannello impostazioni
      const languageSelector = document.createElement('div');
      languageSelector.className = 'setting-item';
      languageSelector.style.marginBottom = '8px';
      languageSelector.style.display = 'flex';
      languageSelector.style.alignItems = 'center';
      languageSelector.style.justifyContent = 'space-between';
      
      // Creazione HTML per il selettore lingua
      languageSelector.innerHTML = `
        <label for="speech-language" style="font-size: 12px; color: #ccc; margin-right: 10px;">Lingua:</label>
        <select id="speech-language" style="background-color: #333; border: 1px solid #444; color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 12px; outline: none; flex: 1; min-width: 100px;">
          ${AVAILABLE_LANGUAGES.map(lang => 
            `<option value="${lang.code}" ${lang.code === currentLanguage ? 'selected' : ''}>${lang.name}</option>`
          ).join('')}
        </select>
      `;
      
      // Aggiungi pulsante per diagnostica e risoluzione problemi
      const troubleshootBtn = document.createElement('div');
      troubleshootBtn.className = 'setting-item';
      troubleshootBtn.style.marginTop = '15px';
      troubleshootBtn.style.display = 'flex';
      troubleshootBtn.style.justifyContent = 'center';
      
      troubleshootBtn.innerHTML = `
        <button id="troubleshoot-btn" style="width: 100%; padding: 6px 12px; background-color: #666; border: none; border-radius: 4px; color: white; cursor: pointer; font-size: 12px;">
          <i class="fas fa-tools" style="margin-right: 5px;"></i> Diagnostica e risoluzione problemi
        </button>
      `;
      
      // Pulsante per aggiornare l'elenco dei microfoni
      const refreshMicsBtn = document.createElement('div');
      refreshMicsBtn.className = 'setting-item';
      refreshMicsBtn.style.marginTop = '8px';
      refreshMicsBtn.style.display = 'flex';
      refreshMicsBtn.style.justifyContent = 'center';
      
      refreshMicsBtn.innerHTML = `
        <button id="refresh-mics-btn" style="width: 100%; padding: 6px 12px; background-color: #555; border: none; border-radius: 4px; color: white; cursor: pointer; font-size: 12px;">
          <i class="fas fa-sync" style="margin-right: 5px;"></i> Aggiorna elenco microfoni
        </button>
      `;
      
      // Aggiungi le opzioni alle impostazioni
      settings.appendChild(colorSelector);
      settings.appendChild(micSelector);
      settings.appendChild(demoModeToggle);
      settings.appendChild(offlineModeToggle);
      settings.appendChild(languageSelector);
      settings.appendChild(refreshMicsBtn);
      settings.appendChild(troubleshootBtn);
      
      // Funzione per aggiornare il selettore di microfono
      async function updateMicrophoneList() {
        await getAvailableMicrophones();
        
        const micSelect = document.getElementById('microphone-select');
        if (micSelect) {
          // Rimuovi tutte le opzioni esistenti tranne la prima
          while (micSelect.options.length > 1) {
            micSelect.remove(1);
          }
          
          // Aggiungi i microfoni disponibili
          availableMicrophones.forEach((mic, index) => {
            const option = document.createElement('option');
            option.value = mic.deviceId;
            option.text = mic.label || `Microfono ${index + 1}`;
            option.selected = mic.deviceId === selectedMicrophoneId;
            micSelect.appendChild(option);
          });
        }
      }
      
      // Chiama la funzione per aggiornare l'elenco dei microfoni
      setTimeout(updateMicrophoneList, 500);
      
      // Aggiungi event listener per il selettore di microfono
      const micSelect = document.getElementById('microphone-select');
      if (micSelect) {
        micSelect.addEventListener('change', (e) => {
          selectedMicrophoneId = e.target.value;
          logDebug(`Microfono cambiato: ${e.target.options[e.target.selectedIndex].text}`);
          
          // Se la registrazione è attiva, ferma e riavvia con il nuovo microfono
          if (isRecording) {
            stopMicrophone();
            startMicrophone().then(success => {
              if (success) {
                showToast(`Microfono cambiato: ${e.target.options[e.target.selectedIndex].text}`, 'info');
              } else {
                showToast('Impossibile attivare il microfono selezionato', 'error');
              }
            });
          }
        });
      }
      
      // Aggiungi event listener per il pulsante di aggiornamento microfoni
      const refreshBtn = document.getElementById('refresh-mics-btn');
      if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
          updateMicrophoneList().then(() => {
            showToast('Elenco microfoni aggiornato', 'info');
          });
        });
      }
      
      // Aggiungi event listener per la modalità demo
      const demoToggle = document.getElementById('demo-mode');
      if (demoToggle) {
        // Aggiorna lo stato iniziale
        demoToggle.checked = useDemoMode;
        
        // Aggiorna lo stile visivo in base allo stato
        updateToggleStyle(demoToggle);
        
        demoToggle.addEventListener('change', (e) => {
          useDemoMode = e.target.checked;
          logDebug(`Modalità demo: ${useDemoMode ? 'attivata' : 'disattivata'}`);
          
          // Aggiorna lo stile visivo
          updateToggleStyle(demoToggle);
          
          // Mostra un toast
          showToast(`Modalità demo ${useDemoMode ? 'attivata' : 'disattivata'}`, 'info');
          
          // Se la registrazione è attiva, ferma e riavvia
          if (isRecording) {
            stopRecording();
            
            // Riavvia la registrazione dopo un breve ritardo
            setTimeout(() => {
              startRecording();
            }, 500);
          }
        });
      }
      
      // Aggiungi event listener per la modalità offline
      const offlineToggle = document.getElementById('offline-mode');
      if (offlineToggle) {
        // Aggiorna lo stato iniziale
        offlineToggle.checked = offlineMode;
        
        // Aggiorna lo stile visivo in base allo stato
        updateToggleStyle(offlineToggle);
        
        offlineToggle.addEventListener('change', (e) => {
          offlineMode = e.target.checked;
          logDebug(`Modalità offline: ${offlineMode ? 'attivata' : 'disattivata'}`);
          
          // Aggiorna lo stile visivo
          updateToggleStyle(offlineToggle);
          
          // Mostra un toast
          showToast(`Modalità offline ${offlineMode ? 'attivata' : 'disattivata'}`, 'info');
          
          // Se la registrazione è attiva, ferma e riavvia
          if (isRecording) {
            stopRecording();
            
            // Riavvia la registrazione dopo un breve ritardo
            setTimeout(() => {
              startRecording();
            }, 500);
          }
        });
      }
      
      // Funzione per aggiornare lo stile del toggle switch
      function updateToggleStyle(toggleEl) {
        const toggleBg = toggleEl.nextElementSibling;
        const toggleDot = toggleBg.querySelector('span');
        
        if (toggleEl.checked) {
          toggleBg.style.backgroundColor = '#2196F3';
          toggleDot.style.transform = 'translateX(18px)';
        } else {
          toggleBg.style.backgroundColor = '#ccc';
          toggleDot.style.transform = 'translateX(0)';
        }
      }
      
      // Aggiungi event listener per il cambio lingua
      const languageSelect = document.getElementById('speech-language');
      if (languageSelect) {
        languageSelect.addEventListener('change', (e) => {
          currentLanguage = e.target.value;
          logDebug(`Lingua cambiata in: ${currentLanguage}`);
          
          // Se il riconoscimento è attivo, ferma e riavvia con la nuova lingua
          if (isRecording && recognition) {
            try {
              recognition.stop();
              
              // Ricreiamo l'istanza con la nuova lingua
              recognition = null;
              if (initSpeechRecognition()) {
                setTimeout(() => {
                  try {
                    recognition.start();
                    showToast(`Lingua cambiata in: ${
                      AVAILABLE_LANGUAGES.find(l => l.code === currentLanguage)?.name || currentLanguage
                    }`, 'info');
                  } catch (error) {
                    logDebug(`Errore nel riavvio dopo cambio lingua: ${error.message}`);
                  }
                }, 500);
              }
            } catch (error) {
              logDebug(`Errore nel cambio lingua: ${error.message}`);
            }
          }
        });
      }
      
      // Aggiungi event listener per il pulsante di risoluzione problemi
      const troubleshootButton = document.getElementById('troubleshoot-btn');
      if (troubleshootButton) {
        troubleshootButton.addEventListener('click', () => {
          showPermissionsAndSettingsDialog();
        });
      }
    }
    
    // Disegna onde audio reali usando l'analizzatore audio
    function drawRealWaves() {
      if (!audioAnalyser || !isRecording) {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
        return;
      }
      
      // Ottieni i dati audio dall'analizzatore
      processAudioOffline();
      
      // Disegna le onde
      drawSimulatedWaves();
      
      // Richiama la funzione ricorsivamente
      animationFrameId = requestAnimationFrame(drawRealWaves);
    }

    // Event listeners
    if (voiceToTextBtn) {
      voiceToTextBtn.addEventListener('click', (e) => {
        try {
          toggleVoiceRecognition();
        } catch (error) {
          console.error('Errore durante la gestione del click sul microfono:', error);
          showToast(`Errore con il microfono: ${error.message}`, 'error');
          isRecording = false;
          voiceToTextBtn.classList.remove('recording');
          if (audioWaveWidget && audioWaveWidget.style.display !== 'none') {
            audioWaveWidget.style.display = 'none';
          }
        }
      });
      
      // Keyboard shortcut (Ctrl+Alt+M)
      document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.altKey && e.key === 'm') {
          try {
            toggleVoiceRecognition();
          } catch (error) {
            console.error('Errore durante la gestione della scorciatoia da tastiera:', error);
            showToast(`Errore con il microfono: ${error.message}`, 'error');
            isRecording = false;
            voiceToTextBtn.classList.remove('recording');
            if (audioWaveWidget && audioWaveWidget.style.display !== 'none') {
              audioWaveWidget.style.display = 'none';
            }
          }
        }
      });
    }
    
    // Avvia la modalità demo che simula il riconoscimento vocale
    function startDemoMode() {
      if (demoTimerId) {
        clearInterval(demoTimerId);
      }
      
      // Imposta il flag della modalità demo
      useDemoMode = true;
      
      // Mostra un messaggio informativo
      showToast('Modalità demo attivata. Verrà simulato il riconoscimento vocale.', 'info');
      updateTranscriptDisplay('Modalità demo: simulazione del riconoscimento vocale attiva', 'info');
      
      // Simula il feedback iniziale dell'assistente
      const initialSequence = [
        { text: "Avvio riconoscimento vocale...", delay: 500 },
        { text: "Microfono attivo e funzionante", delay: 1000 },
        { text: "Sto ascoltando... (modalità demo)", delay: 1000 }
      ];
      
      // Riproduci la sequenza iniziale
      let currentIndex = 0;
      const sequenceTimer = setInterval(() => {
        if (currentIndex < initialSequence.length) {
          updateTranscriptDisplay(initialSequence[currentIndex].text, 'system');
          currentIndex++;
        } else {
          clearInterval(sequenceTimer);
          startDemoSequence();
        }
      }, 1000);
      
      function startDemoSequence() {
        // Genera frasi casuali a intervalli regolari
        let demoTexts = [];
        
        // Aggiungiamo frasi per simulare comandi di Synapse
        const synapseCommands = [
          "Crea una nuova nota sulla riunione di oggi",
          "Aggiungi 'completare il report' alla mia lista di attività",
          "Mostrami i miei ultimi progetti",
          "Apri il flusso di lavoro per la gestione documenti",
          "Cerca email recenti da Mario Rossi",
          "Crea un promemoria per la chiamata di domani",
          "Quali sono le mie attività in scadenza questa settimana?",
          "Inizia una nuova conversazione con l'assistente AI",
          "Dimmi cosa posso fare con Synapse",
          "Aiutami a creare un nuovo flusso di lavoro per approvazioni documenti"
        ];
        
        // Aggiungiamo frasi per la dettatura di testo generale
        const generalDictation = [
          "Il progetto dovrebbe essere completato entro la fine del mese",
          "Ricordati di aggiornare il team sui progressi recenti",
          "La riunione è fissata per martedì alle 15:00",
          "Dovremmo considerare di aggiungere nuove funzionalità al software",
          "È importante mantenere aggiornata la documentazione",
          "L'intelligenza artificiale sta trasformando il modo in cui lavoriamo",
          "Synapse offre molte possibilità per automatizzare il flusso di lavoro",
          "Il riconoscimento vocale migliora la produttività quotidiana",
          "Le notifiche dovrebbero essere configurate per le email importanti",
          "La sincronizzazione tra dispositivi è fondamentale per il lavoro moderno"
        ];
        
        // Unisci le frasi
        demoTexts = [...synapseCommands, ...generalDictation];
        
        // Mischiamo l'array per avere frasi in ordine casuale
        demoTexts = demoTexts.sort(() => Math.random() - 0.5);
        
        let currentText = "";
        let currentIndex = 0;
        
        // Funzione per mostrare la prossima frase
        function showNextPhrase() {
          if (!isRecording || !useDemoMode) {
            clearInterval(demoTimerId);
            return;
          }
          
          // Prendi la prossima frase
          const nextPhrase = demoTexts[currentIndex];
          currentIndex = (currentIndex + 1) % demoTexts.length; // Ciclico
          
          // Mostra prima come risultato parziale
          updateTranscriptDisplay(nextPhrase, 'interim');
          
          // Dopo un breve ritardo, mostrala come risultato finale
          setTimeout(() => {
            if (isRecording && useDemoMode) {
              // Aggiorna il testo dell'input
              appendTranscriptToInput(nextPhrase, 'final');
              
              // Aggiorna il timestamp dell'ultima frase per l'animazione delle onde
              lastPhraseTime = Date.now();
            }
          }, 1500); // Attendi 1.5 secondi prima di "finalizzare" il testo
        }
        
        // Mostra una nuova frase ogni 4-7 secondi (intervallo casuale più naturale)
        demoTimerId = setInterval(() => {
          showNextPhrase();
        }, Math.floor(Math.random() * 3000) + 4000);
      }
      
      logDebug('Modalità demo avviata con frasi contestuali a Synapse');
      return true;
    }
    
    // Ferma la modalità demo
    function stopDemoMode() {
      if (demoTimerId) {
        clearInterval(demoTimerId);
        demoTimerId = null;
      }
      
      useDemoMode = false;
      logDebug('Modalità demo fermata');
    }
    
    logDebug('Voice-to-text component inizializzato con successo (modalità semplificata con widget)');
  } catch (error) {
    console.error('Errore critico durante l\'inizializzazione del voice-to-text:', error);
    // Mostro un errore visibile
    const errorContainer = document.createElement('div');
    errorContainer.style.position = 'fixed';
    errorContainer.style.top = '50px';
    errorContainer.style.left = '50%';
    errorContainer.style.transform = 'translateX(-50%)';
    errorContainer.style.backgroundColor = 'rgba(220, 53, 69, 0.9)';
    errorContainer.style.color = 'white';
    errorContainer.style.padding = '10px 20px';
    errorContainer.style.borderRadius = '5px';
    errorContainer.style.zIndex = '10000';
    errorContainer.textContent = `Errore nell'inizializzazione del voice-to-text: ${error.message}`;
    document.body.appendChild(errorContainer);
    
    // Rimuovi l'errore dopo 5 secondi
    setTimeout(() => {
      if (errorContainer.parentNode) {
        errorContainer.parentNode.removeChild(errorContainer);
      }
    }, 5000);
  }
});