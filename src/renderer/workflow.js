// Workflow functionality for Synapse - Notion style

let workflowActive = false;
let activeNoteId = null;
let lastNotePosition = { x: 50, y: 50 };
let noteCounter = 0;
let draggedNote = null;
let dragOffsetX = 0;
let dragOffsetY = 0;
let resizingNote = null;
let currentNoteResizeHandle = null;
let addBlockMenuOpen = false;
let addBlockMenuPosition = null;
let addBlockMenuTargetNoteId = null;
let blockFocused = null;
let resizeDirection = null;
let initialMouseX = 0;
let initialMouseY = 0;
let initialNoteRect = null;
let initialNoteTransform = null;

// Canvas e navigazione
let canvasScale = 1;
let canvasOffsetX = 0;
let canvasOffsetY = 0;
let isDraggingCanvas = false;
let canvasDragStartX = 0;
let canvasDragStartY = 0;
let initialCanvasOffsetX = 0;
let initialCanvasOffsetY = 0;
let isDocumentMode = false;

// Variabili per la minimappa
let minimap = null;
let minimapViewport = null;
let minimapScale = 0.1;
let isDraggingMinimap = false;
let minimapDragStartX = 0;
let minimapDragStartY = 0;

// Variabili per i connettori
let connectors = [];
let currentConnector = null;
let connectorSourceNode = null;
let connectorSourcePort = null;

// Variabili globali per la gestione del drag e drop dei blocchi
let draggingBlock = null;
let blockDragStartY = 0;
let blockDragPlaceholder = null;
let lastMouseY = 0;
let blockDragOverlay = null;

// Variabili per la gestione delle funzioni bound
let handleBlockDragMoveBound = null;
let handleBlockDragEndBound = null;
let dragTimeout = null;

// Ottimizzazione: memorizza la posizione di trascinamento per animazioni fluide
let currentDragX = 0;
let currentDragY = 0;
let rafId = null;

// Memorizza le note per il loro ID
let noteTitles = {};

// Variabili per la gestione del drag dei blocchi
let mouseOffsetY = 0;
let mouseOffsetX = 0;
let blockAnimationFrame = null;

// Esponi le funzioni al renderer.js
window.workflowFunctions = window.workflowFunctions || {};

// Esponi la funzione di inizializzazione
window.workflowFunctions.initialize = function() {
  // Rileva il sistema operativo e aggiungi la classe appropriata al body
  detectOperatingSystem();
  initializeWorkflow();
};

// Rileva il sistema operativo
function detectOperatingSystem() {
  const platform = navigator.platform.toLowerCase();
  let osClass = '';
  
  if (platform.includes('win')) {
    osClass = 'windows';
    console.log('Sistema operativo rilevato: Windows');
  } else if (platform.includes('mac')) {
    osClass = 'macos';
    console.log('Sistema operativo rilevato: macOS');
  } else if (platform.includes('linux')) {
    osClass = 'linux';
    console.log('Sistema operativo rilevato: Linux');
  } else {
    osClass = 'windows'; // Default a Windows se non rilevato
    console.log('Sistema operativo non riconosciuto, default a Windows');
  }
  
  document.body.classList.add(osClass);
}

// Aggiungi stili CSS per migliorare il panning e lo zoom
const workflowStyles = document.createElement('style');
workflowStyles.textContent = `
  .workflow-workspace {
    overflow: hidden;
    position: relative;
    cursor: grab;  /* Modificato: cursore a mano per indicare che il canvas è spostabile */
    touch-action: none;  /* Disattiva il comportamento touch di default */
  }
  
  .workflow-workspace.panning {
    cursor: grabbing !important;
  }
  
  .workflow-workspace.panning-ready {
    cursor: grabbing !important;
  }
  
  .workflow-workspace-content {
    position: absolute;
    top: 0;                      /* Ripristino top */
    left: 0;                     /* Ripristino left */
    transform-origin: 0 0;
    width: 10000px;
    height: 10000px;
    /* transition: transform 0.05s ease-out; */ /* Rimosso per reattività immediata */
    will-change: transform;
  }
  
  .workspace-position-indicator {
    position: absolute;
    bottom: 10px;
    left: 10px;
    padding: 5px 10px;
    background-color: rgba(0, 0, 0, 0.6);
    color: white;
    border-radius: 4px;
    font-size: 12px;
    z-index: 9999;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .workspace-position-indicator.visible {
    opacity: 1;
  }
`;
document.head.appendChild(workflowStyles);

// Aggiungi il CSS per i blocchi in stile Notion
function loadNotionBlockStyles() {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = './notion-block-styles.css';
  document.head.appendChild(link);
}
loadNotionBlockStyles();

// Esponi la funzione setupNoteTitleEditing globalmente
window.setupNoteTitleEditing = setupNoteTitleEditing;

// Esponi la funzione initializeAddBetweenButtons globalmente
window.initializeAddBetweenButtons = initializeAddBetweenButtons;

// Esponi la funzione createNewNote globalmente
window.createNewNote = createNewNote;

// Esponi la funzione setupNoteEventHandlers globalmente
window.setupNoteEventHandlers = setupNoteEventHandlers;

// Esponi la funzione handleNoteContentEdit globalmente
window.handleNoteContentEdit = handleNoteContentEdit;

// Esponi la funzione enterDocumentMode globalmente
window.enterDocumentMode = enterDocumentMode;

// Esponi la funzione exitDocumentMode globalmente
window.exitDocumentMode = exitDocumentMode;

// Initialize workflow when the tab is clicked
function initializeWorkflow() {
  console.log('Initializing workflow editor');
  
  // Verifica se il workflow è già attivo
  if (workflowActive) {
    console.log('Workflow already initialized');
    return; // Already initialized
  }
  
  workflowActive = true;
  
  // Salva lo stato attuale della sidebar delle chat per ripristinarla in seguito
  const chatSidebar = document.querySelector('.sidebar');
  if (chatSidebar) {
    // Nascondi la sidebar delle chat
    chatSidebar.style.display = 'none';
  }
  
  // Create workflow container if it doesn't exist
  let workflowContainer = document.querySelector('.workflow-container');
  if (!workflowContainer) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) {
      console.error('Cannot find chatMessages element to replace with workflow');
      return;
    }
    
    // Aggiungi la classe per lo stile fullscreen
    chatMessages.classList.add('workflow-fullscreen');
    
    // Clear chat messages and add workflow container
    chatMessages.innerHTML = '';
    workflowContainer = document.createElement('div');
    workflowContainer.className = 'workflow-container';
    chatMessages.appendChild(workflowContainer);
    
    // Crea la struttura principale con sidebar a sinistra, canvas al centro e sidebar a destra
    const mainLayout = document.createElement('div');
    mainLayout.className = 'workflow-main-layout';
    workflowContainer.appendChild(mainLayout);
    
    // Contenitore per sidebar sinistra (File Tree)
    const leftSidebarContainer = document.createElement('div');
    leftSidebarContainer.className = 'workflow-left-sidebar-container';
    mainLayout.appendChild(leftSidebarContainer);

    // Usa la sidebar sinistra dell'applicazione per la struttura dei file workflow
    const appSidebar = document.querySelector('.sidebar');
    if (appSidebar) {
      // Nascondi la sidebar delle chat
      appSidebar.style.display = 'none';
      
      // Salva il contenuto originale della sidebar per ripristinarlo in seguito
      if (!window.originalSidebarContent) {
        window.originalSidebarContent = appSidebar.innerHTML;
      }
      
      // Pulisci la sidebar e aggiungi l'albero delle cartelle per i file .syn
      appSidebar.innerHTML = '';
      //createFolderTree(appSidebar);
      
      // Assicurati che la sidebar sia visibile e aggiungila al container sinistro
      appSidebar.style.display = 'flex';
      leftSidebarContainer.appendChild(appSidebar);
    }
    
    // Crea il contenitore centrale che conterrà la toolbar e il workspace
    const centerContainer = document.createElement('div');
    centerContainer.className = 'workflow-center-container';
    mainLayout.appendChild(centerContainer);

    // Crea la toolbar verticale a sinistra del workspace
    const verticalToolbar = document.createElement('div');
    verticalToolbar.className = 'workflow-vertical-toolbar';
    centerContainer.appendChild(verticalToolbar);
    
    // Aggiungi i pulsanti alla toolbar verticale (esempio)
    verticalToolbar.innerHTML = `
      <button class="toolbar-btn" title="Seleziona"><i class="fas fa-mouse-pointer"></i></button>
      <button class="toolbar-btn" title="Sposta Canvas"><i class="fas fa-hand-paper"></i></button>
      <div class="toolbar-separator"></div>
      <button class="toolbar-btn add-note-btn" title="Nuova Nota"><i class="fas fa-sticky-note"></i></button>
      <button class="toolbar-btn" title="Testo"><i class="fas fa-font"></i></button>
      <button class="toolbar-btn" title="Forma"><i class="fas fa-shapes"></i></button>
      <div class="toolbar-separator"></div>
      <button class="toolbar-btn zoom-in-btn" title="Zoom In"><i class="fas fa-search-plus"></i></button>
      <button class="toolbar-btn zoom-out-btn" title="Zoom Out"><i class="fas fa-search-minus"></i></button>
      <button class="toolbar-btn reset-view-btn" title="Reset Vista"><i class="fas fa-compress-arrows-alt"></i></button>
      <div class="toolbar-separator"></div>
      <button class="toolbar-btn" title="Commento"><i class="fas fa-comment"></i></button>
      <button class="toolbar-btn" title="Impostazioni"><i class="fas fa-cog"></i></button>
    `;
    
    // Create workspace area (canvas for draggable elements)
    const workspaceArea = document.createElement('div');
    workspaceArea.className = 'workflow-workspace';
    workspaceArea.id = 'workflowWorkspace';
    centerContainer.appendChild(workspaceArea);
    
    // Creare il contenitore virtuale per il canvas di grandi dimensioni (10k x 10k)
    const workspaceContent = document.createElement('div');
    workspaceContent.className = 'workflow-workspace-content';
    workspaceContent.id = 'workflowContent';
    workspaceArea.appendChild(workspaceContent);
    
    // Aggiungere un indicatore di posizione nel canvas
    const positionIndicator = document.createElement('div');
    positionIndicator.className = 'workspace-position-indicator';
    positionIndicator.id = 'positionIndicator';
    positionIndicator.textContent = 'Centro: 5000, 5000';
    workspaceArea.appendChild(positionIndicator);
    
    // Aggiungi il container per le connessioni SVG DENTRO il workspace content
    // in modo che si muova insieme al canvas
    const connectionsContainer = document.createElement('div');
    connectionsContainer.className = 'connections-container';
    connectionsContainer.id = 'connectionsContainer';
    connectionsContainer.style.position = 'absolute';
    connectionsContainer.style.top = '0';
    connectionsContainer.style.left = '0';
    connectionsContainer.style.width = '100%';
    connectionsContainer.style.height = '100%';
    connectionsContainer.style.pointerEvents = 'none';
    connectionsContainer.style.zIndex = '10';
    workspaceContent.appendChild(connectionsContainer);
    
    // Create SVG element for connections
    const svgContainer = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgContainer.setAttribute("width", "100%");
    svgContainer.setAttribute("height", "100%");
    svgContainer.style.position = "absolute";
    svgContainer.style.top = "0";
    svgContainer.style.left = "0";
    svgContainer.style.pointerEvents = "none";
    svgContainer.style.zIndex = "5";
    connectionsContainer.appendChild(svgContainer);
    
    // Assicurati che il container occupi tutto lo spazio disponibile
    workflowContainer.style.width = '100%';
    workflowContainer.style.height = '100%';
    
    // Imposta l'event listener per il pulsante add-note-btn nella toolbar verticale
    const addNoteBtn = verticalToolbar.querySelector('.add-note-btn');
    if (addNoteBtn) {
    addNoteBtn.addEventListener('click', createNewNote);
    }

    // Imposta gli event listeners per i pulsanti di zoom
    const zoomInBtn = verticalToolbar.querySelector('.zoom-in-btn');
    const zoomOutBtn = verticalToolbar.querySelector('.zoom-out-btn');
    const resetViewBtn = verticalToolbar.querySelector('.reset-view-btn');

    if (zoomInBtn) {
      zoomInBtn.addEventListener('click', () => {
        console.log('Pulsante zoom in cliccato');
        canvasScale = Math.min(canvasScale * 1.2, 5);
        updateCanvasTransform();
        // Aggiorna anche le connessioni
        updateAllConnections();
      });
    }

    if (zoomOutBtn) {
      zoomOutBtn.addEventListener('click', () => {
        console.log('Pulsante zoom out cliccato');
        canvasScale = Math.max(canvasScale / 1.2, 0.1);
        updateCanvasTransform();
        // Aggiorna anche le connessioni
        updateAllConnections();
      });
    }

    if (resetViewBtn) {
      resetViewBtn.addEventListener('click', () => {
        console.log('Pulsante reset view cliccato');
        // Centro il canvas attorno al punto 5000, 5000 (centro del canvas 10k x 10k)
        canvasScale = 1;
        canvasOffsetX = -4500; // Posizione per centrare circa il punto 5000 sulla larghezza
        canvasOffsetY = -4500; // Posizione per centrare circa il punto 5000 sull'altezza
        updateCanvasTransform();
        // Aggiorna anche le connessioni
        updateAllConnections();
      });
    }

    // Create right sidebar with AI chat
    const rightSidebar = document.createElement('div');
    rightSidebar.className = 'workflow-right-sidebar';
    mainLayout.appendChild(rightSidebar);

    // Add toggle button for right sidebar
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'toggle-right-sidebar-btn';
    toggleBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    toggleBtn.addEventListener('click', toggleWorkflowSidebar);
    rightSidebar.appendChild(toggleBtn);

    // Add AI chat component
    createAIChat(rightSidebar);
    
    // Create minimap in the bottom right corner
    createMinimap(centerContainer);
    
    // Setup interactions for the workflow (pan, zoom, etc.)
    setupWorkflowInteractions(workspaceArea);
    
    // Centro inizialmente il canvas sul punto 5000, 5000 (centro del canvas 10k x 10k)
    canvasOffsetX = -4500; // Posizione per centrare circa il punto 5000 sulla larghezza
    canvasOffsetY = -4500; // Posizione per centrare circa il punto 5000 sull'altezza
    updateCanvasTransform();
    
    // Debug per controllare le interazioni del canvas
    console.log('Canvas inizializzato:', {
      canvasScale,
      canvasOffsetX,
      canvasOffsetY
    });
    
    // Controlla che i listener per il panning siano attivi
    console.log('Workspace area ID:', workspaceArea.id);
    
    // Configurazione aggiuntiva per gli eventi wheel
    console.log('DEBUG INIT: Configurazione aggiuntiva per eventi wheel sul workspace');
    
    // Rimuovi eventuali listener precedenti
    if (workspaceArea) {
      workspaceArea.removeEventListener('wheel', handleMouseWheel);
      
      // Aggiungi listener per wheel
      workspaceArea.addEventListener('wheel', handleMouseWheel, { passive: false });
      
      // Aggiungi anche un approccio alternativo
      workspaceArea.addEventListener('mousewheel', function(e) {
        console.log('DEBUG MOUSEWHEEL: Evento mousewheel rilevato');
        handleMouseWheel(e);
      }, { passive: false });
      
      // Test di zoom immediato per verificare funzionalità
      console.log('DEBUG INIT: Test di zoom iniziale');
      setTimeout(function() {
        // Incrementa lo zoom leggermente per verificare funzionalità
        const oldScale = canvasScale;
        canvasScale = Math.min(canvasScale * 1.05, 5);
        console.log('DEBUG INIT: Test di zoom - canvasScale da', oldScale, 'a', canvasScale);
        updateCanvasTransform();
        
        // Ripristina lo zoom originale
        setTimeout(function() {
          console.log('DEBUG INIT: Ripristino zoom originale');
          canvasScale = oldScale;
          updateCanvasTransform();
        }, 500);
      }, 2000);
    }
  }
}

// Cleanup del workflow quando si cambia tab
function cleanupWorkflow() {
  if (!workflowActive) return;
  
  workflowActive = false;
  
  // Rimuovi il contenitore del workflow
  const workflowContainer = document.querySelector('.workflow-container');
  if (workflowContainer) {
    workflowContainer.remove();
  }
  
  // Ripristina la sidebar originale
  const appSidebar = document.querySelector('.sidebar');
  if (appSidebar && window.originalSidebarContent) {
    appSidebar.innerHTML = window.originalSidebarContent;
    appSidebar.style.display = 'flex';
  }
  
  // Ripristina la chat history
  const chatMessages = document.getElementById('chatMessages');
  if (chatMessages) {
    chatMessages.classList.remove('workflow-fullscreen');
    
    // Qui dovresti aggiungere il codice per ricaricare la chat history
    // Esempio: loadChatHistory();
  }
}

// Gestisce lo zoom con la rotella del mouse
function handleMouseWheel(e) {
  console.log('DEBUG WHEEL: Evento wheel intercettato', {
    deltaY: e.deltaY,
    deltaMode: e.deltaMode,
    clientX: e.clientX,
    clientY: e.clientY,
    ctrlKey: e.ctrlKey,
    target: e.target.tagName + (e.target.id ? '#' + e.target.id : '') + (e.target.className ? '.' + e.target.className : '')
  });
  
  // Permetti lo zoom solo se non si sta trascinando una nota o altro elemento interattivo
  if (isDraggingCanvas || draggedNote || resizingNote || isDraggingMinimap) {
    console.log('DEBUG WHEEL: Zoom bloccato perché sta trascinando qualcosa');
    return;
  }
  
  // Previeni il comportamento predefinito
  e.preventDefault();
  
  // Ottieni il workspace
  const workspace = document.getElementById('workflowWorkspace');
  if (!workspace) {
    console.error('DEBUG WHEEL: Workspace non trovato per lo zoom');
    return;
  }
  
  // Salva la posizione del mouse rispetto al viewport
  const rect = workspace.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  
  console.log('DEBUG WHEEL: Posizione mouse per zoom:', mouseX, mouseY);
  
  // Calcola la posizione del mouse nelle coordinate del canvas
  const oldMouseCanvasX = (mouseX - canvasOffsetX) / canvasScale;
  const oldMouseCanvasY = (mouseY - canvasOffsetY) / canvasScale;
  
  // Determina la direzione dello zoom (positivo = zoom in, negativo = zoom out)
  const zoomDirection = -Math.sign(e.deltaY);
  
  console.log('DEBUG WHEEL: Direzione zoom:', zoomDirection);
  
  // Aggiorna il fattore di scala in base alla direzione dello zoom
  // Aumentiamo la sensibilità dello zoom
  const zoomFactor = 0.15; // Aumentato da 0.1 per maggiore sensibilità
  let newScale;
  
  if (zoomDirection > 0) {
    // Zoom in
    newScale = canvasScale * (1 + zoomFactor);
  } else {
    // Zoom out
    newScale = canvasScale / (1 + zoomFactor);
  }
  
  // Limita la scala min/max
  const boundedScale = Math.max(0.1, Math.min(5, newScale)); // Aumentato il limite massimo a 5
  
  console.log('DEBUG WHEEL: Nuovo fattore di scala:', boundedScale, 'da', canvasScale);
  
  // Memorizza la scala precedente per riferimento
  const oldScale = canvasScale;
  
  // Aggiorna la scala
  canvasScale = boundedScale;
  
  // Calcola il nuovo offset per mantenere il punto sotto il mouse fermo
  canvasOffsetX = mouseX - oldMouseCanvasX * canvasScale;
  canvasOffsetY = mouseY - oldMouseCanvasY * canvasScale;
  
  console.log('DEBUG WHEEL: Nuovi offset canvas:', canvasOffsetX, canvasOffsetY);
  
  // Mostra l'indicatore di posizione durante lo zoom
  const positionIndicator = document.getElementById('positionIndicator');
  if (positionIndicator) {
    positionIndicator.classList.add('visible');
    // Aggiorna il testo dell'indicatore
    positionIndicator.textContent = `Centro: (varie) | Zoom: ${Math.round(canvasScale * 100)}%`;
  }
  
  // Applica immediatamente la trasformazione al canvas per feedback visivo immediato
  const workspaceContent = document.getElementById('workflowContent');
  if (workspaceContent) {
    workspaceContent.style.transform = `translate(${canvasOffsetX}px, ${canvasOffsetY}px) scale(${canvasScale})`;
    console.log('DEBUG WHEEL: Trasformazione applicata al workspaceContent');
  }
  
  // Aggiorna le trasformazioni solo se il fattore di scala è cambiato significativamente
  // Questo riduce il numero di aggiornamenti delle connessioni durante lo zoom continuo
  if (Math.abs(oldScale - canvasScale) > 0.01) {
    // Aggiorna la trasformazione del canvas completamente
  updateCanvasTransform();
    
    // Aggiorna le connessioni solo dopo che lo zoom è stato completato
    // Questo evita aggiornamenti eccessivi delle connessioni durante lo zoom continuo
    clearTimeout(window.connectionsUpdateTimeout);
    window.connectionsUpdateTimeout = setTimeout(() => {
      console.log('DEBUG WHEEL: Aggiornamento delle connessioni dopo zoom');
      updateAllConnections();
    }, 100); // Piccolo ritardo per migliorare le prestazioni
  }
  
  console.log('DEBUG WHEEL: Zoom completato con successo');
  
  // Nascondi l'indicatore di posizione dopo un breve ritardo
  clearTimeout(window.positionIndicatorTimeout);
  window.positionIndicatorTimeout = setTimeout(() => {
    const positionIndicator = document.getElementById('positionIndicator');
    if (positionIndicator) {
      positionIndicator.classList.remove('visible');
    }
  }, 1500);
}

// Aggiorna la trasformazione del canvas (zoom e pan)
function updateCanvasTransform() {
  const workspace = document.getElementById('workflowWorkspace');
  const workspaceContent = document.getElementById('workflowContent');
  
  if (!workspace || !workspaceContent) {
    console.error('updateCanvasTransform: elementi workspace o workspaceContent non trovati');
    return;
  }
  
  console.log('Aggiorno la trasformazione del canvas', {
    canvasScale,
    canvasOffsetX,
    canvasOffsetY
  });
  
  const workspaceWidth = workspace.clientWidth;
  const workspaceHeight = workspace.clientHeight;
  const scaledContentWidth = 10000 * canvasScale; // Larghezza reale del contenuto canvas scalato
  const scaledContentHeight = 10000 * canvasScale; // Altezza reale del contenuto canvas scalato

  // Applica limiti di panning migliorati
  if (scaledContentWidth > workspaceWidth) {
    // Il contenuto è più largo della viewport
    canvasOffsetX = Math.max(workspaceWidth - scaledContentWidth, Math.min(0, canvasOffsetX));
  } else {
    // Il contenuto è più stretto o uguale alla viewport
    // Permetti di muoverlo da 0 a (workspaceWidth - scaledContentWidth)
    canvasOffsetX = Math.max(0, Math.min(workspaceWidth - scaledContentWidth, canvasOffsetX));
  }

  if (scaledContentHeight > workspaceHeight) {
    // Il contenuto è più alto della viewport
    canvasOffsetY = Math.max(workspaceHeight - scaledContentHeight, Math.min(0, canvasOffsetY));
  } else {
    // Il contenuto è più basso o uguale alla viewport
    // Permetti di muoverlo da 0 a (workspaceHeight - scaledContentHeight)
    canvasOffsetY = Math.max(0, Math.min(workspaceHeight - scaledContentHeight, canvasOffsetY));
  }

  if (workspace && workspaceContent) {
    // Applica la trasformazione al contenitore del canvas
    workspaceContent.style.transform = `translate(${canvasOffsetX}px, ${canvasOffsetY}px) scale(${canvasScale})`;
    workspaceContent.style.transformOrigin = '0 0';
    
    // Aggiorna l'indicatore di posizione usando la funzione dedicata
    updatePositionIndicator();
    
    // Aggiorna la minimappa
    updateMinimap();
    
    // IMPORTANTE: Aggiorna tutte le connessioni per assicurarsi che seguano il canvas
    // Questo risolve il problema delle connessioni che non seguono le note durante lo spostamento
      updateAllConnections();
  }
}

// Crea una semplice chat AI nella sidebar destra
function createAIChat(sidebar) {
  // Non creiamo più il componente Synapse AI Assistant
  // Questa funzione è stata modificata per non aggiungere nulla al sidebar
  return; // Non fa nulla
}

// Crea la minimappa per la navigazione
function createMinimap(container) {
  // Crea il container della minimappa
  minimap = document.createElement('div');
  minimap.className = 'workflow-minimap';
  container.appendChild(minimap);
  
  // Crea il contenuto della minimappa
  const minimapContent = document.createElement('div');
  minimapContent.className = 'workflow-minimap-content';
  minimap.appendChild(minimapContent);
  
  // Crea il viewport della minimappa
  minimapViewport = document.createElement('div');
  minimapViewport.className = 'workflow-minimap-viewport';
  minimap.appendChild(minimapViewport);
  
  // Aggiungi eventi per trascinare il viewport della minimappa
  minimapViewport.addEventListener('mousedown', handleMinimapMouseDown);
  document.addEventListener('mousemove', handleMinimapMouseMove);
  document.addEventListener('mouseup', handleMinimapMouseUp);
  
  // Aggiorna la minimappa inizialmente
  updateMinimap();
}

// Gestisce l'inizio del trascinamento della minimappa
function handleMinimapMouseDown(e) {
  if (e.button !== 0) return; // Solo click sinistro
  
  e.preventDefault();
  isDraggingMinimap = true;
  
  // Memorizza la posizione iniziale del mouse
  minimapDragStartX = e.clientX;
  minimapDragStartY = e.clientY;
  
  // Memorizza la posizione iniziale del canvas
  canvasDragStartX = e.clientX;
  canvasDragStartY = e.clientY;
}

// Gestisce il movimento durante il trascinamento della minimappa
function handleMinimapMouseMove(e) {
  if (!isDraggingMinimap) return;
  
  e.preventDefault();
  
  // Calcola lo spostamento del mouse con una riduzione della sensibilità
  const deltaX = (e.clientX - minimapDragStartX) * 3; // Aumenta il fattore per maggiore sensibilità
  const deltaY = (e.clientY - minimapDragStartY) * 3; // Aumenta il fattore per maggiore sensibilità
  
  // Aggiorna la posizione iniziale del mouse
  minimapDragStartX = e.clientX;
  minimapDragStartY = e.clientY;
  
  // Aggiorna la posizione del canvas in base al rapporto di scala della minimappa
  const workspace = document.getElementById('workflowWorkspace');
  if (workspace) {
    // Calcola la nuova posizione del canvas con movimento smorzato
    canvasOffsetX -= deltaX / canvasScale;
    canvasOffsetY -= deltaY / canvasScale;
    
    // Applica la trasformazione al workspace
    updateCanvasTransform();
  }
}

// Gestisce il rilascio del mouse durante il trascinamento della minimappa
function handleMinimapMouseUp(e) {
  if (e.button !== 0) return; // Solo click sinistro
  
  isDraggingMinimap = false;
}

// Aggiorna la minimappa
function updateMinimap() {
  const workspace = document.getElementById('workflowWorkspace');
  const workspaceContent = document.getElementById('workflowContent');
  const minimapViewport = document.querySelector('.workflow-minimap-viewport');
  const minimapContent = document.querySelector('.workflow-minimap-content');
  
  if (!workspace || !workspaceContent || !minimapViewport || !minimapContent) return;
  
  // Dimensioni del canvas intero (10k x 10k)
  const canvasWidth = 10000;
  const canvasHeight = 10000;
  
  // Dimensioni della viewport
  const viewportWidth = workspace.clientWidth;
  const viewportHeight = workspace.clientHeight;
  
  // Dimensioni della minimappa
  const minimapWidth = 220; // da .workflow-minimap nel CSS
  const minimapHeight = 140;
  
  // Calcola il rapporto tra minimappa e canvas
  const minimapRatio = Math.min(minimapWidth / canvasWidth, minimapHeight / canvasHeight);
  
  // Calcola la posizione e dimensione della viewport nella minimappa
  const viewportMinimapWidth = (viewportWidth / canvasScale) * minimapRatio;
  const viewportMinimapHeight = (viewportHeight / canvasScale) * minimapRatio;
  
  // Posizione del viewport nella minimappa
  const viewportMinimapX = (-canvasOffsetX / canvasScale) * minimapRatio;
  const viewportMinimapY = (-canvasOffsetY / canvasScale) * minimapRatio;
  
  // Aggiorna lo stile del viewport della minimappa
  minimapViewport.style.width = `${viewportMinimapWidth}px`;
  minimapViewport.style.height = `${viewportMinimapHeight}px`;
  minimapViewport.style.left = `${viewportMinimapX}px`;
  minimapViewport.style.top = `${viewportMinimapY}px`;
  
  // Aggiorna la scala del contenuto della minimappa
  minimapContent.style.transform = `scale(${minimapRatio})`;
  minimapContent.style.width = `${canvasWidth}px`;
  minimapContent.style.height = `${canvasHeight}px`;
  
  // Aggiorna le rappresentazioni delle note nella minimappa
  updateMinimapNotes();
}

// Aggiorna la rappresentazione delle note nella minimappa
function updateMinimapNotes() {
  const minimap = document.querySelector('.workflow-minimap-content');
  if (!minimap) return;
  
  // Rimuovi tutte le rappresentazioni precedenti
  const oldMinimapNotes = minimap.querySelectorAll('.minimap-note');
  oldMinimapNotes.forEach(note => note.remove());
  
  // Ottieni tutte le note nel workspace
  const notes = document.querySelectorAll('.workspace-note');
  
  notes.forEach(note => {
    const posX = Math.round((viewportWidth / 2 - canvasOffsetX) / canvasScale);
    const posY = Math.round((viewportHeight / 2 - canvasOffsetY) / canvasScale);
    
    // Questa sarà la nuova posizione predefinita per le prossime note
    lastNotePosition = { x: posX + 50, y: posY + 50 };
  });
  
  // Impostiamo la posizione usando translate per migliori performance
  note.style.transform = `translate(${posX}px, ${posY}px)`;
  
  // Imposta larghezza e altezza
  note.style.width = '300px';
  note.style.height = '200px';
  
  // Aggiunge l'intestazione alla nota
  const noteHeader = document.createElement('div');
  noteHeader.className = 'note-header';
  note.appendChild(noteHeader);
  
  // Aggiunge il titolo della nota all'intestazione
  const titleElement = document.createElement('div');
  titleElement.className = 'note-title';
  titleElement.contentEditable = 'true';
  titleElement.setAttribute('spellcheck', 'false');
  titleElement.setAttribute('data-placeholder', 'Titolo nota');
  
  // Genera un titolo predefinito
  noteCounter++;
  titleElement.textContent = `Nota ${noteCounter}`;
  noteTitles[noteId] = titleElement.textContent;
  
  // Aggiungi l'evento per modificare il titolo
  setupNoteTitleEditing(titleElement, noteId);
  
  noteHeader.appendChild(titleElement);
  
  // Aggiungi il pulsante per entrare nella modalità documento
  const noteActions = document.createElement('div');
  noteActions.className = 'note-actions';
  
  const expandButton = document.createElement('button');
  expandButton.className = 'note-action';
  expandButton.innerHTML = '<i class="fas fa-expand-alt"></i>';
  expandButton.title = 'Espandi';
  expandButton.addEventListener('click', (e) => {
    e.stopPropagation();
    enterDocumentMode(note);
  });
  
  noteActions.appendChild(expandButton);
  noteHeader.appendChild(noteActions);
  
  // Aggiungi la maniglia di ridimensionamento
  const resizeHandle = document.createElement('div');
  resizeHandle.className = 'note-resize-handle';
  resizeHandle.innerHTML = '<i class="fas fa-grip-lines-diagonal"></i>';
  note.appendChild(resizeHandle);
  
  // Aggiunge il contenuto della nota
  const noteContent = document.createElement('div');
  noteContent.className = 'note-content';
  note.appendChild(noteContent);
  
  // Aggiungi un blocco di default
  const defaultBlock = document.createElement('div');
  defaultBlock.className = 'note-block';
  defaultBlock.id = `block-${Date.now()}`;
  
  const blockContent = document.createElement('div');
  blockContent.className = 'block-content';
  blockContent.contentEditable = 'true';
  blockContent.setAttribute('data-placeholder', 'Scrivi qui...');
  blockContent.addEventListener('input', handleNoteContentEdit);
  
  defaultBlock.appendChild(blockContent);
  noteContent.appendChild(defaultBlock);
  
  // Aggiungi la nota al workspace
  workspaceContent.appendChild(note);
  
  // Imposta la nota come attiva
  setActiveNote(noteId);
  
  // Aggiungi gli event handlers
  setupNoteEventHandlers(note);
  
  // Aggiungi i connection ports
  setupConnectionPorts(note);
  
  // Aggiungi event listener per la maniglia di ridimensionamento
  resizeHandle.addEventListener('mousedown', function(e) {
    handleNoteResizeStart(e);
  });
  
  // Inizializza i pulsanti "Aggiungi tra" per questa nota
  initializeAddBetweenButtons(note);
  
  // Salva lo stato iniziale della nota
  saveNoteState(noteId);
  
  return note;
}

// Gestisce le modifiche al contenuto delle note
function handleNoteContentEdit(e) {
  const blockContent = e.target;
  const block = blockContent.closest('.note-block');
  
  if (!block) return;

  // Verifica se siamo in modalità documento o in modalità canvas
  const isDocumentMode = document.body.classList.contains('document-mode');
  
  if (isDocumentMode) {
    // In modalità documento, mostra lo stato "Salvando..."
    showSavingStatus();
    
    // Aggiorna il conteggio delle parole
    const documentContainer = document.querySelector('.document-container');
    if (documentContainer) {
      updateDocumentWordCount(documentContainer);
    }
  } else {
    // In modalità canvas, salva lo stato della nota
    const note = blockContent.closest('.workspace-note');
    if (note) {
      // Delay save to avoid too many operations
      if (note.saveTimeout) {
        clearTimeout(note.saveTimeout);
      }
      
      note.saveTimeout = setTimeout(() => {
        saveNoteState(note.id);
        delete note.saveTimeout;
      }, 500);
    }
  }
}

// Configura i gestori di eventi per un blocco
function setupBlockEventHandlers(block) {
  if (!block) return;

  // Aggiungi gestore per il contenuto del blocco
  const blockContent = block.querySelector('.block-content');
  if (blockContent) {
    // Imposta contenteditable
    blockContent.setAttribute('contenteditable', 'true');
    
    // Aggiungi placeholder se vuoto
    if (blockContent.textContent.trim() === '') {
      blockContent.setAttribute('data-placeholder', 'Scrivi qualcosa...');
    }
    
    // Gestisci focus e blur
    blockContent.addEventListener('focus', () => {
      block.classList.add('focused');
      
      // Se siamo in modalità canvas, imposta il blocco come attualmente focalizzato
      if (!document.body.classList.contains('document-mode')) {
        blockFocused = block;
      }
    });
    
    blockContent.addEventListener('blur', () => {
      block.classList.remove('focused');
    });
    
    // Gestisci modifiche al contenuto
    blockContent.addEventListener('input', handleNoteContentEdit);
    
    // Gestisci tasti
    blockContent.addEventListener('keydown', handleBlockKeyDown);
  }
  
  // Aggiungi un handle di trascinamento se non esiste già
  if (!block.querySelector('.block-drag-handle')) {
    const dragHandle = document.createElement('div');
    dragHandle.className = 'block-drag-handle';
    dragHandle.innerHTML = '<i class="fas fa-grip-lines"></i>';
    block.insertBefore(dragHandle, block.firstChild);
    dragHandle.addEventListener('mousedown', handleBlockDragStart);
  } else {
    // Se già esiste, assicurati che abbia l'event listener
    const dragHandle = block.querySelector('.block-drag-handle');
    dragHandle.addEventListener('mousedown', handleBlockDragStart);
  }
  
  // Aggiungi gestore per le azioni del blocco (pulsanti di formattazione, ecc.)
  const blockActions = block.querySelector('.block-actions');
  if (blockActions) {
    // Gestisci i click sui pulsanti di azione
    blockActions.addEventListener('click', (e) => {
      const action = e.target.closest('.block-action');
      if (!action) return;
      
      const actionType = action.dataset.action;
      if (!actionType) return;
      
      // Esegui l'azione in base al tipo
      handleBlockAction(actionType, block);
    });
  }
  
  // Se è un blocco di tipo to-do, gestisci il checkbox
  if (block.classList.contains('block-to-do')) {
    const checkbox = block.querySelector('input[type="checkbox"]');
    if (checkbox) {
      checkbox.addEventListener('change', () => {
        const note = block.closest('.workspace-note');
        if (note) {
          saveNoteState(note.id);
        }
      });
    }
  }
}

// Funzione per gestire le azioni sui blocchi (può essere espansa in base alle esigenze)
function handleBlockAction(actionType, block) {
  const noteId = block.closest('.workspace-note')?.id;
  if (!noteId) return;
  
  switch (actionType) {
    case 'delete':
      block.remove();
      break;
    case 'convertToHeading':
      convertBlockToHeading(block);
      break;
    case 'convertToSubheading':
      convertBlockToSubheading(block);
      break;
    case 'convertToParagraph':
      convertBlockToParagraph(block);
      break;
    case 'convertToToDo':
      convertBlockToToDo(block);
      break;
    case 'convertToCode':
      convertBlockToCode(block);
      break;
    case 'convertToDivider':
      convertBlockToDivider(block);
      break;
    // Altre azioni possono essere aggiunte qui
  }
  
  // Aggiorna lo stato della nota dopo l'azione
  saveNoteState(noteId);
}

// Gestisce i tasti premuti in un blocco
function handleBlockKeyDown(e) {
  const blockContent = e.target;
  const block = blockContent.closest('.note-block');
  
  if (!block) return;
  
  const note = block.closest('.workspace-note');
  let noteId;
  
  // Se siamo in modalità documento
  if (document.body.classList.contains('document-mode')) {
    const overlay = document.querySelector('.document-mode-overlay');
    noteId = overlay.getAttribute('data-note-id');
    
    // In modalità documento, otteniamo i blocchi dal contenitore del documento
    const documentContainer = overlay.querySelector('.document-container');
    const blocks = Array.from(documentContainer.querySelectorAll('.note-block'));
    const currentIndex = blocks.indexOf(block);
    
    // Gestisci i tasti speciali
    switch (e.key) {
      case 'Enter':
        if (!e.shiftKey && !e.ctrlKey && !e.metaKey) {
          // Enter semplice crea un nuovo blocco
          e.preventDefault();
          
          // Ottieni la posizione del cursore
          const selection = window.getSelection();
          const range = selection.getRangeAt(0);
          
          // Dividi il testo in due parti: prima e dopo il cursore
          const cursorPos = range.startOffset;
          const text = blockContent.textContent || '';
          const textBefore = text.substring(0, cursorPos);
          const textAfter = text.substring(cursorPos);
          
          // Aggiorna il blocco corrente con il testo prima del cursore
          blockContent.textContent = textBefore;
          
          // Crea un nuovo blocco dopo quello corrente
          const newBlockType = block.dataset.blockType || 'paragraph';
          
          // In caso di documento, dobbiamo aggiungere il blocco direttamente al contenitore
          const newBlock = document.createElement('div');
          newBlock.className = `note-block block-${newBlockType}`;
          newBlock.setAttribute('data-block-type', newBlockType);
          newBlock.setAttribute('data-block-index', currentIndex + 1);
          
          // Aggiungi il drag handle
          const dragHandle = document.createElement('div');
          dragHandle.className = 'block-drag-handle';
          dragHandle.innerHTML = '<i class="fas fa-grip-lines"></i>';
          newBlock.appendChild(dragHandle);
          
          // Crea il contenuto del blocco
          const newBlockContent = document.createElement('div');
          newBlockContent.className = 'block-content';
          newBlockContent.setAttribute('contenteditable', 'true');
          newBlockContent.setAttribute('data-placeholder', 'Scrivi qualcosa...');
          newBlockContent.textContent = textAfter;
          newBlock.appendChild(newBlockContent);
          
          // Inserisci il nuovo blocco dopo il blocco corrente
          block.insertAdjacentElement('afterend', newBlock);
          
          // Aggiorna gli indici di tutti i blocchi
          Array.from(documentContainer.querySelectorAll('.note-block')).forEach((b, idx) => {
            b.setAttribute('data-block-index', idx);
          });
          
          // Aggiungi gli eventi al nuovo blocco
          setupBlockEventHandlers(newBlock);
          
          // Metti il focus sul nuovo blocco
          setTimeout(() => {
            newBlockContent.focus();
            
            // Posiziona il cursore all'inizio del nuovo blocco
            const range = document.createRange();
            const sel = window.getSelection();
            range.setStart(newBlockContent, 0);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
          }, 0);
          
          return; // Esci dalla funzione dopo aver gestito l'Enter
        }
        break;
        
      case 'Backspace':
        // Se il blocco è vuoto e non è il primo, eliminalo e sposta il cursore al blocco precedente
        if (blockContent.textContent.trim() === '' && currentIndex > 0) {
          e.preventDefault();
          
          // Ottieni il blocco precedente
          const prevBlock = blocks[currentIndex - 1];
          const prevBlockContent = prevBlock.querySelector('.block-content');
          
          // Elimina il blocco corrente
          block.remove();
          
          // Metti il focus sul blocco precedente
          if (prevBlockContent) {
            setTimeout(() => {
              prevBlockContent.focus();
              
              // Posiziona il cursore alla fine del blocco precedente
              const range = document.createRange();
              const sel = window.getSelection();
              range.selectNodeContents(prevBlockContent);
              range.collapse(false); // collapse to end
              sel.removeAllRanges();
              sel.addRange(range);
            }, 0);
          }
        }
        break;
    }
    // Fine gestione tastiera in modalità documento
    return;
  }
  
  // Se non siamo in modalità documento, continua con la gestione standard
  if (note) {
    noteId = note.id;
    const noteContent = note.querySelector('.note-content');
    const blocks = Array.from(noteContent.querySelectorAll('.note-block'));
    const currentIndex = blocks.indexOf(block);
    
    // Gestisci i tasti speciali
    switch (e.key) {
      case 'Enter':
        if (!e.shiftKey && !e.ctrlKey && !e.metaKey) {
          // Enter semplice crea un nuovo blocco
          e.preventDefault();
          
          // Ottieni la posizione del cursore
          const selection = window.getSelection();
          const range = selection.getRangeAt(0);
          
          // Dividi il testo in due parti: prima e dopo il cursore
          const cursorPos = range.startOffset;
          const text = blockContent.textContent;
          const textBefore = text.substring(0, cursorPos);
          const textAfter = text.substring(cursorPos);
          
          // Aggiorna il blocco corrente con il testo prima del cursore
          blockContent.textContent = textBefore;
          
          // Crea un nuovo blocco sotto con il testo dopo il cursore
          const newBlockType = block.dataset.blockType || 'paragraph';
          const newBlockElement = addBlockAfter(noteId, currentIndex, newBlockType);
          
          // Imposta il testo nel nuovo blocco
          if (newBlockElement) {
            const newBlockContent = newBlockElement.querySelector('.block-content');
            if (newBlockContent) {
              newBlockContent.textContent = textAfter;
              
              // Metti il focus sul nuovo blocco
              setTimeout(() => {
                newBlockContent.focus();
                
                // Posiziona il cursore all'inizio del nuovo blocco
                const range = document.createRange();
                const sel = window.getSelection();
                range.setStart(newBlockContent, 0);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
              }, 0);
            }
          }
        }
        break;
        
      case 'Backspace':
        // Se il blocco è vuoto e non è il primo, eliminalo e sposta il cursore al blocco precedente
        if (blockContent.textContent.trim() === '' && currentIndex > 0) {
          e.preventDefault();
          
          // Ottieni il blocco precedente
          const prevBlock = blocks[currentIndex - 1];
          const prevBlockContent = prevBlock.querySelector('.block-content');
          
          // Elimina il blocco corrente
          block.remove();
          
          // Metti il focus sul blocco precedente
          if (prevBlockContent) {
            setTimeout(() => {
              prevBlockContent.focus();
              
              // Posiziona il cursore alla fine del blocco precedente
              const range = document.createRange();
              const sel = window.getSelection();
              range.selectNodeContents(prevBlockContent);
              range.collapse(false); // collapse to end
              sel.removeAllRanges();
              sel.addRange(range);
            }, 0);
          }
        }
        break;
    }
  }
}

// Aggiorna il conteggio delle parole nel documento
function updateDocumentWordCount(documentContent) {
  if (!documentContent) return;
  
  const statusInfo = document.querySelector('.document-status-info');
  if (!statusInfo) return;
  
  let text = '';
  const blocks = documentContent.querySelectorAll('.block-content');
  blocks.forEach(block => {
    text += block.textContent + ' ';
  });
  
  // Conta parole, caratteri e righe
  const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
  const chars = text.length;
  const lines = blocks.length;
  
  // Aggiorna l'interfaccia
  statusInfo.textContent = `${words} parole · ${chars} caratteri · ${lines} righe`;
}

// Salva lo stato di una nota
function saveNoteState(noteId) {
  const note = document.getElementById(noteId);
  if (!note) {
    console.error(`Nota con ID ${noteId} non trovata`);
    return;
  }
  
  console.log(`Saving state for note ${noteId}`);
  
  // Raccogli i dati dei blocchi
  const blocks = note.querySelectorAll('.note-block');
  const hasContent = Array.from(blocks).some(block => {
    const content = block.querySelector('.block-content')?.innerHTML || '';
    return content.trim() !== '';
  });
  
  if (!hasContent) {
    console.warn(`Nota ${noteId} non ha contenuto da salvare`);
  }
  
  // Esempio di oggetto stato che potrebbe essere salvato
  const noteState = {
    id: noteId,
    title: note.querySelector('.note-title')?.textContent || 'Nuova Nota',
    position: {
      x: note.style.transform ? extractTranslateX(note.style.transform) : 0,
      y: note.style.transform ? extractTranslateY(note.style.transform) : 0,
    },
    size: {
      width: note.offsetWidth,
      height: note.offsetHeight
    },
    blocks: []
  };
  
  // Raccogli i dati dei blocchi
  blocks.forEach(block => {
    noteState.blocks.push({
      type: block.dataset.blockType || 'paragraph',
      content: block.querySelector('.block-content')?.innerHTML || '',
      checked: block.querySelector('input[type="checkbox"]')?.checked || false
    });
  });
  
  // Salva lo stato localmente
  localStorage.setItem(`note_${noteId}`, JSON.stringify(noteState));
}

// Funzione di supporto per estrarre translateX dal transform
function extractTranslateX(transform) {
  const match = transform.match(/translate\(([^,]+)px,[^)]+\)/);
  return match ? parseFloat(match[1]) : 0;
}

// Funzione di supporto per estrarre translateY dal transform
function extractTranslateY(transform) {
  const match = transform.match(/translate\([^,]+px,\s*([^)]+)px\)/);
  return match ? parseFloat(match[1]) : 0;
}

// Funzioni di conversione tra tipi di blocchi

// Converte un blocco in paragrafo
function convertBlockToParagraph(block) {
  if (!block) return;
  
  // Memorizza il contenuto
  const content = block.querySelector('.block-content')?.innerHTML || '';
  
  // Resetta la classe del blocco
  block.className = 'note-block block-paragraph';
  block.setAttribute('data-block-type', 'paragraph');
  
  // Rimuovi eventuali elementi speciali
  const blockContent = block.querySelector('.block-content');
  if (blockContent) {
    blockContent.innerHTML = content;
  } else {
    // Se manca block-content, crealo
    const newContent = document.createElement('div');
    newContent.className = 'block-content';
    newContent.setAttribute('contenteditable', 'true');
    newContent.innerHTML = content;
    
    // Rimuovi tutto tranne il drag handle
    const dragHandle = block.querySelector('.block-drag-handle');
    block.innerHTML = '';
    if (dragHandle) block.appendChild(dragHandle);
    block.appendChild(newContent);
  }
  
  // Ripristina gli event handler
  setupBlockEventHandlers(block);
}

// Converte un blocco in titolo
function convertBlockToHeading(block) {
  if (!block) return;
  
  // Memorizza il contenuto
  const content = block.querySelector('.block-content')?.innerHTML || '';
  
  // Resetta la classe del blocco
  block.className = 'note-block block-heading';
  block.setAttribute('data-block-type', 'heading');
  
  // Aggiorna il contenuto
  const blockContent = block.querySelector('.block-content');
  if (blockContent) {
    blockContent.innerHTML = content;
  } else {
    // Se manca block-content, crealo
    const newContent = document.createElement('div');
    newContent.className = 'block-content';
    newContent.setAttribute('contenteditable', 'true');
    newContent.innerHTML = content;
    
    // Rimuovi tutto tranne il drag handle
    const dragHandle = block.querySelector('.block-drag-handle');
    block.innerHTML = '';
    if (dragHandle) block.appendChild(dragHandle);
    block.appendChild(newContent);
  }
  
  // Ripristina gli event handler
  setupBlockEventHandlers(block);
}

// Converte un blocco in sottotitolo
function convertBlockToSubheading(block) {
  if (!block) return;
  
  // Memorizza il contenuto
  const content = block.querySelector('.block-content')?.innerHTML || '';
  
  // Resetta la classe del blocco
  block.className = 'note-block block-subheading';
  block.setAttribute('data-block-type', 'subheading');
  
  // Aggiorna il contenuto
  const blockContent = block.querySelector('.block-content');
  if (blockContent) {
    blockContent.innerHTML = content;
  } else {
    // Se manca block-content, crealo
    const newContent = document.createElement('div');
    newContent.className = 'block-content';
    newContent.setAttribute('contenteditable', 'true');
    newContent.innerHTML = content;
    
    // Rimuovi tutto tranne il drag handle
    const dragHandle = block.querySelector('.block-drag-handle');
    block.innerHTML = '';
    if (dragHandle) block.appendChild(dragHandle);
    block.appendChild(newContent);
  }
  
  // Ripristina gli event handler
  setupBlockEventHandlers(block);
}

// Converte un blocco in to-do
function convertBlockToToDo(block) {
  if (!block) return;
  
  // Memorizza il contenuto
  const content = block.querySelector('.block-content')?.innerHTML || '';
  
  // Resetta la classe del blocco
  block.className = 'note-block block-to-do';
  block.setAttribute('data-block-type', 'todo');
  
  // Rimuovi il contenuto attuale
  const dragHandle = block.querySelector('.block-drag-handle');
  block.innerHTML = '';
  if (dragHandle) block.appendChild(dragHandle);
  
  // Crea il checkbox
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'checklist-checkbox';
  block.appendChild(checkbox);
  
  // Crea il nuovo contenuto
  const blockContent = document.createElement('div');
  blockContent.className = 'block-content';
  blockContent.setAttribute('contenteditable', 'true');
  blockContent.innerHTML = content;
  block.appendChild(blockContent);
  
  // Ripristina gli event handler
  setupBlockEventHandlers(block);
}

// Converte un blocco in separatore
function convertBlockToDivider(block) {
  if (!block) return;
  
  // Resetta la classe del blocco
  block.className = 'note-block block-divider';
  block.setAttribute('data-block-type', 'divider');
  
  // Rimuovi il contenuto attuale
  const dragHandle = block.querySelector('.block-drag-handle');
  block.innerHTML = '';
  if (dragHandle) block.appendChild(dragHandle);
  
  // Aggiungi l'elemento hr
  const hr = document.createElement('hr');
  block.appendChild(hr);
  
  // Ripristina gli event handler
  setupBlockEventHandlers(block);
}

// Converte un blocco in codice
function convertBlockToCode(block) {
  if (!block) return;
  
  // Memorizza il contenuto
  const content = block.querySelector('.block-content')?.textContent || '';
  
  // Resetta la classe del blocco
  block.className = 'note-block block-code';
  block.setAttribute('data-block-type', 'code');
  
  // Rimuovi il contenuto attuale
  const dragHandle = block.querySelector('.block-drag-handle');
  block.innerHTML = '';
  if (dragHandle) block.appendChild(dragHandle);
  
  // Crea l'header del blocco codice
  const codeHeader = document.createElement('div');
  codeHeader.className = 'block-code-header';
  codeHeader.innerHTML = `
    <div>JavaScript</div>
    <select class="code-language-select">
      <option value="javascript">JavaScript</option>
      <option value="python">Python</option>
      <option value="java">Java</option>
      <option value="cpp">C++</option>
      <option value="csharp">C#</option>
      <option value="html">HTML</option>
      <option value="css">CSS</option>
      <option value="sql">SQL</option>
    </select>
  `;
  block.appendChild(codeHeader);
  
  // Crea il contenitore del codice
  const codeContent = document.createElement('div');
  codeContent.className = 'block-code-content';
  
  // Crea il contenuto del blocco
  const blockContent = document.createElement('div');
  blockContent.className = 'block-content';
  blockContent.setAttribute('contenteditable', 'true');
  blockContent.textContent = content;
  
  codeContent.appendChild(blockContent);
  block.appendChild(codeContent);
  
  // Ripristina gli event handler
  setupBlockEventHandlers(block);
}

// Converte un blocco in immagine
function convertBlockToImage(block) {
  if (!block) return;
  
  // Resetta la classe del blocco
  block.className = 'note-block block-image';
  block.setAttribute('data-block-type', 'image');
  
  // Rimuovi il contenuto attuale
  const dragHandle = block.querySelector('.block-drag-handle');
  block.innerHTML = '';
  if (dragHandle) block.appendChild(dragHandle);
  
  // Crea il contenitore dell'immagine
  const imageContainer = document.createElement('div');
  imageContainer.className = 'block-image-container';
  
  // Aggiungi un'immagine placeholder
  const img = document.createElement('img');
  img.className = 'block-image';
  img.src = 'https://via.placeholder.com/800x400?text=Immagine+Placeholder';
  img.alt = 'Immagine';
  imageContainer.appendChild(img);
  
  block.appendChild(imageContainer);
  
  // Ripristina gli event handler
  setupBlockEventHandlers(block);
}

// Funzione per ripristinare gli elementi del canvas
function restoreCanvasElements() {
  document.querySelectorAll('.workspace-note, .workspace-ai-node, svg.connector').forEach(el => {
    el.style.visibility = 'visible';
  });
}

// Mostra lo stato di salvataggio nella modalità documento
function showSavingStatus() {
  const saveStatus = document.querySelector('.document-save-status');
  if (!saveStatus) return;
  
  // Cambia stato a "Salvando..."
  saveStatus.innerHTML = '<i class="fas fa-sync fa-spin"></i> Salvando...';
  
  // Ripristina lo stato a "Salvato" dopo 1 secondo
  setTimeout(() => {
    saveStatus.innerHTML = '<i class="fas fa-check-circle"></i> Salvato';
  }, 1000);
}

// Aggiungi la funzione per creare i connection ports sulle note
function setupConnectionPorts(note) {
  if (!note) return;
  
  // Crea i connection ports (top, right, bottom, left)
  const positions = ['top', 'right', 'bottom', 'left'];
  
  positions.forEach(position => {
    // Verifica se il connection port esiste già
    if (note.querySelector(`.connection-port.${position}`)) return;
    
    const port = document.createElement('div');
    port.className = `connection-port ${position}`;
    port.setAttribute('data-position', position);
    port.innerHTML = '<div class="connection-dot"></div>';
    note.appendChild(port);
    
    // Aggiungi gli event listeners per il port
    port.addEventListener('mousedown', handleConnectionStart);
    
    // Aggiungi tooltip al port
    port.setAttribute('title', `Crea connessione da ${position}`);
    
    // Evidenzia il port quando il mouse entra
    port.addEventListener('mouseenter', () => {
      port.classList.add('hover');
      
      // Se c'è una connessione in corso, evidenzia solo i port validi
      if (connectionStartPort && connectionStartPort !== port) {
        const portElement = port.closest('.workspace-note, .workspace-ai-node');
        const startElement = connectionStartPort.closest('.workspace-note, .workspace-ai-node');
        
        if (portElement && startElement && portElement !== startElement) {
          port.classList.add('highlight');
        }
      }
    });
    
    // Rimuovi l'evidenziazione quando il mouse esce
    port.addEventListener('mouseleave', () => {
      port.classList.remove('hover');
      port.classList.remove('highlight');
    });
  });
}

// Variabili per la gestione delle connessioni
let activeConnection = null;
let connectionStartElement = null;
let connectionStartPort = null;
let connectionPath = null;
let connections = [];

// Gestisce l'inizio di una connessione
function handleConnectionStart(e) {
  e.preventDefault();
  e.stopPropagation();
  
  const port = e.currentTarget;
  const element = port.closest('.workspace-note, .workspace-ai-node');
  if (!element) return;
  
  // Memorizza l'elemento e la porta di origine
  connectionStartElement = element;
  connectionStartPort = port;
  
  // Crea un SVG path per la connessione
  createConnectionPath();
  
  // Aggiorna la posizione iniziale del path
  updateConnectionPathStart();
  
  // Aggiungi event listeners per il movimento e il rilascio
  document.addEventListener('mousemove', handleConnectionMove);
  document.addEventListener('mouseup', handleConnectionEnd);
  
  // Aggiungi classe active al port
  port.classList.add('active');
}

// Crea un SVG path per la connessione attiva
function createConnectionPath() {
  // Trova il container SVG per le connessioni
  const connectionsContainer = document.getElementById('connectionsContainer');
  if (!connectionsContainer) {
    console.error('Container delle connessioni non trovato');
    return;
  }
  
  // Trova o crea l'elemento SVG all'interno del container
  let svg = connectionsContainer.querySelector('svg');
  if (!svg) {
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.pointerEvents = 'none';
    svg.style.zIndex = '5';
    connectionsContainer.appendChild(svg);
  }
  
  // Crea il path per la connessione
  connectionPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  connectionPath.setAttribute('class', 'connection-path');
  connectionPath.setAttribute('stroke', '#4a4dff');
  connectionPath.setAttribute('stroke-width', '2');
  connectionPath.setAttribute('fill', 'none');
  connectionPath.style.pointerEvents = 'auto'; // Permette di interagire con il path
  connectionPath.style.cursor = 'pointer';
  svg.appendChild(connectionPath);
  
  console.log('Path di connessione creato:', connectionPath);
  
  // Restituisci il path appena creato
  return connectionPath;
}

// Aggiorna la posizione iniziale del path
function updateConnectionPathStart() {
  if (!connectionPath || !connectionStartPort || !connectionStartElement) {
    console.warn('updateConnectionPathStart: mancano elementi necessari');
    return;
  }
  
  // Ottieni la posizione del port rispetto al documento
  const portRect = connectionStartPort.getBoundingClientRect();
  
  // Ottieni la posizione del workspace
  const workspace = document.getElementById('workflowWorkspace');
  if (!workspace) {
    console.error('updateConnectionPathStart: workspace non trovato');
    return;
  }
  
  const workspaceRect = workspace.getBoundingClientRect();
  
  // Calcola il centro del port relativo al workspace
  const portCenterX = portRect.left + portRect.width / 2 - workspaceRect.left;
  const portCenterY = portRect.top + portRect.height / 2 - workspaceRect.top;
  
  // Converti le coordinate in coordinate del canvas, considerando sia la scala sia l'offset
  const portCenterXCanvas = (portCenterX - canvasOffsetX) / canvasScale;
  const portCenterYCanvas = (portCenterY - canvasOffsetY) / canvasScale;
  
  console.log('Punto di partenza della connessione:', {
    x: portCenterXCanvas,
    y: portCenterYCanvas
  });
  
  // Memorizza le coordinate iniziali nel path
  connectionPath.setAttribute('data-start-x', portCenterXCanvas);
  connectionPath.setAttribute('data-start-y', portCenterYCanvas);
}

// Gestisce il movimento durante la creazione di una connessione
function handleConnectionMove(e) {
  if (!connectionPath) return;
  
  // Ottieni il workspace e le sue dimensioni
  const workspace = document.getElementById('workflowWorkspace');
  if (!workspace) return;
  
  const workspaceRect = workspace.getBoundingClientRect();
  
  // Calcola la posizione del mouse relativa al workspace
  const mouseX = e.clientX - workspaceRect.left;
  const mouseY = e.clientY - workspaceRect.top;
  
  // Converti la posizione in coordinate del canvas tenendo conto di zoom e offset
  const mouseXInCanvas = (mouseX - canvasOffsetX) / canvasScale;
  const mouseYInCanvas = (mouseY - canvasOffsetY) / canvasScale;
  
  // Ottieni le coordinate di inizio dal path
  const startX = parseFloat(connectionPath.getAttribute('data-start-x') || 0);
  const startY = parseFloat(connectionPath.getAttribute('data-start-y') || 0);
  
  // Aggiorna il path con una curva di Bezier
  updateConnectionPath(startX, startY, mouseXInCanvas, mouseYInCanvas);
  
  // Evidenzia i port validi sotto il mouse
  highlightValidPorts(e);
}

// Aggiorna il path della connessione
function updateConnectionPath(startX, startY, endX, endY) {
  if (!connectionPath) return;
  
  // Calcola i punti di controllo per la curva di Bezier
  const position = connectionStartPort.getAttribute('data-position');
  let controlPoint1X, controlPoint1Y, controlPoint2X, controlPoint2Y;
  
  // Distanza di controllo per la curva
  const distance = Math.min(150, Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)) * 0.5);
  
  // Adatta i punti di controllo in base alla posizione della porta di origine
  switch (position) {
    case 'top':
      controlPoint1X = startX;
      controlPoint1Y = startY - distance;
      controlPoint2X = endX;
      controlPoint2Y = endY + distance;
      break;
    case 'right':
      controlPoint1X = startX + distance;
      controlPoint1Y = startY;
      controlPoint2X = endX - distance;
      controlPoint2Y = endY;
      break;
    case 'bottom':
      controlPoint1X = startX;
      controlPoint1Y = startY + distance;
      controlPoint2X = endX;
      controlPoint2Y = endY - distance;
      break;
    case 'left':
      controlPoint1X = startX - distance;
      controlPoint1Y = startY;
      controlPoint2X = endX + distance;
      controlPoint2Y = endY;
      break;
    default:
      controlPoint1X = startX;
      controlPoint1Y = startY;
      controlPoint2X = endX;
      controlPoint2Y = endY;
  }
  
  // Crea il path
  const d = `M ${startX} ${startY} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${endX} ${endY}`;
  connectionPath.setAttribute('d', d);
}

// Miglioro la funzione highlightValidPorts per evidenziare meglio i port disponibili
function highlightValidPorts(e) {
  // Rimuovi highlight da tutti i port
  document.querySelectorAll('.connection-port.highlight').forEach(port => {
    port.classList.remove('highlight');
  });
  
  // Trova l'elemento sotto il mouse
  const elementsAtPoint = document.elementsFromPoint(e.clientX, e.clientY);
  const portElement = elementsAtPoint.find(el => el.classList && el.classList.contains('connection-port') || 
                                                el.parentElement && el.parentElement.classList && 
                                                el.parentElement.classList.contains('connection-port'));
  
  if (!portElement) return;
  
  // Trova il port (potrebbe essere il dot all'interno del port)
  const port = portElement.classList.contains('connection-port') ? 
              portElement : 
              portElement.parentElement;
  
  if (!port) return;
  
  // Verifica che non sia lo stesso port di partenza
  if (port === connectionStartPort) return;
  
  // Verifica che appartenga a un elemento diverso
  const element = port.closest('.workspace-note, .workspace-ai-node');
  if (!element || element === connectionStartElement) return;
  
  // Evidenzia il port valido
  port.classList.add('highlight');
}

// Gestisce il rilascio del mouse durante la creazione di una connessione
function handleConnectionEnd(e) {
  // Rimuovi gli event listeners
  document.removeEventListener('mousemove', handleConnectionMove);
  document.removeEventListener('mouseup', handleConnectionEnd);
  
  // Rimuovi la classe active dal port di partenza
  if (connectionStartPort) {
    connectionStartPort.classList.remove('active');
  }
  
  // Verifica se il rilascio è avvenuto su un port valido
  const elementsAtPoint = document.elementsFromPoint(e.clientX, e.clientY);
  
  console.log('Elementi sotto il punto di rilascio:', elementsAtPoint.map(el => el.tagName + (el.id ? '#' + el.id : '') + (el.className ? '.' + el.className : '')));
  
  const portElement = elementsAtPoint.find(el => el.classList && (
    el.classList.contains('connection-port') || 
    (el.parentElement && el.parentElement.classList && el.parentElement.classList.contains('connection-port'))
  ));
  
  if (portElement) {
    console.log('Port element trovato:', portElement);
    
    const endPort = portElement.classList.contains('connection-port') ? 
                    portElement : 
                    portElement.parentElement;
    
    console.log('End port:', endPort);
    
    if (endPort && endPort !== connectionStartPort) {
      const endElement = endPort.closest('.workspace-note, .workspace-ai-node');
      
      console.log('End element:', endElement);
      
      if (endElement && endElement !== connectionStartElement) {
        console.log('Creando connessione tra:', connectionStartElement.id, 'e', endElement.id);
        // Crea una connessione permanente
        const newConnection = createPermanentConnection(connectionStartElement, connectionStartPort, endElement, endPort);
        
        if (newConnection) {
          console.log('Connessione creata con successo:', newConnection.id);
        } else {
          console.error('Errore nella creazione della connessione');
          // Se la creazione fallisce ma abbiamo un path temporaneo, rimuoviamolo
          if (connectionPath) {
            connectionPath.remove();
          }
        }
        
        // Non rimuovere il path, verrà utilizzato per la connessione permanente
        connectionPath = null;
        connectionStartElement = null;
        connectionStartPort = null;
        return;
      } else {
        console.log('End element non valido o uguale a start element');
      }
    } else {
      console.log('End port non valido o uguale a start port');
    }
  } else {
    console.log('Nessun port element trovato sotto il punto di rilascio');
  }
  
  // Se arriviamo qui, il rilascio non è avvenuto su un port valido
  console.log('Rilascio non valido, rimuovo il path temporaneo');
  // Rimuovi il path temporaneo
  if (connectionPath) {
    connectionPath.remove();
    connectionPath = null;
  }
  
  // Reset delle variabili
  connectionStartElement = null;
  connectionStartPort = null;
}

// Miglioro la funzione createPermanentConnection per assicurare connessioni multiple
function createPermanentConnection(startElement, startPort, endElement, endPort) {
  // Aggiungiamo controlli più robusti
  if (!startElement || !startPort || !endElement || !endPort) {
    console.error('createPermanentConnection: parametri mancanti', { 
      startElement: !!startElement, 
      startPort: !!startPort, 
      endElement: !!endElement, 
      endPort: !!endPort 
    });
    return null;
  }
  
  // Controlla se esiste già una connessione tra questi due punti
  const existingConnection = connections.find(conn => 
    (conn.startElementId === startElement.id && conn.startPortPosition === startPort.getAttribute('data-position') &&
     conn.endElementId === endElement.id && conn.endPortPosition === endPort.getAttribute('data-position')) ||
    (conn.startElementId === endElement.id && conn.startPortPosition === endPort.getAttribute('data-position') &&
     conn.endElementId === startElement.id && conn.endPortPosition === startPort.getAttribute('data-position'))
  );

  // Se esiste già una connessione identica, non ne creare un'altra
  if (existingConnection) {
    console.log('Connessione già esistente, annullo creazione');
    // Annulla la creazione e rimuovi il path temporaneo
    if (connectionPath) {
      connectionPath.remove();
      connectionPath = null;
    }
    return null;
  }
  
  console.log('Creazione connessione permanente tra:', 
    startElement.id, startPort.getAttribute('data-position'),
    'e', 
    endElement.id, endPort.getAttribute('data-position')
  );
  
  // Trova o crea il container SVG per le connessioni
  const connectionsContainer = document.getElementById('connectionsContainer');
  if (!connectionsContainer) {
    console.error('Container delle connessioni non trovato');
    return null;
  }
  
  // Trova o crea l'elemento SVG all'interno del container
  let svg = connectionsContainer.querySelector('svg');
  if (!svg) {
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.pointerEvents = 'none';
    svg.style.zIndex = '5';
    connectionsContainer.appendChild(svg);
  }
  
  // Se non abbiamo un path temporaneo, crea un nuovo path
  if (!connectionPath) {
    connectionPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    connectionPath.setAttribute('stroke', '#4a4dff');
    connectionPath.setAttribute('stroke-width', '2');
    connectionPath.setAttribute('fill', 'none');
    connectionPath.style.pointerEvents = 'auto';
    connectionPath.style.cursor = 'pointer';
    svg.appendChild(connectionPath);
  } else {
    // Assicurati che il path sia figlio dell'SVG corretto
    if (connectionPath.parentElement !== svg) {
      svg.appendChild(connectionPath);
    }
  }
  
  // Crea un ID univoco per la connessione che include anche gli ID degli elementi
  const connectionId = `connection-${startElement.id}-${startPort.getAttribute('data-position')}-${endElement.id}-${endPort.getAttribute('data-position')}-${Date.now()}`;
  
  // Crea un oggetto per rappresentare la connessione
  const connection = {
    id: connectionId,
    startElementId: startElement.id,
    startPortPosition: startPort.getAttribute('data-position'),
    endElementId: endElement.id,
    endPortPosition: endPort.getAttribute('data-position'),
    path: connectionPath
  };
  
  // Aggiungi attributi al path per identificare la connessione
  connectionPath.setAttribute('id', connection.id);
  connectionPath.setAttribute('data-start-element', connection.startElementId);
  connectionPath.setAttribute('data-start-port', connection.startPortPosition);
  connectionPath.setAttribute('data-end-element', connection.endElementId);
  connectionPath.setAttribute('data-end-port', connection.endPortPosition);
  connectionPath.setAttribute('class', 'connection-path');
  
  // Aggiungi interattività al path
  connectionPath.style.pointerEvents = 'auto';
  connectionPath.style.cursor = 'pointer';
  
  // Aggiungi event listener per eliminare la connessione con doppio click
  connectionPath.addEventListener('dblclick', (e) => {
    e.stopPropagation(); // Previene che l'evento si propaghi
    deleteConnection(connection.id);
  });
  
  // Aggiungi tooltip alla connessione
  connectionPath.setAttribute('title', 'Doppio click per eliminare la connessione');
  
  // Aggiungi la connessione all'array
  connections.push(connection);
  
  // Forza aggiornamento della posizione della connessione per evitare che scompaia
  try {
    // Aggiorna subito la posizione della connessione
  updateConnectionPosition(connection);
    
    // Per sicurezza, aggiorna nuovamente dopo un breve ritardo
    setTimeout(() => {
      if (connections.includes(connection)) {
        updateConnectionPosition(connection);
      }
    }, 100);
    
    // E ancora dopo un altro ritardo per assicurarsi che sia stabile
    setTimeout(() => {
      if (connections.includes(connection)) {
        updateConnectionPosition(connection);
      }
    }, 500);
  } catch (error) {
    console.error('Errore durante l\'aggiornamento iniziale della connessione:', error);
    // Non eliminiamo la connessione in caso di errore
  }
  
  console.log(`Creata connessione ${connection.id} da ${connection.startElementId} (${connection.startPortPosition}) a ${connection.endElementId} (${connection.endPortPosition})`);
  
  return connection;
}

// Elimina una connessione
function deleteConnection(connectionId) {
  // Trova la connessione da eliminare
  const connectionIndex = connections.findIndex(conn => conn.id === connectionId);
  
  if (connectionIndex >= 0) {
    const connection = connections[connectionIndex];
    
    // Rimuovi il path SVG dal DOM
    if (connection.path) {
      connection.path.remove();
    }
    
    // Rimuovi la connessione dall'array
    connections.splice(connectionIndex, 1);
    
    console.log(`Connessione ${connectionId} eliminata. Connessioni rimanenti: ${connections.length}`);
    
    // Aggiorna tutte le altre connessioni
    updateAllConnections();
    
    return true;
  }
  
  return false;
}

// Aggiorna la posizione di una connessione esistente
function updateConnectionPosition(connection) {
  if (!connection || !connection.path) {
    console.warn('updateConnectionPosition: connessione non valida o path mancante');
    return;
  }
  
  // Trova gli elementi e i port
  const startElement = document.getElementById(connection.startElementId);
  const endElement = document.getElementById(connection.endElementId);
  
  if (!startElement || !endElement) {
    // Se uno degli elementi non esiste più, elimina la connessione
    console.warn(`Elemento non trovato per la connessione ${connection.id}, eliminazione in corso`);
    deleteConnection(connection.id);
    return;
  }
  
  const startPort = startElement.querySelector(`.connection-port[data-position="${connection.startPortPosition}"]`);
  const endPort = endElement.querySelector(`.connection-port[data-position="${connection.endPortPosition}"]`);
  
  if (!startPort || !endPort) {
    // Se uno dei port non esiste più, elimina la connessione
    console.warn(`Porta non trovata per la connessione ${connection.id}, eliminazione in corso`);
    deleteConnection(connection.id);
    return;
  }
  
  try {
    // Ottieni le coordinate dei port nel sistema di coordinate del documento
    const startPortRect = startPort.getBoundingClientRect();
    const endPortRect = endPort.getBoundingClientRect();
  
  const workspace = document.getElementById('workflowWorkspace');
    if (!workspace) {
      console.error('Workspace non trovato per l\'aggiornamento della connessione');
      return;
    }
  
  const workspaceRect = workspace.getBoundingClientRect();
    
    // Calcola il centro dei port nel sistema di coordinate del viewport
    const startXInDocument = startPortRect.left + startPortRect.width / 2;
    const startYInDocument = startPortRect.top + startPortRect.height / 2;
    const endXInDocument = endPortRect.left + endPortRect.width / 2;
    const endYInDocument = endPortRect.top + endPortRect.height / 2;
    
    // Calcola la posizione relativa al workspace
    const startXRelativeToWorkspace = startXInDocument - workspaceRect.left;
    const startYRelativeToWorkspace = startYInDocument - workspaceRect.top;
    const endXRelativeToWorkspace = endXInDocument - workspaceRect.left;
    const endYRelativeToWorkspace = endYInDocument - workspaceRect.top;
    
    // Converti in coordinate del canvas considerando sia la scala sia l'offset
    const startX = (startXRelativeToWorkspace - canvasOffsetX) / canvasScale;
    const startY = (startYRelativeToWorkspace - canvasOffsetY) / canvasScale;
    const endX = (endXRelativeToWorkspace - canvasOffsetX) / canvasScale;
    const endY = (endYRelativeToWorkspace - canvasOffsetY) / canvasScale;
    
    // Calcola i punti di controllo per la curva di Bezier
  // Distanza di controllo per la curva
  const distance = Math.min(150, Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)) * 0.5);
  
  let controlPoint1X, controlPoint1Y, controlPoint2X, controlPoint2Y;
  
  // Adatta i punti di controllo in base alla posizione della porta di origine
  switch (connection.startPortPosition) {
    case 'top':
      controlPoint1X = startX;
      controlPoint1Y = startY - distance;
      break;
    case 'right':
      controlPoint1X = startX + distance;
      controlPoint1Y = startY;
      break;
    case 'bottom':
      controlPoint1X = startX;
      controlPoint1Y = startY + distance;
      break;
    case 'left':
      controlPoint1X = startX - distance;
      controlPoint1Y = startY;
      break;
    default:
      controlPoint1X = startX;
      controlPoint1Y = startY;
  }
  
  // Adatta i punti di controllo in base alla posizione della porta di destinazione
  switch (connection.endPortPosition) {
    case 'top':
      controlPoint2X = endX;
      controlPoint2Y = endY - distance;
      break;
    case 'right':
      controlPoint2X = endX + distance;
      controlPoint2Y = endY;
      break;
    case 'bottom':
      controlPoint2X = endX;
      controlPoint2Y = endY + distance;
      break;
    case 'left':
      controlPoint2X = endX - distance;
      controlPoint2Y = endY;
      break;
    default:
      controlPoint2X = endX;
      controlPoint2Y = endY;
  }
  
  // Crea il path
  const d = `M ${startX} ${startY} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${endX} ${endY}`;
    connection.path.setAttribute('d', d);
    
    // Salvare le coordinate per il riutilizzo
    connection.path.setAttribute('data-start-x', startX);
    connection.path.setAttribute('data-start-y', startY);
    connection.path.setAttribute('data-end-x', endX);
    connection.path.setAttribute('data-end-y', endY);
    
  } catch (error) {
    console.error('Errore durante l\'aggiornamento della connessione:', error);
    // Non eliminiamo la connessione in caso di errore, per evitare che scompaia subito
  }
}

// Miglioro la funzione updateAllConnections per garantire aggiornamenti corretti
function updateAllConnections() {
  // Prima, controlla se ci sono connessioni da aggiornare
  if (!connections || connections.length === 0) {
    return;
  }
  
  console.log('DEBUG CONNECTIONS: Aggiornamento di tutte le connessioni, numero:', connections.length);
  
  // Per ogni connessione, aggiorna la sua posizione
  for (let i = 0; i < connections.length; i++) {
    try {
      const connection = connections[i];
      
      // Verifica se la connessione è valida
      if (!connection || !connection.path) {
        console.warn(`Connessione ${i} non valida o senza path, saltando...`);
        continue;
      }
      
      // Verifica se gli elementi esistono ancora
      const startElement = document.getElementById(connection.startElementId);
      const endElement = document.getElementById(connection.endElementId);
      
      if (!startElement || !endElement) {
        console.warn(`Elementi non trovati per la connessione ${connection.id}, potrebbe essere una connessione nuova, tentiamo di conservarla`);
        // Non eliminiamo subito le connessioni, potrebbero essere nuove connessioni che non hanno ancora completato l'inizializzazione
        // Eliminiamo solo se entrambi gli elementi sono assenti
        if (!startElement && !endElement) {
          connections.splice(i, 1);
          i--; // Decrementa l'indice perché abbiamo rimosso un elemento
    if (connection.path) {
      connection.path.remove();
          }
        }
        continue;
      }
      
      // Aggiorna la posizione usando il nostro metodo migliorato
      updateConnectionPosition(connection);
    } catch (error) {
      console.error(`Errore nell'aggiornamento della connessione ${i}:`, error);
      // Non eliminiamo la connessione in caso di errore, per evitare che scompaia subito
      // Commentiamo questa parte per prevenire l'eliminazione prematura
      /*
      if (connections[i] && connections[i].id) {
        deleteConnection(connections[i].id);
        i--; // Decrementa l'indice perché l'array è stato modificato
      }
      */
    }
  }
  
  console.log('DEBUG CONNECTIONS: Aggiornamento connessioni completato');
}

// Configura le interazioni per il workspace
function setupWorkflowInteractions(workspace) {
  if (!workspace) {
    console.error('setupWorkflowInteractions: workspace non trovato');
    return;
  }
  
  console.log('Configurazione delle interazioni per il workspace', workspace.id);
  
  // Rimuovi eventuali listener precedenti per evitare duplicazioni
  workspace.removeEventListener('wheel', handleMouseWheel);
  
  // Aggiungi event listener per lo zoom con la rotella del mouse
  // Usiamo 'false' per passive per poter chiamare preventDefault()
  workspace.addEventListener('wheel', handleMouseWheel, { passive: false });
  console.log('Event listener per wheel aggiunto al workspace');
  
  // Aggiungiamo anche un listener diretto per lo zoom (alternativa)
  workspace.onwheel = function(e) {
    console.log('DEBUG ONWHEEL: Evento onwheel rilevato direttamente');
    // Deleghiamo la gestione alla funzione principale
    handleMouseWheel(e);
  };
  
  // Aggiungiamo un ulteriore controllo per il DOMMouseScroll (per Firefox più vecchi)
  workspace.addEventListener('DOMMouseScroll', function(e) {
    console.log('DEBUG DOMMOUSESCROLL: Evento DOMMouseScroll rilevato');
    // Convertiamo l'evento in un formato compatibile con handleMouseWheel
    const wheelEvent = {
      preventDefault: e.preventDefault.bind(e),
      stopPropagation: e.stopPropagation.bind(e),
      clientX: e.clientX,
      clientY: e.clientY,
      deltaY: e.detail * 40, // Simuliamo deltaY da detail
      target: e.target
    };
    handleMouseWheel(wheelEvent);
  }, { passive: false });
  
  // Event listener per il click sul workspace (deseleziona le note)
  workspace.addEventListener('click', handleWorkspaceClick);
  
  // Event listener per il doppio click sul workspace (crea una nuova nota)
  workspace.addEventListener('dblclick', function(e) {
    // Ignora il dblclick se è su una nota esistente
    if (e.target.closest('.workspace-note')) return;
    
    // Calcola la posizione in base alle coordinate del mouse
    const rect = workspace.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Converti le coordinate del mouse nel sistema di coordinate del canvas
    const canvasX = Math.round((mouseX - canvasOffsetX) / canvasScale);
    const canvasY = Math.round((mouseY - canvasOffsetY) / canvasScale);
    
    // Crea una nuova nota alla posizione calcolata
    createNewNote(canvasX, canvasY);
  });
  
  // Implementazione diretta del panning sul workspace
  workspace.addEventListener('mousedown', function(e) {
    // Ignora il click su elementi specifici o se non è il tasto sinistro
    if (e.button !== 0 || 
        e.target.closest('.workspace-note, .note-block, .toolbar-btn, .connection-port, .workflow-minimap, .workflow-minimap-viewport, .note-header, .note-content')) {
      return;
    }
    
    console.log('Inizio panning canvas con mousedown diretto');
    
    // Previeni comportamento di default e propagazione
    e.preventDefault();
    e.stopPropagation();
    
    // Abilita il panning
    isDraggingCanvas = true;
    workspace.classList.add('panning');
    
    // Memorizza il punto di partenza
    canvasDragStartX = e.clientX;
    canvasDragStartY = e.clientY;
    initialCanvasOffsetX = canvasOffsetX;
    initialCanvasOffsetY = canvasOffsetY;
    
    // Mostra l'indicatore di posizione
    const positionIndicator = document.getElementById('positionIndicator');
    if (positionIndicator) {
      positionIndicator.classList.add('visible');
    }
    
    // Aggiungi event listeners temporanei per panning
    document.addEventListener('mousemove', handleCanvasMouseMove);
    document.addEventListener('mouseup', handleCanvasMouseUp);
  });
  
  // Event listener per il ridimensionamento delle note
  workspace.addEventListener('mousedown', function(e) {
    // Verifica se il click è su una maniglia di ridimensionamento
    const resizeHandle = e.target.closest('.note-resize-handle, .resize-handle');
    if (resizeHandle) {
      const note = resizeHandle.closest('.workspace-note');
      if (note) {
        handleNoteResizeStart(e);
      }
    }
  });
  
  // Event listener per il trascinamento delle note
  workspace.addEventListener('mousedown', function(e) {
    // Verifica se il click è sull'intestazione di una nota
    const noteHeader = e.target.closest('.note-header');
    if (noteHeader) {
      const note = noteHeader.closest('.workspace-note');
      if (note) {
        // Evita che il panning del canvas si attivi
        e.stopPropagation();
        handleNoteMouseDown(e, note);
      }
    }
  });
  
  // Variabili per tenere traccia dello stato dello spazio
  let isSpacePressed = false;
  let tempPanningEnabled = false;
  
  // Event listener per attivare il panning quando viene premuto Spazio
  document.addEventListener('keydown', function(e) {
    // Panning con Spazio (convenzione comune)
    if (e.code === 'Space' && !isSpacePressed) {
      isSpacePressed = true;
      
      // Previeni lo scroll della pagina
      e.preventDefault();
      
      // Cambia il cursore per indicare che il panning è disponibile
      workspace.classList.add('panning-ready');
      document.body.style.cursor = 'grab';
      
      // Abilita temporaneamente il panning
      tempPanningEnabled = true;
      
      console.log('Spazio premuto - panning temporaneo attivato');
      
      // Aggiungi un listener temporaneo per mousedown
      const tempMouseDownHandler = function(mouseEvent) {
        if (mouseEvent.button === 0 && isSpacePressed) { // Solo tasto sinistro e se lo spazio è ancora premuto
          mouseEvent.preventDefault();
          mouseEvent.stopPropagation();
          
          // Cambia il cursore durante il trascinamento
          document.body.style.cursor = 'grabbing';
          workspace.classList.add('panning');
          
          // Inizializza il panning
          isDraggingCanvas = true;
          canvasDragStartX = mouseEvent.clientX;
          canvasDragStartY = mouseEvent.clientY;
          initialCanvasOffsetX = canvasOffsetX;
          initialCanvasOffsetY = canvasOffsetY;
          
          // Mostra l'indicatore di posizione
          const positionIndicator = document.getElementById('positionIndicator');
          if (positionIndicator) {
            positionIndicator.classList.add('visible');
          }
          
          // Gestisci il rilascio del mouse
          const tempMouseUpHandler = function() {
            isDraggingCanvas = false;
            workspace.classList.remove('panning');
            document.body.style.cursor = 'grab'; // Torna a grab quando si rilascia il mouse
            
            // Rimuovi i listener temporanei di movimento e rilascio
            document.removeEventListener('mousemove', handleCanvasMouseMove);
            document.removeEventListener('mouseup', tempMouseUpHandler);
            
            // Aggiorna le connessioni dopo aver completato il panning
            updateAllConnections();
            
            // Nascondi l'indicatore di posizione
            setTimeout(() => {
              const positionIndicator = document.getElementById('positionIndicator');
              if (positionIndicator) {
                positionIndicator.classList.remove('visible');
              }
            }, 1000);
          };
          
          // Aggiungi i listener temporanei
          document.addEventListener('mousemove', handleCanvasMouseMove);
          document.addEventListener('mouseup', tempMouseUpHandler);
        }
      };
      
      // Aggiungi il listener temporaneo
      document.addEventListener('mousedown', tempMouseDownHandler);
      
      // Rimuovi il listener quando si rilascia lo spazio
      const tempKeyUpHandler = function(keyEvent) {
        if (keyEvent.code === 'Space') {
          isSpacePressed = false;
          tempPanningEnabled = false;
          
          // Ripristina il cursore
          workspace.classList.remove('panning-ready');
          document.body.style.cursor = '';
          
          // Rimuovi i listener temporanei
          document.removeEventListener('mousedown', tempMouseDownHandler);
          document.removeEventListener('keyup', tempKeyUpHandler);
          
          console.log('Spazio rilasciato - panning temporaneo disattivato');
        }
      };
      
      document.addEventListener('keyup', tempKeyUpHandler);
    }
    
    // Alt per il panning alternativo (mantenuto per retrocompatibilità)
    if (e.key === 'Alt') {
      e.preventDefault();
      workspace.classList.add('panning-ready');
      console.log('Alt premuto - panning-ready attivato');
      
      // Memorizza gli event handlers originali
      if (!window.originalMouseDown) {
        window.originalMouseDown = workspace.onmousedown;
      }
      
      // Sostituisci l'event handler per il mousedown per consentire il panning ovunque
      workspace.onmousedown = function(e) {
        if (e.button === 0) { // Solo tasto sinistro
          console.log('mousedown con Alt premuto');
          e.stopPropagation();
          e.preventDefault();
          
          // Avvia il panning direttamente
          isDraggingCanvas = true;
          canvasDragStartX = e.clientX;
          canvasDragStartY = e.clientY;
          initialCanvasOffsetX = canvasOffsetX;
          initialCanvasOffsetY = canvasOffsetY;
          
          // Cambia il cursore
          workspace.classList.add('panning');
          
          // Mostra l'indicatore di posizione
          const positionIndicator = document.getElementById('positionIndicator');
          if (positionIndicator) {
            positionIndicator.classList.add('visible');
          }
          
          // Aggiungi gli event listener per il movimento e il rilascio
          document.addEventListener('mousemove', handleCanvasMouseMove);
          document.addEventListener('mouseup', handleCanvasMouseUp);
        }
      };
    }
  });
  
  // Event listener per disattivare il panning quando Alt viene rilasciato
  document.addEventListener('keyup', function(e) {
    if (e.key === 'Alt') {
      workspace.classList.remove('panning-ready');
      console.log('Alt rilasciato - panning-ready disattivato');
      
      // Ripristina l'event handler originale
      if (window.originalMouseDown) {
        workspace.onmousedown = window.originalMouseDown;
        window.originalMouseDown = null;
      }
    }
  });
  
  // Assicuriamoci che gli altri event listener globali siano attivi
  document.addEventListener('mousemove', handleNoteMouseMove);
  document.addEventListener('mouseup', handleNoteMouseUp);
}

// Inizio il panning del canvas
function handleCanvasMouseDown(e) {
  console.log('handleCanvasMouseDown chiamato', e.target.id, e.target.className);
  
  // Ignora se il click è su un elemento specifico o se non è il tasto sinistro
  if (e.button !== 0 || 
      e.target.closest('.workspace-note, .note-block, .toolbar-btn, .connection-port, .workflow-minimap, .workflow-minimap-viewport, .note-header, .note-content')) {
    console.log('Click ignorato perché su elemento specifico o non tasto sinistro');
    return;
  }
  
  // Previeni comportamento di default e propagazione
  e.preventDefault();
  e.stopPropagation();
  
  // Imposta il cursore appropriato
  const workspace = document.getElementById('workflowWorkspace');
  if (workspace) {
    workspace.classList.add('panning');
    console.log('Classe panning aggiunta al workspace');
  }
  
  // Memorizza il punto di partenza
  isDraggingCanvas = true;
  canvasDragStartX = e.clientX;
  canvasDragStartY = e.clientY;
  
  // Memorizza l'offset iniziale per un calcolo più fluido
  initialCanvasOffsetX = canvasOffsetX;
  initialCanvasOffsetY = canvasOffsetY;
  
  console.log('Panning iniziato:', {
    isDraggingCanvas,
    canvasDragStartX,
    canvasDragStartY,
    initialCanvasOffsetX,
    initialCanvasOffsetY
  });
  
  // Aggiunge gli event listener per il movimento e il rilascio
  document.addEventListener('mousemove', handleCanvasMouseMove);
  document.addEventListener('mouseup', handleCanvasMouseUp);
  
  // Mostra l'indicatore di posizione durante il panning
  const positionIndicator = document.getElementById('positionIndicator');
  if (positionIndicator) {
    positionIndicator.classList.add('visible');
  }
}

// Gestisce il movimento durante il panning del canvas
function handleCanvasMouseMove(e) {
  if (!isDraggingCanvas) {
    return;
  }
  
  // Calcola lo spostamento
  const deltaX = e.clientX - canvasDragStartX;
  const deltaY = e.clientY - canvasDragStartY;
  
  // Aggiorna l'offset del canvas usando gli offset iniziali per un movimento più preciso
  canvasOffsetX = initialCanvasOffsetX + deltaX;
  canvasOffsetY = initialCanvasOffsetY + deltaY;
  
  // Applica la trasformazione direttamente per un movimento più fluido
  const workspaceContent = document.getElementById('workflowContent');
  if (workspaceContent) {
    workspaceContent.style.transform = `translate(${canvasOffsetX}px, ${canvasOffsetY}px) scale(${canvasScale})`;
    
    // Aggiorna l'indicatore di posizione
    updatePositionIndicator();
    
    // Aggiorna IMMEDIATAMENTE le connessioni con ogni movimento del canvas
    // Il debounce è stato rimosso per garantire che le connessioni seguano in tempo reale
    updateAllConnections();
  }
  
  e.preventDefault();
  e.stopPropagation();
}

// Gestisce il rilascio del mouse durante il panning del canvas
function handleCanvasMouseUp(e) {
  if (e.button !== 0) return; // Solo click sinistro
  
  if (!isDraggingCanvas) return; // Esci se non stiamo trascinando
  
  console.log('Fine panning canvas');
  
  // Reset dello stato di trascinamento
  isDraggingCanvas = false;
  
  // Rimuovi gli event listener per il movimento e il rilascio
  document.removeEventListener('mousemove', handleCanvasMouseMove);
  document.removeEventListener('mouseup', handleCanvasMouseUp);
  
  // Reimposta il cursore
  const workspace = document.getElementById('workflowWorkspace');
  if (workspace) {
    workspace.classList.remove('panning');
  }
  
  // Applica la trasformazione finale
  updateCanvasTransform();
  
  // Aggiorna tutte le connessioni se ci sono
  if (connections && connections.length > 0) {
    updateAllConnections();
  }
  
  // Nascondi l'indicatore di posizione dopo un breve ritardo
  setTimeout(() => {
    const positionIndicator = document.getElementById('positionIndicator');
    if (positionIndicator) {
      positionIndicator.classList.remove('visible');
    }
  }, 1000);
}

// Aggiorna l'indicatore di posizione
function updatePositionIndicator() {
  const positionIndicator = document.getElementById('positionIndicator');
  if (!positionIndicator) return;
  
  // Calcola il centro del viewport nelle coordinate del canvas
  const workspace = document.getElementById('workflowWorkspace');
  if (workspace) {
    const viewportWidth = workspace.clientWidth;
    const viewportHeight = workspace.clientHeight;
    
    // Calcola il centro della viewport nelle coordinate del canvas
    const centerX = Math.round((-canvasOffsetX + viewportWidth / 2) / canvasScale);
    const centerY = Math.round((-canvasOffsetY + viewportHeight / 2) / canvasScale);
    
    // Aggiorna il testo dell'indicatore
    positionIndicator.textContent = `Centro: ${centerX}, ${centerY} | Zoom: ${Math.round(canvasScale * 100)}%`;
  }
}

// Funzione di debug e correzione per il panning
function debugAndFixWorkflowPanning() {
  console.log('Esecuzione della funzione di debug e correzione del panning');
  
  const workspace = document.getElementById('workflowWorkspace');
  const workspaceContent = document.getElementById('workflowContent');
  
  if (!workspace || !workspaceContent) {
    console.error('DEBUG: Impossibile trovare workspace o workspaceContent');
    return;
  }
  
  console.log('DEBUG: workspace e workspaceContent trovati');
  console.log('DEBUG: workspace ID:', workspace.id);
  console.log('DEBUG: workspace classList:', workspace.className);
  console.log('DEBUG: workspaceContent ID:', workspaceContent.id);
  
  // Impostazioni di stile dirette
  workspace.style.cursor = 'grab';
  workspace.style.touchAction = 'none';
  workspace.style.overflow = 'hidden';
  
  workspaceContent.style.position = 'absolute';
  workspaceContent.style.top = '0';
  workspaceContent.style.left = '0';
  workspaceContent.style.width = '10000px';
  workspaceContent.style.height = '10000px';
  workspaceContent.style.transformOrigin = '0 0';
  workspaceContent.style.willChange = 'transform';
  
  // Aggiunta di event listener diretti
  console.log('DEBUG: Aggiunta eventi diretti per il panning sul workspace');
  
  // Rimuovo eventuali event listener esistenti per evitare duplicazioni
  workspace.removeEventListener('mousedown', directPanningHandler);
  
  // Funzione di gestione panning diretto
  function directPanningHandler(e) {
    // Ignora se il click è su un elemento specifico o se non è il tasto sinistro
    if (e.button !== 0 || e.target.closest('.workspace-note, .note-block, .toolbar-btn, .connection-port, .workflow-minimap, .workflow-minimap-viewport')) {
      return;
    }
    
    console.log('DEBUG: Inizio panning diretto da directPanningHandler');
    
    // Imposta il cursore appropriato
    workspace.style.cursor = 'grabbing';
    
    // Memorizza il punto di partenza
    isDraggingCanvas = true;
    canvasDragStartX = e.clientX;
    canvasDragStartY = e.clientY;
    initialCanvasOffsetX = canvasOffsetX;
    initialCanvasOffsetY = canvasOffsetY;
    
    // Funzione per gestire il movimento durante il panning
    function directMoveHandler(moveEvent) {
      if (!isDraggingCanvas) return;
      
      console.log('DEBUG: Movimento durante panning diretto');
      
      // Calcola lo spostamento
      const deltaX = moveEvent.clientX - canvasDragStartX;
      const deltaY = moveEvent.clientY - canvasDragStartY;
      
      // Aggiorna l'offset del canvas
      canvasOffsetX = initialCanvasOffsetX + deltaX;
      canvasOffsetY = initialCanvasOffsetY + deltaY;
      
      // Applica direttamente la trasformazione
      workspaceContent.style.transform = `translate(${canvasOffsetX}px, ${canvasOffsetY}px) scale(${canvasScale})`;
      
      moveEvent.preventDefault();
      moveEvent.stopPropagation();
    }
    
    // Funzione per gestire il rilascio del mouse
    function directUpHandler(upEvent) {
      console.log('DEBUG: Fine panning diretto');
      
      isDraggingCanvas = false;
      workspace.style.cursor = 'grab';
      
      // Rimuovi i listener temporanei
      document.removeEventListener('mousemove', directMoveHandler);
      document.removeEventListener('mouseup', directUpHandler);
      
      upEvent.preventDefault();
      upEvent.stopPropagation();
    }
    
    // Aggiungi i listener temporanei
    document.addEventListener('mousemove', directMoveHandler);
    document.addEventListener('mouseup', directUpHandler);
    
    e.preventDefault();
    e.stopPropagation();
  }
  
  // Aggiungo l'handler diretto per il panning
  workspace.addEventListener('mousedown', directPanningHandler);
  
  console.log('DEBUG: Handler per il panning installato con successo');
}

// Esegui la funzione di debug e correzione quando il documento è completamente caricato
window.addEventListener('load', function() {
  console.log('Documento caricato, avvio debug e correzione del panning');
  
  // Debug degli eventi wheel
  console.log('Aggiungendo listener globale per gli eventi wheel...');
  
  // Aggiungi un listener globale per gli eventi wheel
  document.addEventListener('wheel', function(e) {
    console.log('DEBUG GLOBAL WHEEL: Evento wheel intercettato a livello di documento', {
      deltaY: e.deltaY,
      target: e.target.tagName + (e.target.id ? '#' + e.target.id : '') + (e.target.className ? '.' + e.target.className : ''),
      timestamp: new Date().getTime()
    });
    
    // Non preveniamo il comportamento predefinito qui per evitare di interferire con il normale funzionamento
    
    // Verifica se l'evento è sul workspace
    const workspace = document.getElementById('workflowWorkspace');
    if (workspace && (e.target === workspace || workspace.contains(e.target))) {
      console.log('DEBUG GLOBAL WHEEL: Evento sul workspace, dovrebbe essere gestito da handleMouseWheel');
    }
  }, { passive: true }); // Usiamo passive: true per non bloccare lo scrolling normale
  
  // Aggiungi un listener per i tasti + e - per lo zoom come alternativa
  document.addEventListener('keydown', function(e) {
    // Solo se il workflow è attivo
    if (!workflowActive) return;
    
    // Ignora se siamo in un campo di input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
    
    console.log('DEBUG KEYBOARD: Tasto premuto', e.key);
    
    // Tasto + o = per zoom in
    if (e.key === '+' || e.key === '=' || (e.ctrlKey && e.key === '+') || (e.ctrlKey && e.key === '=')) {
      e.preventDefault();
      console.log('DEBUG KEYBOARD: Zoom in con tastiera');
      canvasScale = Math.min(canvasScale * 1.2, 5);
      updateCanvasTransform();
      updateAllConnections();
    }
    // Tasto - per zoom out
    else if (e.key === '-' || e.key === '_' || (e.ctrlKey && e.key === '-') || (e.ctrlKey && e.key === '_')) {
      e.preventDefault();
      console.log('DEBUG KEYBOARD: Zoom out con tastiera');
      canvasScale = Math.max(canvasScale / 1.2, 0.1);
      updateCanvasTransform();
      updateAllConnections();
    }
  });
  
  // Aspetta un breve momento per assicurarsi che tutto sia inizializzato
  setTimeout(debugAndFixWorkflowPanning, 1000);
  
  // Riprova più volte per sicurezza
  setTimeout(debugAndFixWorkflowPanning, 2000);
  setTimeout(debugAndFixWorkflowPanning, 5000);
  
  // Debug dello zoom
  setTimeout(function() {
    console.log('Verifica dello zoom...');
    const workspace = document.getElementById('workflowWorkspace');
    if (workspace) {
      console.log('Zoom attuale:', canvasScale);
      console.log('Riconfigurando listener per lo zoom...');
      
      // Rimuovi e riapplica l'event listener per lo zoom
      workspace.removeEventListener('wheel', handleMouseWheel);
  workspace.addEventListener('wheel', handleMouseWheel, { passive: false });
  
      // Verifica che i pulsanti dello zoom funzionino
      const zoomInBtn = document.querySelector('.zoom-in-btn');
      const zoomOutBtn = document.querySelector('.zoom-out-btn');
      
      if (zoomInBtn) {
        console.log('Pulsante zoom in trovato, riconfigurando...');
        zoomInBtn.addEventListener('click', () => {
          console.log('Zoom in cliccato');
          canvasScale = Math.min(canvasScale * 1.2, 5);
          updateCanvasTransform();
          updateAllConnections();
        });
      }
      
      if (zoomOutBtn) {
        console.log('Pulsante zoom out trovato, riconfigurando...');
        zoomOutBtn.addEventListener('click', () => {
          console.log('Zoom out cliccato');
          canvasScale = Math.max(canvasScale / 1.2, 0.1);
          updateCanvasTransform();
          updateAllConnections();
        });
      }
    }
  }, 3000);
  
  // Aggiungi un observer per monitorare quando viene attivata la modalità documento
  setupDocumentModeObserver();
});

// Configura un MutationObserver per monitorare quando viene aggiunta la classe document-mode al body
function setupDocumentModeObserver() {
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'attributes' && 
          mutation.attributeName === 'class' &&
          document.body.classList.contains('document-mode')) {
        
        console.log('Modalità documento attivata, applicando correzioni per la titlebar');
        
        // Ottieni l'altezza della titlebar personalizzata
        const titleBar = document.querySelector('.title-bar');
        let titleBarHeight = 30; // Valore predefinito dalla title-bar.css
        
        if (titleBar) {
          titleBarHeight = titleBar.offsetHeight;
          console.log('Altezza della titlebar personalizzata rilevata:', titleBarHeight);
        } else {
          console.log('Titlebar personalizzata non trovata, uso altezza predefinita');
        }
        
        // Applica correzioni per la titlebar dopo un breve ritardo
        setTimeout(function() {
          const overlay = document.querySelector('.document-mode-overlay');
          if (overlay) {
            // Sistema l'overlay in base all'altezza della titlebar personalizzata
            overlay.style.top = `${titleBarHeight}px`;
            overlay.style.height = `calc(100% - ${titleBarHeight}px)`;
            overlay.style.maxHeight = `calc(100% - ${titleBarHeight}px)`;
            
            // Rimuovi eventuali padding-top per evitare doppi spazi
            overlay.style.paddingTop = '0';
            
            console.log('Correzioni applicate all\'overlay del documento');
          }
        }, 50);
      }
    });
  });
  
  // Osserva i cambiamenti all'attributo class del body
  observer.observe(document.body, { attributes: true });
  console.log('Observer per la modalità documento configurato');
}

// Funzione per creare una nuova nota
function createNewNote(x, y) {
  console.log('Creazione di una nuova nota');
  
  // Ottieni il contenitore del workspace
  const workspaceContent = document.getElementById('workflowContent');
  if (!workspaceContent) {
    console.error('Contenitore del workspace non trovato');
    return null;
  }
  
  // Genera l'ID della nota
  const noteId = `note-${Date.now()}`;
  
  // Crea l'elemento della nota
  const note = document.createElement('div');
  note.className = 'workspace-note';
  note.id = noteId;
  
  // Calcola la posizione se non è specificata
  if (x === undefined || y === undefined) {
    // Ottieni le coordinate centrali del viewport
    const workspace = document.getElementById('workflowWorkspace');
    if (workspace) {
      const viewportWidth = workspace.clientWidth;
      const viewportHeight = workspace.clientHeight;
      
      // Calcola il centro della viewport nelle coordinate del canvas
      const centerX = Math.round((-canvasOffsetX + viewportWidth / 2) / canvasScale);
      const centerY = Math.round((-canvasOffsetY + viewportHeight / 2) / canvasScale);
      
      x = centerX;
      y = centerY;
    } else {
      // Usa la posizione predefinita se il workspace non è disponibile
      x = lastNotePosition.x;
      y = lastNotePosition.y;
    }
  }
  
  // Calcola la nuova posizione per la prossima nota
  lastNotePosition = { x: x + 50, y: y + 50 };
  
  // Impostiamo la posizione usando translate per migliori performance
  note.style.transform = `translate(${x}px, ${y}px)`;
  
  // Imposta larghezza e altezza
  note.style.width = '300px';
  note.style.height = '200px';
  
  // Aggiunge l'intestazione alla nota
  const noteHeader = document.createElement('div');
  noteHeader.className = 'note-header';
  note.appendChild(noteHeader);
  
  // Aggiunge il titolo della nota all'intestazione
  const titleElement = document.createElement('div');
  titleElement.className = 'note-title';
  titleElement.contentEditable = 'true';
  titleElement.setAttribute('spellcheck', 'false');
  titleElement.setAttribute('data-placeholder', 'Titolo nota');
  
  // Genera un titolo predefinito
  noteCounter++;
  titleElement.textContent = `Nota ${noteCounter}`;
  noteTitles[noteId] = titleElement.textContent;
  
  // Aggiungi l'evento per modificare il titolo
  setupNoteTitleEditing(titleElement, noteId);
  
  noteHeader.appendChild(titleElement);
  
  // Aggiungi il pulsante per entrare nella modalità documento
  const noteActions = document.createElement('div');
  noteActions.className = 'note-actions';
  
  const expandButton = document.createElement('button');
  expandButton.className = 'note-action';
  expandButton.innerHTML = '<i class="fas fa-expand-alt"></i>';
  expandButton.title = 'Espandi';
  expandButton.addEventListener('click', (e) => {
    e.stopPropagation();
    if (typeof enterDocumentMode === 'function') {
      enterDocumentMode(note);
    } else {
      console.warn('La funzione enterDocumentMode non è definita');
    }
  });
  
  noteActions.appendChild(expandButton);
  noteHeader.appendChild(noteActions);
  
  // Aggiungi la maniglia di ridimensionamento
  const resizeHandle = document.createElement('div');
  resizeHandle.className = 'note-resize-handle';
  resizeHandle.innerHTML = '<i class="fas fa-grip-lines-diagonal"></i>';
  note.appendChild(resizeHandle);
  
  // Aggiunge il contenuto della nota
  const noteContent = document.createElement('div');
  noteContent.className = 'note-content';
  note.appendChild(noteContent);
  
  // Aggiungi un blocco di default
  const defaultBlock = document.createElement('div');
  defaultBlock.className = 'note-block';
  defaultBlock.id = `block-${Date.now()}`;
  
  const blockContent = document.createElement('div');
  blockContent.className = 'block-content';
  blockContent.contentEditable = 'true';
  blockContent.setAttribute('data-placeholder', 'Scrivi qui...');
  blockContent.addEventListener('input', handleNoteContentEdit);
  
  defaultBlock.appendChild(blockContent);
  noteContent.appendChild(defaultBlock);
  
  // Aggiungi la nota al workspace
  workspaceContent.appendChild(note);
  
  // Imposta la nota come attiva
  if (typeof setActiveNote === 'function') {
    setActiveNote(noteId);
  } else {
    console.warn('La funzione setActiveNote non è definita');
    activeNoteId = noteId; // Imposta direttamente la variabile se la funzione non è disponibile
  }
  
  // Aggiungi gli event handlers
  if (typeof setupNoteEventHandlers === 'function') {
    setupNoteEventHandlers(note);
  } else {
    console.warn('La funzione setupNoteEventHandlers non è definita');
  }
  
  // Aggiungi i connection ports
  if (typeof setupConnectionPorts === 'function') {
    setupConnectionPorts(note);
  } else {
    console.warn('La funzione setupConnectionPorts non è definita');
  }
  
  // Aggiungi event listener per la maniglia di ridimensionamento
  resizeHandle.addEventListener('mousedown', function(e) {
    if (typeof handleNoteResizeStart === 'function') {
        handleNoteResizeStart(e);
    } else {
      console.warn('La funzione handleNoteResizeStart non è definita');
    }
  });
  
  // Inizializza i pulsanti "Aggiungi tra" per questa nota
  if (typeof initializeAddBetweenButtons === 'function') {
    initializeAddBetweenButtons(note);
  } else {
    console.warn('La funzione initializeAddBetweenButtons non è definita');
  }
  
  // Salva lo stato iniziale della nota
  if (typeof saveNoteState === 'function') {
    saveNoteState(noteId);
  } else {
    console.warn('La funzione saveNoteState non è definita');
  }
  
  console.log(`Nota creata con ID: ${noteId}`);
  return note;
}

// Esponi la funzione createNewNote globalmente (sposta qui questo codice)
window.createNewNote = createNewNote;

// Funzione per impostare la nota attiva
function setActiveNote(noteId) {
  console.log(`Imposto come attiva la nota: ${noteId}`);
  
  // Rimuovi la classe active da tutte le note
  document.querySelectorAll('.workspace-note').forEach(note => {
    note.classList.remove('active');
  });
  
  // Imposta l'ID della nota attiva
  activeNoteId = noteId;
  
  // Aggiungi la classe active alla nota specificata
  const activeNote = document.getElementById(noteId);
  if (activeNote) {
    activeNote.classList.add('active');
  } else {
    console.warn(`Nota con ID ${noteId} non trovata`);
  }
}

// Esponi la funzione setActiveNote globalmente
window.setActiveNote = setActiveNote;

// Funzione per gestire il click sul workspace (deseleziona le note)
function handleWorkspaceClick(e) {
  // Ignora il click se è su una nota o su un elemento interattivo
  if (e.target.closest('.workspace-note, .note-block, .toolbar-btn, .connection-port, .workflow-minimap, .workflow-minimap-viewport')) {
    return;
  }
  
  console.log('Click sul workspace - deseleziono le note');
  
  // Rimuovi la classe active da tutte le note
  document.querySelectorAll('.workspace-note').forEach(note => {
    note.classList.remove('active');
  });
  
  // Resetta l'ID della nota attiva
  activeNoteId = null;
}

// Esponi la funzione handleWorkspaceClick globalmente
window.handleWorkspaceClick = handleWorkspaceClick;

// Funzione per configurare gli event handlers per le note
function setupNoteEventHandlers(note) {
  if (!note) {
    console.warn('setupNoteEventHandlers: nota non valida');
    return;
  }
  
  console.log(`Configurazione degli event handlers per la nota ${note.id}`);
  
  // Evento click sulla nota (imposta come attiva)
  note.addEventListener('click', function(e) {
    // Previeni la propagazione per evitare che il click arrivi al workspace
    e.stopPropagation();
    
    // Imposta la nota come attiva
    setActiveNote(note.id);
  });
  
  // Evento mousedown sull'intestazione per il trascinamento
  const noteHeader = note.querySelector('.note-header');
    if (noteHeader) {
    noteHeader.addEventListener('mousedown', function(e) {
      // Ignora se non è il tasto sinistro
      if (e.button !== 0) return;
      
      // Previeni la propagazione per evitare conflitti con altri handler
        e.stopPropagation();
      e.preventDefault();
      
      console.log('Mouse down sull\'header della nota:', note.id);
      
      // Imposta la nota come attiva
      setActiveNote(note.id);
      
      // Inizia il trascinamento passando direttamente la nota
      handleNoteMouseDown(e, note);
    });
  }
  
  // Evento click sul pulsante di chiusura (se presente)
  const closeBtn = note.querySelector('.note-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      
      // Rimuovi la nota
      note.remove();
      
      // Se era la nota attiva, resetta l'ID della nota attiva
      if (activeNoteId === note.id) {
        activeNoteId = null;
      }
    });
  }
}

// Funzione per configurare l'editing del titolo delle note
function setupNoteTitleEditing(titleElement, noteId) {
  if (!titleElement || !noteId) {
    console.warn('setupNoteTitleEditing: parametri non validi', { titleElement, noteId });
    return;
  }
  
  // Evento focus sul titolo (seleziona tutto il testo)
  titleElement.addEventListener('focus', function() {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(titleElement);
    selection.removeAllRanges();
    selection.addRange(range);
  });
  
  // Evento input sul titolo (salva il titolo)
  titleElement.addEventListener('input', function() {
    // Aggiorna il titolo nella mappa
    noteTitles[noteId] = titleElement.textContent;
    
    // Se esiste la funzione di salvataggio dello stato, usala
    if (typeof saveNoteState === 'function') {
      saveNoteState(noteId);
    }
  });
  
  // Evento blur sul titolo (salva il titolo)
  titleElement.addEventListener('blur', function() {
    // Se il titolo è vuoto, imposta un titolo predefinito
    if (!titleElement.textContent.trim()) {
      titleElement.textContent = `Nota ${noteId.split('-')[1] || noteCounter}`;
      noteTitles[noteId] = titleElement.textContent;
    }
    
    // Se esiste la funzione di salvataggio dello stato, usala
    if (typeof saveNoteState === 'function') {
      saveNoteState(noteId);
    }
  });
}

// Esponi la funzione setupNoteTitleEditing globalmente
window.setupNoteTitleEditing = setupNoteTitleEditing;

// Funzione per iniziare il trascinamento di una nota
function handleNoteMouseDown(e, targetNote) {
  // Verifica che sia un evento valido e che venga dal tasto sinistro
  if (!e || e.button !== 0) return;
  
  // Trova la nota da trascinare
  const note = targetNote || e.target.closest('.workspace-note');
  if (!note) {
    console.warn('Nessuna nota trovata per il trascinamento');
    return;
  }
  
  // Previeni il comportamento predefinito e la propagazione
  e.preventDefault();
  e.stopPropagation();
  
  console.log('Inizio trascinamento nota:', note.id);
  
  // Memorizza la nota trascinata e calcola l'offset del mouse
  draggedNote = note;
  const rect = note.getBoundingClientRect();
  
  // Calcola l'offset relativo alla posizione del mouse nel viewport
  dragOffsetX = e.clientX - rect.left;
  dragOffsetY = e.clientY - rect.top;
  
  // Imposta lo stile per indicare che la nota è in trascinamento
  note.classList.add('dragging');
  
  // Assicurati che la nota sia sopra alle altre
  note.style.zIndex = '1000';
  
  // Aggiungi gli event listeners al documento per il movimento e il rilascio
  document.addEventListener('mousemove', handleNoteMouseMove);
  document.addEventListener('mouseup', handleNoteMouseUp);
}

// Funzione per gestire il movimento durante il trascinamento di una nota
function handleNoteMouseMove(e) {
  // Verifica che ci sia una nota in trascinamento
  if (!draggedNote) return;
  
  // Previeni il comportamento predefinito
  e.preventDefault();
  
  console.log('Trascinamento nota in corso:', draggedNote.id);
  
  // Calcola la nuova posizione
  const workspace = document.getElementById('workflowWorkspace');
  if (!workspace) return;
  
  const rect = workspace.getBoundingClientRect();
  
  // Calcola la posizione del mouse nelle coordinate del canvas
  const mouseXRelativeToWorkspace = e.clientX - rect.left;
  const mouseYRelativeToWorkspace = e.clientY - rect.top;
  
  // Converti in coordinate del canvas considerando zoom e offset
  const mouseXInCanvas = (mouseXRelativeToWorkspace - canvasOffsetX) / canvasScale;
  const mouseYInCanvas = (mouseYRelativeToWorkspace - canvasOffsetY) / canvasScale;
  
  // Calcola la posizione finale considerando l'offset del punto di trascinamento
  const noteX = mouseXInCanvas - dragOffsetX / canvasScale;
  const noteY = mouseYInCanvas - dragOffsetY / canvasScale;
  
  console.log('Nuova posizione della nota:', noteX, noteY);
  
  // Aggiorna la posizione della nota
  draggedNote.style.transform = `translate(${noteX}px, ${noteY}px)`;
  
  // Importante: aggiorna tutte le connessioni ogni volta che una nota viene spostata
  updateAllConnections();
}

// Funzione per terminare il trascinamento di una nota
function handleNoteMouseUp(e) {
  // Verifica che ci sia una nota in trascinamento
  if (!draggedNote) return;
  
  // Rimuovi lo stile di trascinamento
  draggedNote.classList.remove('dragging');
  
  // Ripristina lo z-index
  draggedNote.style.zIndex = '';
  
  // Salva lo stato della nota
  if (typeof saveNoteState === 'function') {
    saveNoteState(draggedNote.id);
  }
  
  console.log(`Fine trascinamento nota: ${draggedNote.id}`);
  
  // Resetta la nota trascinata
  draggedNote = null;
}

// Esponi le funzioni di trascinamento delle note globalmente
window.handleNoteMouseDown = handleNoteMouseDown;
window.handleNoteMouseMove = handleNoteMouseMove;
window.handleNoteMouseUp = handleNoteMouseUp;

// Funzione per configurare le porte di connessione su una nota
function setupConnectionPorts(note) {
  if (!note) {
    console.warn('setupConnectionPorts: nota non valida');
    return;
  }
  
  console.log(`Configurazione delle porte di connessione per la nota ${note.id}`);
  
  // Definisci le posizioni delle porte
  const positions = ['top', 'right', 'bottom', 'left'];
  
  // Crea una porta per ogni posizione
  positions.forEach(position => {
    // Verifica se la porta esiste già
    if (note.querySelector(`.connection-port.${position}`)) {
      return; // La porta esiste già, salta
    }
    
    // Crea l'elemento della porta
    const port = document.createElement('div');
    port.className = `connection-port ${position}`;
    port.setAttribute('data-position', position);
    port.innerHTML = '<div class="connection-dot"></div>';
    
    // Aggiungi la porta alla nota
    note.appendChild(port);
    
    // Aggiungi un tooltip
    port.setAttribute('title', `Connessione ${position}`);
    
    // Aggiungi evento di evidenziazione al passaggio del mouse
    port.addEventListener('mouseenter', () => {
      port.classList.add('hover');
    });
    
    port.addEventListener('mouseleave', () => {
      port.classList.remove('hover');
    });
    
    // Aggiungi evento per l'inizio della connessione
    port.addEventListener('mousedown', (e) => {
      // Previeni la propagazione per evitare conflitti con altri handler
      e.stopPropagation();
      e.preventDefault();
      
      // Se esiste la funzione per gestire l'inizio della connessione, usala
      if (typeof handleConnectionStart === 'function') {
        handleConnectionStart(e);
      } else {
        console.warn('La funzione handleConnectionStart non è definita');
      }
    });
  });
}

// Esponi la funzione setupConnectionPorts globalmente
window.setupConnectionPorts = setupConnectionPorts;

// Funzione per inizializzare i pulsanti di aggiunta tra i blocchi
function initializeAddBetweenButtons(note) {
  if (!note) {
    console.warn('initializeAddBetweenButtons: nota non valida');
    return;
  }
  
  console.log(`Inizializzazione dei pulsanti di aggiunta per la nota ${note.id}`);
  
  // Implementazione base, può essere espansa in seguito
  // Al momento non fa nulla di specifico
  
  // In futuro, questa funzione potrebbe aggiungere pulsanti "+" tra i blocchi
  // per consentire l'aggiunta di nuovi blocchi in posizioni specifiche
}

// Esponi la funzione initializeAddBetweenButtons globalmente
window.initializeAddBetweenButtons = initializeAddBetweenButtons;

// Funzione per entrare in modalità documento
function enterDocumentMode(note) {
  if (!note) {
    console.error('Nota mancante per entrare in modalità documento');
    return;
  }
  
  console.log('Entrando in modalità documento per la nota:', note.id);
  
  // Assicurati che la classe del sistema operativo sia applicata al body
  if (!document.body.classList.contains('windows') &&
      !document.body.classList.contains('macos') &&
      !document.body.classList.contains('linux')) {
    detectOperatingSystem();
  }
  
  // Memorizza l'ID della nota attiva
  activeNoteId = note.id;
  
  // Nascondi gli elementi del canvas
  document.querySelectorAll('.workspace-note').forEach(el => {
    if (el !== note) {
      el.style.visibility = 'hidden';
    }
  });
  document.querySelectorAll('.workspace-ai-node, svg.connector').forEach(el => {
    el.style.visibility = 'hidden';
  });
  
  // Aggiungi la classe document-mode al body
  document.body.classList.add('document-mode');
  
  // Aggiungi il tema scuro se attivo
  if (document.body.classList.contains('dark-theme')) {
    document.body.classList.add('dark-theme');
  }
  
  // Crea l'overlay della modalità documento
  const overlay = document.createElement('div');
  overlay.className = 'document-mode-overlay';
  overlay.setAttribute('data-note-id', note.id);
  document.body.appendChild(overlay);
  
  // Crea la toolbar superiore
  const topToolbar = document.createElement('div');
  topToolbar.className = 'document-top-toolbar';
  
  // Parte sinistra della toolbar
  const toolbarLeft = document.createElement('div');
  toolbarLeft.className = 'document-top-toolbar-left';
  
  // Pulsante per tornare alla modalità canvas
  const backButton = document.createElement('button');
  backButton.className = 'document-toolbar-btn doc-back-btn';
  backButton.innerHTML = '<i class="fas fa-arrow-left"></i>';
  backButton.title = 'Torna alla modalità canvas';
  backButton.addEventListener('click', exitDocumentMode);
  
  // Titolo del documento
  const titleContainer = document.createElement('div');
  titleContainer.className = 'document-title-container';
  
  const titleInput = document.createElement('input');
  titleInput.className = 'document-title-input';
  titleInput.type = 'text';
  titleInput.value = note.querySelector('.note-title')?.textContent || 'Documento senza titolo';
  titleInput.addEventListener('input', (e) => {
    // Aggiorna anche il titolo della nota nel canvas
    const noteTitle = note.querySelector('.note-title');
    if (noteTitle) {
      noteTitle.textContent = e.target.value;
    }
    
    // Mostra lo stato "Salvando..."
    showSavingStatus();
    
    // Salva lo stato della nota
    saveNoteState(note.id);
  });
  
  titleContainer.appendChild(titleInput);
  
  toolbarLeft.appendChild(backButton);
  toolbarLeft.appendChild(titleContainer);
  
  // Parte destra della toolbar
  const toolbarRight = document.createElement('div');
  toolbarRight.className = 'document-top-toolbar-right';
  
  // Stato di salvataggio
  const saveStatus = document.createElement('div');
  saveStatus.className = 'document-save-status';
  saveStatus.innerHTML = '<i class="fas fa-check-circle"></i> Salvato';
  
  // Pulsante tema chiaro/scuro
  const themeToggle = document.createElement('button');
  themeToggle.className = 'document-toolbar-btn';
  themeToggle.innerHTML = document.body.classList.contains('dark-theme') ? 
    '<i class="fas fa-sun"></i>' : 
    '<i class="fas fa-moon"></i>';
  themeToggle.title = document.body.classList.contains('dark-theme') ? 
    'Passa al tema chiaro' : 
    'Passa al tema scuro';
  themeToggle.addEventListener('click', toggleDocumentTheme);
  
  // Pulsante condividi
  const shareButton = document.createElement('button');
  shareButton.className = 'document-toolbar-btn';
  shareButton.innerHTML = '<i class="fas fa-share-alt"></i>';
  shareButton.title = 'Condividi';
  
  toolbarRight.appendChild(saveStatus);
  toolbarRight.appendChild(themeToggle);
  toolbarRight.appendChild(shareButton);
  
  // Aggiungi le parti della toolbar all'overlay
  topToolbar.appendChild(toolbarLeft);
  topToolbar.appendChild(toolbarRight);
  overlay.appendChild(topToolbar);
  
  // Crea la barra di formattazione
  const formatToolbar = document.createElement('div');
  formatToolbar.className = 'document-format-toolbar';
  
  // Gruppo: Stili di blocco
  const blockStyleGroup = document.createElement('div');
  blockStyleGroup.className = 'toolbar-group';
  
  // Selettore di stile blocco
  const blockStyleSelect = document.createElement('select');
  blockStyleSelect.className = 'format-select';
  blockStyleSelect.innerHTML = `
    <option value="paragraph">Paragrafo</option>
    <option value="heading">Titolo 1</option>
    <option value="subheading">Titolo 2</option>
    <option value="quote">Citazione</option>
    <option value="callout">Nota</option>
    <option value="code">Codice</option>
    <option value="divider">Separatore</option>
  `;
  blockStyleSelect.addEventListener('change', (e) => {
    const selectedBlockType = e.target.value;
    const focusedBlock = getFocusedBlock();
    if (focusedBlock) {
      applyBlockStyle(focusedBlock, selectedBlockType);
    }
  });
  
  blockStyleGroup.appendChild(blockStyleSelect);
  
  // Gruppo: Formattazione testo
  const textFormatGroup = document.createElement('div');
  textFormatGroup.className = 'toolbar-group';
  textFormatGroup.innerHTML = `
    <button class="document-toolbar-btn" title="Grassetto" data-command="bold"><i class="fas fa-bold"></i></button>
    <button class="document-toolbar-btn" title="Corsivo" data-command="italic"><i class="fas fa-italic"></i></button>
    <button class="document-toolbar-btn" title="Sottolineato" data-command="underline"><i class="fas fa-underline"></i></button>
    <button class="document-toolbar-btn" title="Barrato" data-command="strikeThrough"><i class="fas fa-strikethrough"></i></button>
  `;
  
  // Aggiungi event listeners per i comandi di formattazione
  textFormatGroup.querySelectorAll('.document-toolbar-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const command = btn.getAttribute('data-command');
      if (command) {
        document.execCommand(command, false, null);
      }
    });
  });
  
  // Gruppo: Allineamento
  const alignmentGroup = document.createElement('div');
  alignmentGroup.className = 'toolbar-group';
  alignmentGroup.innerHTML = `
    <button class="document-toolbar-btn" title="Allinea a sinistra" data-command="justifyLeft"><i class="fas fa-align-left"></i></button>
    <button class="document-toolbar-btn" title="Allinea al centro" data-command="justifyCenter"><i class="fas fa-align-center"></i></button>
    <button class="document-toolbar-btn" title="Allinea a destra" data-command="justifyRight"><i class="fas fa-align-right"></i></button>
    <button class="document-toolbar-btn" title="Giustifica" data-command="justifyFull"><i class="fas fa-align-justify"></i></button>
  `;
  
  // Aggiungi event listeners per i comandi di allineamento
  alignmentGroup.querySelectorAll('.document-toolbar-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const command = btn.getAttribute('data-command');
      if (command) {
        document.execCommand(command, false, null);
      }
    });
  });
  
  // Gruppo: Liste
  const listsGroup = document.createElement('div');
  listsGroup.className = 'toolbar-group';
  listsGroup.innerHTML = `
    <button class="document-toolbar-btn" title="Lista puntata" data-command="insertUnorderedList"><i class="fas fa-list-ul"></i></button>
    <button class="document-toolbar-btn" title="Lista numerata" data-command="insertOrderedList"><i class="fas fa-list-ol"></i></button>
    <button class="document-toolbar-btn" title="Lista di controllo"><i class="fas fa-tasks"></i></button>
  `;
  
  // Event listener per le liste puntate e numerate
  listsGroup.querySelectorAll('[data-command]').forEach(btn => {
    btn.addEventListener('click', () => {
      const command = btn.getAttribute('data-command');
      if (command) {
        document.execCommand(command, false, null);
      }
    });
  });
  
  // Pulsante per lista di controllo
  const checklistBtn = listsGroup.querySelector('button:last-child');
  if (checklistBtn) {
    checklistBtn.addEventListener('click', () => {
      const focusedBlock = getFocusedBlock();
      if (focusedBlock) {
        convertBlockToToDo(focusedBlock);
      }
    });
  }
  
  // Aggiungi i gruppi alla barra di formattazione
  formatToolbar.appendChild(blockStyleGroup);
  formatToolbar.appendChild(textFormatGroup);
  formatToolbar.appendChild(alignmentGroup);
  formatToolbar.appendChild(listsGroup);
  
  // Aggiungi la barra di formattazione all'overlay
  overlay.appendChild(formatToolbar);
  
  // Crea il contenitore principale del documento
  const documentContent = document.createElement('div');
  documentContent.className = 'document-content';
  
  // Contenitore del documento con larghezza fissa
  const documentContainer = document.createElement('div');
  documentContainer.className = 'document-container';
  
  // Crea il primo blocco di testo se è una nuova nota
  let documentHtml = '';
  if (note.querySelector('.note-content')) {
    documentHtml = note.querySelector('.note-content').innerHTML;
  }
  
  if (!documentHtml.trim()) {
    documentHtml = '<div class="note-block block-paragraph"><div class="block-content" contenteditable="true" data-placeholder="Inizia a scrivere..."></div></div>';
  } else if (!documentHtml.includes('note-block')) {
    // Converte il contenuto semplice in un blocco
    documentHtml = `<div class="note-block block-paragraph"><div class="block-content" contenteditable="true">${documentHtml}</div></div>`;
  }
  
  documentContainer.innerHTML = documentHtml;
  
  // Imposta gli event handler per i blocchi
  documentContainer.querySelectorAll('.note-block').forEach(block => {
    setupBlockEventHandlers(block);
  });
  
  // Aggiungi il container del documento all'overlay
  documentContent.appendChild(documentContainer);
  overlay.appendChild(documentContent);
  
  // Aggiungi la barra di stato in basso
  const statusBar = document.createElement('div');
  statusBar.className = 'document-status-bar';
  
  const statusInfo = document.createElement('div');
  statusInfo.className = 'document-status-info';
  statusBar.appendChild(statusInfo);
  
  overlay.appendChild(statusBar);
  
  // Aggiorna il conteggio delle parole
  updateDocumentWordCount(documentContainer);
  
  // Metti il focus sul primo blocco di contenuto
  setTimeout(() => {
    const firstBlock = documentContainer.querySelector('.block-content');
    if (firstBlock) {
      firstBlock.focus();
    }
  }, 100);
}

// Funzione per uscire dalla modalità documento
function exitDocumentMode() {
  console.log('Uscendo dalla modalità documento');
  
  // Ripristina la visibilità degli elementi del canvas
  restoreCanvasElements();
  
  // Trova l'overlay e la nota associata
  const overlay = document.querySelector('.document-mode-overlay');
  if (!overlay) {
    console.warn('Overlay della modalità documento non trovato');
    return;
  }
  
  const noteId = overlay.getAttribute('data-note-id');
  const note = document.getElementById(noteId);
  
  if (note) {
    // Trasferisci il contenuto dall'overlay alla nota
    const documentContainer = overlay.querySelector('.document-container');
    const blocks = documentContainer.querySelectorAll('.note-block');
    
    // Ottieni il contenitore dei blocchi della nota
    const noteContent = note.querySelector('.note-content');
    
    // Pulisci il contenuto della nota
    noteContent.innerHTML = '';
    
    // Aggiungi i blocchi aggiornati alla nota
    blocks.forEach(block => {
      const clonedBlock = block.cloneNode(true);
      
      // Ripristina gli event handler
      setupBlockEventHandlers(clonedBlock);
      
      noteContent.appendChild(clonedBlock);
    });
    
    // Aggiorna il titolo della nota
    const documentTitle = overlay.querySelector('.document-title-input');
    const noteTitle = note.querySelector('.note-title');
    
    if (documentTitle && noteTitle) {
      noteTitle.textContent = documentTitle.value;
    }
    
    // Salva lo stato della nota
    saveNoteState(noteId);
  }
  
  // Rimuovi l'overlay
  overlay.remove();
  
  // Rimuovi la classe document-mode dal body
  document.body.classList.remove('document-mode');
  
  // Ripristina l'interattività del canvas
  document.querySelectorAll('.workspace-note, .workspace-ai-node, svg.connector').forEach(el => {
    el.style.visibility = 'visible';
    el.style.opacity = '1'; // Assicurati che non ci siano opacità residue
    el.style.display = ''; // Ripristina il display a default
  });
  
  // Forza un aggiornamento del canvas per risolvere eventuali problemi di visualizzazione
  setTimeout(() => {
    updateCanvasTransform();
    updateAllConnections();
  }, 100);
  
  // Ripristina la nota attiva
  if (note) {
    setActiveNote(noteId);
    
    // Forza la visualizzazione della nota corretta
    note.style.visibility = 'visible';
    note.style.opacity = '1';
  }
}

// Funzione per alternare tra tema chiaro e scuro nella modalità documento
function toggleDocumentTheme() {
  console.log('Cambio del tema del documento');
  
  const overlay = document.querySelector('.document-mode-overlay');
  if (!overlay) return;
  
  // Ottieni il pulsante del tema
  const themeToggle = overlay.querySelector('.document-top-toolbar-right .document-toolbar-btn');
  if (!themeToggle) return;
  
  // Cambia il tema
  if (document.body.classList.contains('dark-theme')) {
    // Passa al tema chiaro
    document.body.classList.remove('dark-theme');
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    themeToggle.title = 'Passa al tema scuro';
    console.log('Tema documento cambiato in chiaro');
  } else {
    // Passa al tema scuro
    document.body.classList.add('dark-theme');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    themeToggle.title = 'Passa al tema chiaro';
    console.log('Tema documento cambiato in scuro');
  }
}

// Funzione per ottenere il blocco attualmente focalizzato
function getFocusedBlock() {
  const documentOverlay = document.querySelector('.document-mode-overlay');
  if (!documentOverlay) return null;
  
  // Cerca il blocco che contiene l'elemento attualmente focalizzato
  const focusedElement = document.activeElement;
  if (!focusedElement || !documentOverlay.contains(focusedElement)) return null;
  
  // Cerca il blocco di cui l'elemento focalizzato fa parte
  let blockElement = focusedElement;
  
  // Risali nella gerarchia del DOM finché non trovi il blocco
  while (blockElement && !blockElement.classList.contains('note-block') && blockElement !== documentOverlay) {
    blockElement = blockElement.parentElement;
  }
  
  // Se abbiamo raggiunto l'overlay senza trovare un blocco, restituisci null
  if (!blockElement || blockElement === documentOverlay) return null;
  
  return blockElement;
}

// Funzione per applicare un diverso stile di blocco
function applyBlockStyle(block, blockType) {
  if (!block) return;
  
  // Salva il contenuto e la posizione del cursore
  const blockContent = block.querySelector('.block-content');
  if (!blockContent) return;
  
  const content = blockContent.innerHTML;
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  
  // Rimuovi tutte le classi di tipo blocco
  const blockTypeClasses = ['block-paragraph', 'block-heading', 'block-subheading', 'block-quote', 
                          'block-callout', 'block-code', 'block-divider', 'block-to-do'];
  blockTypeClasses.forEach(cls => block.classList.remove(cls));
  
  // Applica la classe per il nuovo tipo di blocco
  block.classList.add(`block-${blockType}`);
  
  // Gestisci tipi di blocco specifici
  switch (blockType) {
    case 'paragraph':
      convertBlockToParagraph(block);
      break;
    case 'heading':
      convertBlockToHeading(block);
      break;
    case 'subheading':
      convertBlockToSubheading(block);
      break;
    case 'quote':
      if (!block.classList.contains('block-quote')) {
        blockContent.innerHTML = content;
      }
      break;
    case 'callout':
      if (!block.classList.contains('block-callout')) {
        const calloutContent = document.createElement('div');
        calloutContent.className = 'block-content';
        calloutContent.innerHTML = content;
        calloutContent.contentEditable = true;
        
        // Svuota il blocco e aggiungi il nuovo contenuto
        block.innerHTML = '';
        block.appendChild(calloutContent);
      }
      break;
    case 'code':
      convertBlockToCode(block);
      break;
    case 'divider':
      convertBlockToDivider(block);
      break;
    case 'to-do':
      convertBlockToToDo(block);
      break;
  }
  
  // Mostra lo stato "Salvando..."
  showSavingStatus();
  
  // Cerca di ripristinare la posizione del cursore se possibile
  try {
    const newContent = block.querySelector('.block-content');
    if (newContent && document.body.contains(newContent)) {
      newContent.focus();
      // Ripristina il cursore se possibile
      if (range && range.startContainer) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  } catch (e) {
    console.log('Errore nel ripristino del cursore:', e);
  }
}

// Funzione per iniziare il trascinamento di un blocco
function handleBlockDragStart(e) {
  if (e.button !== 0) return; // Solo click sinistro
  
  e.preventDefault();
  e.stopPropagation();
  
  // Il blocco viene trascinato
  const handle = e.target;
  const block = handle.closest('.note-block');
  if (!block) return;
  
  // Salva il blocco come quello che stiamo trascinando
  draggingBlock = block;
  
  // Memorizza la posizione di partenza del mouse
  blockDragStartY = e.clientY;
  
  // Memorizza la posizione del mouse relativa al blocco
  mouseOffsetY = e.clientY - block.getBoundingClientRect().top;
  mouseOffsetX = e.clientX - block.getBoundingClientRect().left;
  
  // Crea o ottieni il blocco overlay per il trascinamento (clone visuale)
  if (!blockDragOverlay) {
    blockDragOverlay = document.createElement('div');
    blockDragOverlay.className = 'block-drag-overlay';
    document.body.appendChild(blockDragOverlay);
  }
  
  // Copia lo stile e il contenuto dal blocco originale
  blockDragOverlay.innerHTML = block.innerHTML;
  blockDragOverlay.style.width = block.offsetWidth + 'px';
  blockDragOverlay.style.height = block.offsetHeight + 'px';
  blockDragOverlay.style.left = block.getBoundingClientRect().left + 'px';
  blockDragOverlay.style.top = block.getBoundingClientRect().top + 'px';
  blockDragOverlay.style.display = 'block';
  
  // Nascondi temporaneamente il blocco originale o rendilo trasparente
  block.style.opacity = '0.3';
  
  // Crea il segnaposto per mostrare dove verrà inserito il blocco
  if (!blockDragPlaceholder) {
    blockDragPlaceholder = document.createElement('div');
    blockDragPlaceholder.className = 'block-drag-placeholder';
  }
  
  // Inserisci il segnaposto prima del blocco corrente
  block.parentNode.insertBefore(blockDragPlaceholder, block);
  blockDragPlaceholder.style.height = block.offsetHeight + 'px';
  blockDragPlaceholder.style.display = 'block';
  
  // Memorizza la posizione attuale del mouse per l'animazione fluida
  lastMouseY = e.clientY;
  
  // Bind delle funzioni di gestione del movimento e del rilascio
  handleBlockDragMoveBound = handleBlockDragMove.bind(this);
  handleBlockDragEndBound = handleBlockDragEnd.bind(this);
  
  // Aggiungi i listener per il movimento e il rilascio
  document.addEventListener('mousemove', handleBlockDragMoveBound);
  document.addEventListener('mouseup', handleBlockDragEndBound);
  
  // Funzione di supporto per il movimento fluido durante il trascinamento
  function animateDrag() {
    if (!draggingBlock) return;
    
    // Aggiorna la posizione dell'overlay
    blockDragOverlay.style.top = (currentDragY - mouseOffsetY) + 'px';
    blockDragOverlay.style.left = (currentDragX - mouseOffsetX) + 'px';
    
    // Richiedi il prossimo frame se stiamo ancora trascinando
    if (draggingBlock) {
      blockAnimationFrame = requestAnimationFrame(animateDrag);
    }
  }
  
  // Avvia l'animazione
  blockAnimationFrame = requestAnimationFrame(animateDrag);
}

// Funzione per gestire il movimento durante il trascinamento del blocco
function handleBlockDragMove(e) {
  e.preventDefault();
  
  if (!draggingBlock || !blockDragOverlay) return;
  
  // Aggiorna la posizione attuale per l'animazione
  currentDragX = e.clientX;
  currentDragY = e.clientY;
  
  // Trova il container dei blocchi
  const container = draggingBlock.parentNode;
  if (!container) return;
  
  // Ottieni tutti i blocchi nel container
  const blocks = Array.from(container.querySelectorAll('.note-block'));
  const blockIndex = blocks.indexOf(draggingBlock);
  
  // Determina se spostare il segnaposto
  for (let i = 0; i < blocks.length; i++) {
    // Salta il blocco che stiamo trascinando
    if (blocks[i] === draggingBlock) continue;
    
    const rect = blocks[i].getBoundingClientRect();
    const blockMiddle = rect.top + rect.height / 2;
    
    // Se il mouse è sopra questo blocco, sposta il segnaposto
    if (e.clientY < blockMiddle && i < blockIndex) {
      container.insertBefore(blockDragPlaceholder, blocks[i]);
      break;
    } else if (e.clientY >= blockMiddle && i > blockIndex) {
      // Se siamo dopo l'ultimo elemento
      if (i === blocks.length - 1) {
        container.appendChild(blockDragPlaceholder);
      } else {
        container.insertBefore(blockDragPlaceholder, blocks[i + 1]);
      }
      break;
    }
  }
}

// Funzione per terminare il trascinamento del blocco
function handleBlockDragEnd(e) {
  if (!draggingBlock) return;
  
  // Rimuovi i listener di evento
  document.removeEventListener('mousemove', handleBlockDragMoveBound);
  document.removeEventListener('mouseup', handleBlockDragEndBound);
  
  // Annulla l'animazione
  if (blockAnimationFrame) {
    cancelAnimationFrame(blockAnimationFrame);
    blockAnimationFrame = null;
  }
  
  // Sposta il blocco nella nuova posizione
  if (blockDragPlaceholder && blockDragPlaceholder.parentNode) {
    blockDragPlaceholder.parentNode.insertBefore(draggingBlock, blockDragPlaceholder);
    blockDragPlaceholder.parentNode.removeChild(blockDragPlaceholder);
  }
  
  // Ripristina lo stile del blocco
  draggingBlock.style.opacity = '1';
  
  // Nascondi l'overlay di trascinamento
  if (blockDragOverlay) {
    blockDragOverlay.style.display = 'none';
  }
  
  // Resetta le variabili
  draggingBlock = null;
  blockDragStartY = 0;
  mouseOffsetY = 0;
  mouseOffsetX = 0;
  
  // Aggiorna il conteggio delle parole e salva se siamo in modalità documento
  if (document.body.classList.contains('document-mode')) {
    const overlay = document.querySelector('.document-mode-overlay');
    if (overlay) {
      const documentContainer = overlay.querySelector('.document-container');
      if (documentContainer) {
        updateDocumentWordCount(documentContainer);
        
        // Salva lo stato della nota
        const noteId = overlay.getAttribute('data-note-id');
        if (noteId) {
          saveNoteState(noteId);
        }
      }
    }
  }
}