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
  initializeWorkflow();
};

// Esponi la funzione setupNoteTitleEditing globalmente
window.setupNoteTitleEditing = setupNoteTitleEditing;

// Esponi la funzione initializeAddBetweenButtons globalmente
window.initializeAddBetweenButtons = initializeAddBetweenButtons;

// Esponi la funzione createNewNote globalmente
window.createNewNote = createNewNote;

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
      createFolderTree(appSidebar);
      
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
    
    // Assicurati che il container occupi tutto lo spazio disponibile
    workflowContainer.style.width = '100%';
    workflowContainer.style.height = '100%';
    
    // Imposta l'event listener per il pulsante add-note-btn nella toolbar verticale
    const addNoteBtn = verticalToolbar.querySelector('.add-note-btn');
    if (addNoteBtn) {
    addNoteBtn.addEventListener('click', createNewNote);
    }
    
    // Imposta gli event listener per i pulsanti di zoom nella toolbar verticale
    const zoomInBtn = verticalToolbar.querySelector('.zoom-in-btn');
    const zoomOutBtn = verticalToolbar.querySelector('.zoom-out-btn');
    const resetViewBtn = verticalToolbar.querySelector('.reset-view-btn');
    
    if (zoomInBtn) {
      zoomInBtn.addEventListener('click', () => {
        canvasScale *= 1.2;
        updateCanvasTransform();
      });
    }
    
    if (zoomOutBtn) {
      zoomOutBtn.addEventListener('click', () => {
        canvasScale *= 0.8;
        updateCanvasTransform();
      });
    }
    
    if (resetViewBtn) {
      resetViewBtn.addEventListener('click', () => {
        canvasScale = 1;
        canvasOffsetX = 0;
        canvasOffsetY = 0;
        updateCanvasTransform();
      });
    }
    
    // Crea la minimappa come elemento fisso in basso a destra
    createMinimap(centerContainer);
    
    // Crea la sidebar destra con chat AI
    const rightSidebar = document.createElement('div');
    rightSidebar.className = 'workflow-right-sidebar';
    mainLayout.appendChild(rightSidebar);
    
    // Aggiungi il pulsante per mostrare/nascondere la sidebar destra
    const toggleRightSidebarBtn = document.createElement('button');
    toggleRightSidebarBtn.className = 'toggle-right-sidebar-btn';
    toggleRightSidebarBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    toggleRightSidebarBtn.addEventListener('click', () => {
      rightSidebar.classList.toggle('collapsed');
      if (rightSidebar.classList.contains('collapsed')) {
        toggleRightSidebarBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
      } else {
        toggleRightSidebarBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
      }
    });
    rightSidebar.appendChild(toggleRightSidebarBtn);
    
    // Crea la chat AI nella sidebar destra
    createAIChat(rightSidebar);
    
    // Set up event listeners for dragging and resizing notes/nodes
    setupWorkflowInteractions(workspaceArea);
    
    // Aggiungi event listener per lo zoom con la rotella del mouse
    workspaceArea.addEventListener('wheel', handleMouseWheel, { passive: false });
    
    // Aggiungi event listener per il panning del canvas
    workspaceArea.addEventListener('mousedown', handleCanvasMouseDown);
    // Mouse move e mouse up vengono aggiunti globalmente quando il panning inizia
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

// Funzione per gestire lo zoom con la rotella del mouse
function handleMouseWheel(e) {
  e.preventDefault();
  
  // Determina la direzione dello scroll
  const delta = e.deltaY > 0 ? -1 : 1;
  
  // Fattore di zoom più piccolo per un'esperienza più fluida
  const zoomFactor = 1.05;
  
  // Calcola il nuovo scale
  const newScale = delta > 0 ? canvasScale * zoomFactor : canvasScale / zoomFactor;
  
  // Limita lo zoom per evitare valori estremi
  if (newScale > 0.1 && newScale < 10) {
    // Ottieni la posizione del mouse rispetto al workspace
    const workspace = document.getElementById('workflowWorkspace');
    const rect = workspace.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Calcola l'offset relativo al mouse per uno zoom centrato sul punto
    const scaleChange = newScale / canvasScale;
    const newOffsetX = mouseX - (mouseX - canvasOffsetX) * scaleChange;
    const newOffsetY = mouseY - (mouseY - canvasOffsetY) * scaleChange;
    
    // Aggiorna i valori globali
    canvasScale = newScale;
    canvasOffsetX = newOffsetX;
    canvasOffsetY = newOffsetY;
    
    // Aggiorna la trasformazione
    updateCanvasTransform();
  }
}

// Funzione per aggiornare la trasformazione del canvas
function updateCanvasTransform() {
  const workspace = document.getElementById('workflowWorkspace');
  if (workspace) {
    workspace.style.transform = `translate(${canvasOffsetX}px, ${canvasOffsetY}px) scale(${canvasScale})`;
    updateMinimap();
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

// Aggiorna la minimappa con la posizione attuale del workspace
function updateMinimap() {
  if (!minimap || !minimapViewport) return;
  
  const workspace = document.getElementById('workflowWorkspace');
  if (!workspace) return;
  
  // Ottieni tutte le note nel workspace
  const notes = workspace.querySelectorAll('.workspace-note, .workspace-ai-node');
  
  // Aggiorna il contenuto della minimappa
  const minimapContent = minimap.querySelector('.workflow-minimap-content');
  if (minimapContent) {
    // Pulisci il contenuto precedente
    minimapContent.innerHTML = '';
    
    // Se non ci sono note, non c'è nulla da visualizzare
    if (notes.length === 0) return;
    
    // Calcola i limiti del contenuto
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    notes.forEach(note => {
      const rect = note.getBoundingClientRect();
      const workspaceRect = workspace.getBoundingClientRect();
      
      // Posizione nel sistema di coordinate del workspace
      const noteX = (rect.left - workspaceRect.left) / canvasScale - canvasOffsetX / canvasScale;
      const noteY = (rect.top - workspaceRect.top) / canvasScale - canvasOffsetY / canvasScale;
      const noteWidth = rect.width / canvasScale;
      const noteHeight = rect.height / canvasScale;
      
      // Aggiorna i limiti
      minX = Math.min(minX, noteX);
      minY = Math.min(minY, noteY);
      maxX = Math.max(maxX, noteX + noteWidth);
      maxY = Math.max(maxY, noteY + noteHeight);
      
      // Crea una rappresentazione nella minimappa
      const miniNote = document.createElement('div');
      miniNote.className = note.classList.contains('workspace-note') ? 'minimap-note' : 'minimap-node';
      
      // Applica posizione e dimensioni scalate
      miniNote.style.position = 'absolute';
      miniNote.style.backgroundColor = note.classList.contains('workspace-note') ? '#5c5cff' : '#ff5c5c';
      
      minimapContent.appendChild(miniNote);
    });
    
    // Calcola le dimensioni totali del contenuto
    const contentWidth = Math.max(1000, maxX - minX);
    const contentHeight = Math.max(600, maxY - minY);
    
    // Calcola il fattore di scala per la minimappa
    const minimapWidth = minimap.offsetWidth;
    const minimapHeight = minimap.offsetHeight;
    minimapScale = Math.min(minimapWidth / contentWidth, minimapHeight / contentHeight) * 0.9;
    
    // Aggiorna le posizioni delle note nella minimappa
    notes.forEach((note, index) => {
      const rect = note.getBoundingClientRect();
      const workspaceRect = workspace.getBoundingClientRect();
      
      // Posizione nel sistema di coordinate del workspace
      const noteX = (rect.left - workspaceRect.left) / canvasScale - canvasOffsetX / canvasScale;
      const noteY = (rect.top - workspaceRect.top) / canvasScale - canvasOffsetY / canvasScale;
      const noteWidth = rect.width / canvasScale;
      const noteHeight = rect.height / canvasScale;
      
      // Applica posizione e dimensioni scalate
      const miniNote = minimapContent.children[index];
      miniNote.style.left = ((noteX - minX) * minimapScale) + 'px';
      miniNote.style.top = ((noteY - minY) * minimapScale) + 'px';
      miniNote.style.width = (noteWidth * minimapScale) + 'px';
      miniNote.style.height = (noteHeight * minimapScale) + 'px';
    });
    
    // Aggiorna il viewport della minimappa
    const viewportWidth = Math.min(minimapWidth / minimapScale, contentWidth) * minimapScale;
    const viewportHeight = Math.min(minimapHeight / minimapScale, contentHeight) * minimapScale;
    
    // Posiziona il viewport in base alla posizione corrente della vista
    const viewportX = ((-canvasOffsetX / canvasScale) - minX) * minimapScale;
    const viewportY = ((-canvasOffsetY / canvasScale) - minY) * minimapScale;
    
    // Applica dimensioni e posizione del viewport
    minimapViewport.style.width = viewportWidth + 'px';
    minimapViewport.style.height = viewportHeight + 'px';
    minimapViewport.style.left = Math.max(0, Math.min(minimapWidth - viewportWidth, viewportX)) + 'px';
    minimapViewport.style.top = Math.max(0, Math.min(minimapHeight - viewportHeight, viewportY)) + 'px';
  }
}

// Setup event listeners for dragging, resizing, and clicking (NOTES/NODES)
function setupWorkflowInteractions(workspace) {
  // 1. Handle note/node dragging (mousedown is handled by specific elements like headers)
  // workspace.addEventListener('mousedown', handleNoteMouseDown); // Moved specific handlers
  document.addEventListener('mousemove', handleNoteMouseMove); // Handles both note/node move
  document.addEventListener('mouseup', handleNoteMouseUp); // Handles both note/node mouseup

  // 2. Handle clicking inside notes and blocks (for selection/focus)
  workspace.addEventListener('click', handleWorkspaceClick);
  
  // 3. Handle note content edits
  workspace.addEventListener('input', handleNoteContentEdit);
  
  // 4. Handle keydown in blocks
  workspace.addEventListener('keydown', handleBlockKeyDown);
  
  // 5. Handle block drag & drop
  workspace.addEventListener('mousedown', handleBlockDragStart);
  
  // 6. Prevent default drag behavior for images
  workspace.addEventListener('dragstart', (e) => {
    if (e.target.tagName === 'IMG') {
      e.preventDefault();
    }
  });
  
  // Close block menu when clicking outside
  document.addEventListener('click', (e) => {
    const addBlockMenu = document.querySelector('.add-block-menu');
    if (addBlockMenu && !e.target.closest('.add-block-menu') && !e.target.closest('.block-action') && !e.target.closest('.workflow-vertical-toolbar')) {
      addBlockMenu.remove();
      addBlockMenuOpen = false;
    }
  });
  
  // Initialize Add Between buttons on note insertion
  workspace.addEventListener('DOMNodeInserted', (e) => {
    if (e.target.classList && e.target.classList.contains('workspace-note')) {
      initializeAddBetweenButtons(e.target);
      const noteTitle = e.target.querySelector('.note-title');
      if (noteTitle) {
        setupNoteTitleEditing(noteTitle, e.target.id);
      }
    }
  });
}

// Handle mousedown on CANVAS BACKGROUND for panning
function handleCanvasMouseDown(e) {
  // Check if the click was directly on the workspace background
  // or on the grid pseudo-element, avoiding notes, nodes, toolbar, etc.
  if (e.target.id === 'workflowWorkspace') {
    // Check for middle mouse button or specific pan activation (e.g., spacebar + click)
    // For now, let's use the primary button (left click)
    if (e.button === 0) { 
      isDraggingCanvas = true;
      canvasDragStartX = e.clientX;
      canvasDragStartY = e.clientY;
      // Store initial offset for smoother drag calculation
      initialCanvasOffsetX = canvasOffsetX;
      initialCanvasOffsetY = canvasOffsetY;
      
      const workspace = document.getElementById('workflowWorkspace');
      if(workspace) workspace.classList.add('panning');

      // Add global listeners for move and up
      document.addEventListener('mousemove', handleCanvasMouseMove);
      document.addEventListener('mouseup', handleCanvasMouseUp);
      
      e.preventDefault(); // Prevent text selection or other default actions
    }
  }
}

// Handle mouse move for CANVAS PANNING
function handleCanvasMouseMove(e) {
  if (!isDraggingCanvas) return;

  e.preventDefault();

  const deltaX = e.clientX - canvasDragStartX;
  const deltaY = e.clientY - canvasDragStartY;

  // Update canvas offset: Move canvas content opposite to mouse direction
  // Use initial offsets for direct mapping from start point
  canvasOffsetX = initialCanvasOffsetX + deltaX;
  canvasOffsetY = initialCanvasOffsetY + deltaY;

  // Apply the new transform
  updateCanvasTransform();
}

// Handle mouse up for CANVAS PANNING
function handleCanvasMouseUp(e) {
  if (isDraggingCanvas) {
    isDraggingCanvas = false;
    const workspace = document.getElementById('workflowWorkspace');
      if(workspace) workspace.classList.remove('panning');
      
    // Remove global listeners
    document.removeEventListener('mousemove', handleCanvasMouseMove);
    document.removeEventListener('mouseup', handleCanvasMouseUp);
    
    e.preventDefault();
  }
}


// Gestisce il movimento durante il trascinamento della minimappa
function handleMinimapMouseMove(e) {
  if (!isDraggingMinimap) return;

  e.preventDefault();

  const minimapRect = minimap.getBoundingClientRect();
  const minimapContent = minimap.querySelector('.workflow-minimap-content');
  if (!minimapContent) return;
  
  // Calculate mouse position relative to minimap content area
  let relativeX = e.clientX - minimapRect.left;
  let relativeY = e.clientY - minimapRect.top;
  
  // Clamp position within minimap bounds
  relativeX = Math.max(0, Math.min(minimapRect.width, relativeX));
  relativeY = Math.max(0, Math.min(minimapRect.height, relativeY));
  
  // Calculate the corresponding center position in the workspace coordinates
  const workspaceCenterX = (relativeX / minimapScale) + contentMinX; // Need contentMinX from updateMinimap
  const workspaceCenterY = (relativeY / minimapScale) + contentMinY; // Need contentMinY from updateMinimap
  
  // Calculate the required offset to center the view on this point
  const viewportWidth = window.innerWidth / canvasScale;
  const viewportHeight = window.innerHeight / canvasScale;
  
  canvasOffsetX = -(workspaceCenterX - viewportWidth / 2) * canvasScale;
  canvasOffsetY = -(workspaceCenterY - viewportHeight / 2) * canvasScale;
  
  updateCanvasTransform();
}

// Setup note title editing with proper saving
function setupNoteTitleEditing(titleElement, noteId) {
  // Ensure the contentEditable is set
  titleElement.contentEditable = true;

  // Store the initial title if not already set
  if (!(noteId in noteTitles)) {
      noteTitles[noteId] = titleElement.textContent || 'Nuova Nota';
  }

  // Handle focus entering the title
  titleElement.addEventListener('focus', () => {
    // Select all text when focused
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(titleElement);
    selection.removeAllRanges();
    selection.addRange(range);

    // Add the editing class
    titleElement.classList.add('editing');
  });

  // Handle focus leaving the title - Save only if changed
  titleElement.addEventListener('blur', () => {
    titleElement.classList.remove('editing');
    const originalTitle = noteTitles[noteId]; // Get the last saved title
    let newTitle = titleElement.textContent.trim();

    // If the title is empty after trimming, revert to the last saved title or default
    if (!newTitle) {
      newTitle = originalTitle || 'Nuova Nota';
      titleElement.textContent = newTitle; // Update the element visually
    }

    // Save the potentially updated title only if it actually changed
    if (originalTitle !== newTitle) {
        console.log(`Saving title for note ${noteId}: '${newTitle}' (was '${originalTitle}')`);
        noteTitles[noteId] = newTitle;
        // Trigger saveNoteState to persist the title change along with other note data
        saveNoteState(noteId);
    }
  });

  // Handle Enter key to finish editing
  titleElement.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent creating new line
      titleElement.blur(); // Remove focus to trigger blur (and save)
    }
  });

  // Remove the input listener - saving on blur is sufficient and more performant
  // titleElement.addEventListener('input', () => {
  //   const newTitle = titleElement.textContent.trim();
  //   noteTitles[noteId] = newTitle || 'Nuova Nota';
  // });
}

// Handle mousedown on notes for dragging and resizing
function handleNoteMouseDown(e) {
  console.log('MouseDown event:', {
    type: e.type, 
    target: e.target, 
    timestamp: new Date().toISOString(),
    position: {x: e.clientX, y: e.clientY},
    note: e.target.closest('.workspace-note')?.id
  });
  // Windows 11 specific: ensure we have a valid event
  if (!e || !e.clientX || !e.clientY) return;
  
  // Find if we're clicking on a note or inside a note
  const note = e.target.closest('.workspace-note');
  if (!note) return;

  // Set active note
  setActiveNote(note.id);

  // Check if we're clicking a resize handle
  const resizeHandle = e.target.closest('.resize-handle, .note-resize-handle');
  if (resizeHandle) {
    resizingNote = note;

    // Get the resize direction from the handle's class
    if (resizeHandle.classList.contains('top-left')) resizeDirection = 'top-left';
    else if (resizeHandle.classList.contains('top-right')) resizeDirection = 'top-right';
    else if (resizeHandle.classList.contains('bottom-left')) resizeDirection = 'bottom-left';
    else if (resizeHandle.classList.contains('bottom-right') || resizeHandle.classList.contains('note-resize-handle')) resizeDirection = 'bottom-right';
    else if (resizeHandle.classList.contains('top')) resizeDirection = 'top';
    else if (resizeHandle.classList.contains('right')) resizeDirection = 'right';
    else if (resizeHandle.classList.contains('bottom')) resizeDirection = 'bottom';
    else if (resizeHandle.classList.contains('left')) resizeDirection = 'left';

    // Store initial mouse position and note size/position
    initialMouseX = e.clientX;
    initialMouseY = e.clientY;
    initialNoteRect = note.getBoundingClientRect(); // Use rect for size calculation
    const computedStyle = window.getComputedStyle(note);
    const matrix = new DOMMatrix(computedStyle.transform);
    initialNoteTransform = { x: matrix.m41, y: matrix.m42 }; // Store initial transform for position calculation

    // Add resizing class to the body to enable the overlay
    document.body.classList.add('resizing');
    note.classList.add('resizing');
    note.style.willChange = 'transform, width, height'; // Optimize resizing

    // Create an overlay to capture mouse events outside the note
    let overlay = document.querySelector('.resize-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'resize-overlay';
      document.body.appendChild(overlay);
    }

    // Set the cursor on the overlay based on resize direction
    if (resizeDirection === 'top-left' || resizeDirection === 'bottom-right') overlay.style.cursor = 'nwse-resize';
    else if (resizeDirection === 'top-right' || resizeDirection === 'bottom-left') overlay.style.cursor = 'nesw-resize';
    else if (resizeDirection === 'top' || resizeDirection === 'bottom') overlay.style.cursor = 'ns-resize';
    else if (resizeDirection === 'left' || resizeDirection === 'right') overlay.style.cursor = 'ew-resize';

    e.preventDefault();
    return;
  }

  // Check if we're clicking the header (for dragging)
  const header = e.target.closest('.note-header');
  const title = e.target.closest('.note-title'); // Check if click is on editable title

  // Start dragging only if clicking header but NOT the editable title itself
  if (header && (!title || !title.isContentEditable || title.classList.contains('editing') === false)) {
    draggedNote = note;
    const workspace = document.getElementById('workflowWorkspace');
    if (!workspace) return;
    const workspaceRect = workspace.getBoundingClientRect();

    // Store initial transform for smooth continuation of movement
    const computedStyle = window.getComputedStyle(note);
    const matrix = new DOMMatrix(computedStyle.transform || 'matrix(1, 0, 0, 1, 0, 0)');
    initialNoteTransform = { x: matrix.m41, y: matrix.m42 };

    // Calculate offset relative to the note's top-left corner, considering transform
    dragOffsetX = e.clientX - workspaceRect.left - initialNoteTransform.x;
    dragOffsetY = e.clientY - workspaceRect.top - initialNoteTransform.y;

    // Apply dragging class and improve GPU acceleration
    note.classList.add('dragging');
    note.style.zIndex = "100"; // Bring to front
    note.style.willChange = "transform"; // Hint browser for optimization
    document.body.classList.add('dragging-note'); // Global cursor

    // Initialize current drag position to the starting transform
    currentDragX = initialNoteTransform.x;
    currentDragY = initialNoteTransform.y;

    // Start the animation frame loop for dragging
    if (!rafId) {
      rafId = requestAnimationFrame(updateDraggedNotePosition);
    }

    e.preventDefault(); // Prevent text selection during drag
  }
}

// Handle note mouse move with optimized performance
function handleNoteMouseMove(e) {
  console.log('MouseMove event:', {
    type: e.type,
    timestamp: new Date().toISOString(),
    position: {x: e.clientX, y: e.clientY},
    draggedNote: draggedNote?.id,
    dragOffset: {x: dragOffsetX, y: dragOffsetY}
  });
  // Windows 11 specific: ensure we have a valid event
  if (!e || !e.clientX || !e.clientY) return;
  
  // 1. Handle Resizing (using transform)
  if (resizingNote && initialNoteRect && initialNoteTransform) {
    const dx = e.clientX - initialMouseX;
    const dy = e.clientY - initialMouseY;
    let newWidth = initialNoteRect.width;
    let newHeight = initialNoteRect.height;
    let newX = initialNoteTransform.x;
    let newY = initialNoteTransform.y;

    // Define minimum size
    const minWidth = 150;
    const minHeight = 100;

    // Adjust dimensions and position based on resize direction
    if (resizeDirection.includes('right')) {
      newWidth = Math.max(minWidth, initialNoteRect.width + dx);
    } else if (resizeDirection.includes('left')) {
      const potentialWidth = initialNoteRect.width - dx;
      if (potentialWidth >= minWidth) {
        newWidth = potentialWidth;
        newX = initialNoteTransform.x + dx;
      } else {
        newWidth = minWidth;
        newX = initialNoteTransform.x + (initialNoteRect.width - minWidth);
      }
    }

    if (resizeDirection.includes('bottom')) {
      newHeight = Math.max(minHeight, initialNoteRect.height + dy);
    } else if (resizeDirection.includes('top')) {
      const potentialHeight = initialNoteRect.height - dy;
      if (potentialHeight >= minHeight) {
        newHeight = potentialHeight;
        newY = initialNoteTransform.y + dy;
      } else {
        newHeight = minHeight;
        newY = initialNoteTransform.y + (initialNoteRect.height - minHeight);
      }
    }

    // Apply new styles using transform and requestAnimationFrame
    // Cancel previous frame to avoid backlog, apply in next available frame
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
        if (!resizingNote) return; // Check if resizing was cancelled
        resizingNote.style.width = `${newWidth}px`;
        resizingNote.style.height = `${newHeight}px`;
        resizingNote.style.transform = `translate(${newX}px, ${newY}px)`;
    });

    e.preventDefault();
    return;
  }

  // 2. Handle Dragging (Update target position for animation frame)
  if (draggedNote) {
    const workspace = document.getElementById('workflowWorkspace');
    if (!workspace) return;
    const workspaceRect = workspace.getBoundingClientRect();

    // Calculate new target position relative to the workspace
    currentDragX = e.clientX - workspaceRect.left - dragOffsetX;
    currentDragY = e.clientY - workspaceRect.top - dragOffsetY;

    // Optional: Constrain position within workspace boundaries (add margin)
    currentDragX = Math.max(30, currentDragX); // Ensure minimum left margin
    currentDragY = Math.max(0, currentDragY);
    // Consider adding right/bottom constraints if needed
    // const noteWidth = draggedNote.offsetWidth;
    // const noteHeight = draggedNote.offsetHeight;
    // currentDragX = Math.min(currentDragX, workspaceRect.width - noteWidth);
    // currentDragY = Math.min(currentDragY, workspaceRect.height - noteHeight);

    // The actual transform update happens in the updateDraggedNotePosition loop
    // Ensure the loop is running (it's started on mousedown)
    if (!rafId) {
        rafId = requestAnimationFrame(updateDraggedNotePosition);
    }

    e.preventDefault();
  }
}

// Handle end of drag or resize with proper cleanup
function handleNoteMouseUp(e) {
  console.log('MouseUp event:', {
    type: e.type,
    timestamp: new Date().toISOString(),
    position: {x: e.clientX, y: e.clientY},
    draggedNote: draggedNote?.id,
    resizingNote: resizingNote?.id
  });
  // 1. End Resizing
  if (resizingNote) {
    if (rafId) cancelAnimationFrame(rafId); // Cancel any pending resize frame
    rafId = null;

    // Apply final size/position from the last mouse move calculation before saving
    // This ensures the state reflects the visual state if mouseup happens between frames
    // Use clientX/Y from the event for final calculation
    const dx = e.clientX - initialMouseX;
    const dy = e.clientY - initialMouseY;
    let finalWidth = initialNoteRect.width;
    let finalHeight = initialNoteRect.height;
    let finalX = initialNoteTransform.x;
    let finalY = initialNoteTransform.y;
    const minWidth = 150, minHeight = 100;

    if (resizeDirection.includes('right')) finalWidth = Math.max(minWidth, initialNoteRect.width + dx);
    else if (resizeDirection.includes('left')) {
        const potentialWidth = initialNoteRect.width - dx;
        if (potentialWidth >= minWidth) { finalWidth = potentialWidth; finalX = initialNoteTransform.x + dx; }
        else { finalWidth = minWidth; finalX = initialNoteTransform.x + (initialNoteRect.width - minWidth); }
    }
    if (resizeDirection.includes('bottom')) finalHeight = Math.max(minHeight, initialNoteRect.height + dy);
    else if (resizeDirection.includes('top')) {
        const potentialHeight = initialNoteRect.height - dy;
        if (potentialHeight >= minHeight) { finalHeight = potentialHeight; finalY = initialNoteTransform.y + dy; }
        else { finalHeight = minHeight; finalY = initialNoteTransform.y + (initialNoteRect.height - minHeight); }
    }
    // Apply final calculated styles
    resizingNote.style.width = `${finalWidth}px`;
    resizingNote.style.height = `${finalHeight}px`;
    resizingNote.style.transform = `translate(${finalX}px, ${finalY}px)`;

    // Clean up styles and classes
    resizingNote.classList.remove('resizing');
    resizingNote.style.willChange = ''; // Remove optimization hint
    document.body.classList.remove('resizing');

    // Remove the overlay
    const overlay = document.querySelector('.resize-overlay');
    if (overlay) overlay.remove();

    // Save the new size and position
    saveNoteState(resizingNote.id);

    // Clear resizing state
    resizingNote = null;
    resizeDirection = null;
    initialNoteRect = null;
    initialNoteTransform = null;
    initialMouseX = 0;
    initialMouseY = 0;
    e.preventDefault();
    return;
  }

  // 2. End Dragging
  if (draggedNote) {
    // Stop the animation frame loop
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    // Apply the final calculated position directly before saving
    const workspace = document.getElementById('workflowWorkspace');
    if (workspace) {
        const workspaceRect = workspace.getBoundingClientRect();
        currentDragX = e.clientX - workspaceRect.left - dragOffsetX;
        currentDragY = e.clientY - workspaceRect.top - dragOffsetY;
        
        // Apply constraints for the final position
        currentDragX = Math.max(30, currentDragX);
        currentDragY = Math.max(0, currentDragY);
        
        // Ensure smooth transition by applying transform directly
        draggedNote.style.transform = `translate(${currentDragX}px, ${currentDragY}px)`;
        
        // Force layout update before saving state
        draggedNote.getBoundingClientRect();
    }

    // Remove dragging styles and hints
    draggedNote.classList.remove('dragging');
    draggedNote.style.zIndex = '';
    draggedNote.style.willChange = '';
    document.body.classList.remove('dragging-note');

    // Save the final position
    saveNoteState(draggedNote.id);

    // Clear all dragging state variables
    draggedNote = null;
    initialNoteTransform = null;
    dragOffsetX = 0;
    dragOffsetY = 0;
    currentDragX = 0;
    currentDragY = 0;

    e.preventDefault();
  }

  // 3. Always clean up any remaining states
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  document.body.classList.remove('dragging-note', 'resizing');
  const overlay = document.querySelector('.resize-overlay');
  if (overlay) overlay.remove();
// Reuse existing overlay reference from above
let resizeOverlay = document.querySelector('.resize-overlay');
  if (overlay) overlay.remove();
}

// Animation frame update function for smooth dragging
function updateDraggedNotePosition() {
  if (!draggedNote) {
    rafId = null; // Stop the loop if dragging stopped
    return;
  }

  // Apply the current target position using transform
  // Use translate for potentially better compatibility than translate3d if z is not needed
  draggedNote.style.transform = `translate(${currentDragX}px, ${currentDragY}px)`;

  // Request the next frame ONLY if still dragging
  rafId = requestAnimationFrame(updateDraggedNotePosition);
}

// Handle end of drag or resize with proper cleanup
function handleNoteMouseUp_Original(e) { // Renamed original function temporarily
  if (draggedNote) {
    // Cancel any pending animation frame
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    
    // Get current transform position
    const computedStyle = window.getComputedStyle(draggedNote);
    const matrix = new DOMMatrix(computedStyle.transform);
    
    // Apply final position as left/top after animation is done
    // IMPORTANT: This part is problematic and replaced by saving transform
    // draggedNote.style.left = `${matrix.m41}px`;
    // draggedNote.style.top = `${matrix.m42}px`;
    
    // Clean up
    draggedNote.classList.remove('dragging');
    draggedNote.style.zIndex = "";
    draggedNote.style.willChange = "";
    // Save state AFTER cleanup and applying final position
    saveNoteState(draggedNote.id);
    draggedNote = null;
  }
  
  if (resizingNote) {
    // Cancel any pending animation frame
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    
    // Get final transform position
    const computedStyle = window.getComputedStyle(resizingNote);
    const matrix = new DOMMatrix(computedStyle.transform);
    
    // Apply final position as left/top
    resizingNote.style.left = `${matrix.m41}px`;
    resizingNote.style.top = `${matrix.m42}px`;
    
    // Remove resizing class and overlay
    document.body.classList.remove('resizing');
    resizingNote.classList.remove('resizing');
    
    const overlay = document.querySelector('.resize-overlay');
    if (overlay && overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
    
    resizingNote.style.willChange = "";
    resizingNote = null;
    resizeDirection = null;
    initialMouseX = 0;
    initialMouseY = 0;
    initialNoteRect = null;
    initialNoteTransform = null;
  }
}

// Handle clicks inside the workspace
function handleWorkspaceClick(e) {
  // Se siamo in modalità documento, controlla se è stato cliccato fuori dal documento
  if (isDocumentMode) {
    const documentContent = document.querySelector('.document-content');
    if (documentContent && !documentContent.contains(e.target) && !e.target.closest('.document-toolbar')) {
      // Solo se è stato cliccato fuori dal contenuto e dalla toolbar, torniamo alla vista canvas
      exitDocumentMode();
      return;
    }
  }
  
  // Verifica se è stata cliccata una nota o un blocco di testo
  const noteBlock = e.target.closest('.note-block');
  if (noteBlock) {
    // Se è stata cliccata una nota, gestisci il click sul blocco
    handleNoteBlockClick(noteBlock);
    return;
  }
  
  // Deseleziona tutte le note se si clicca fuori
  const notes = document.querySelectorAll('.workspace-note');
  notes.forEach(note => note.classList.remove('selected'));
  
  // Deseleziona il blocco attualmente focalizzato
  if (blockFocused) {
    blockFocused.classList.remove('focused');
    blockFocused = null;
  }
  
  // Deseleziona la nota attiva
  activeNoteId = null;
}

// Gestisce il click su un blocco di una nota
function handleNoteBlockClick(block) {
  // Ottieni la nota contenente il blocco
  const note = block.closest('.workspace-note');
  if (!note) return;
  
  // Imposta la nota come attiva
  setActiveNote(note.id);
  
  // Se il blocco non è focalizzato, focalizzalo
  if (blockFocused !== block) {
    if (blockFocused) {
      blockFocused.classList.remove('focused');
    }
    
    block.classList.add('focused');
    blockFocused = block;
    
    // Focalizza il contenuto del blocco per l'editing
    const blockContent = block.querySelector('.block-content');
    if (blockContent && !blockContent.contains(document.activeElement)) {
      blockContent.focus();
    }
  }
  
  // Se è un doppio click sulla nota, passa alla modalità documento
  if (e.detail === 2) {
    enterDocumentMode(note);
  }
}

// Passa dalla vista canvas alla modalità documento
function enterDocumentMode(note) {
    const workspaceEl = document.querySelector('.workflow-workspace');
    
    // Store current workspace state to restore later
    const canvasState = {
        scrollTop: workspaceEl.scrollTop,
        scrollLeft: workspaceEl.scrollLeft,
        scale: canvasScale,
        translateX: canvasOffsetX,
        translateY: canvasOffsetY
    };
    sessionStorage.setItem('canvasState', JSON.stringify(canvasState));
    
    // Nascondi solo gli elementi del canvas, non l'intera applicazione
    document.querySelectorAll('.workspace-note, .workspace-ai-node, svg.connector').forEach(el => {
        el.style.visibility = 'hidden';
    });
    
    // Crea l'overlay del documento
    const overlay = document.createElement('div');
    overlay.className = 'document-mode-overlay';
    overlay.id = 'documentOverlay';
    
    // Ottieni il centro container, che è il parent del workspace
    const centerContainer = workspaceEl.parentElement;
    if (centerContainer) {
        // Inserisci l'overlay come figlio diretto del center container
        // Questo lo posizionerà correttamente sopra workspace e toolbar
        centerContainer.appendChild(overlay);
    } else {
        // Fallback al body se non troviamo il container
        document.body.appendChild(overlay);
    }
    
    // Create top toolbar
    const topToolbar = document.createElement('div');
    topToolbar.className = 'document-top-toolbar';
    
    const topToolbarLeft = document.createElement('div');
    topToolbarLeft.className = 'document-top-toolbar-left';
    
    const backBtn = document.createElement('button');
    backBtn.className = 'doc-back-btn';
    backBtn.innerHTML = '<i class="fas fa-arrow-left"></i>';
    backBtn.addEventListener('click', exitDocumentMode);
    
    const titleContainer = document.createElement('div');
    titleContainer.className = 'document-title-container';
    
    const titleInput = document.createElement('input');
    titleInput.className = 'document-title-input';
    titleInput.type = 'text';
    titleInput.value = note.querySelector('.note-title').textContent;
    titleInput.addEventListener('input', (e) => {
        note.querySelector('.note-title').textContent = e.target.value;
        showSavingStatus();
    });
    
    titleContainer.appendChild(titleInput);
    topToolbarLeft.appendChild(backBtn);
    topToolbarLeft.appendChild(titleContainer);
    
    const topToolbarRight = document.createElement('div');
    topToolbarRight.className = 'document-top-toolbar-right';
    
    const saveStatus = document.createElement('div');
    saveStatus.className = 'document-save-status';
    saveStatus.innerHTML = '<i class="fas fa-check-circle"></i> Saved';
    
    const shareBtn = document.createElement('button');
    shareBtn.className = 'document-toolbar-btn';
    shareBtn.innerHTML = '<i class="fas fa-share-alt"></i>';
    shareBtn.title = 'Share';
    
    const commentBtn = document.createElement('button');
    commentBtn.className = 'document-toolbar-btn';
    commentBtn.innerHTML = '<i class="fas fa-comment"></i>';
    commentBtn.title = 'Comments';
    
    const moreBtn = document.createElement('button');
    moreBtn.className = 'document-more-btn';
    moreBtn.innerHTML = '<i class="fas fa-ellipsis-h"></i>';
    moreBtn.title = 'More options';
    
    topToolbarRight.appendChild(saveStatus);
    topToolbarRight.appendChild(shareBtn);
    topToolbarRight.appendChild(commentBtn);
    topToolbarRight.appendChild(moreBtn);
    
    topToolbar.appendChild(topToolbarLeft);
    topToolbar.appendChild(topToolbarRight);
    
    // Create formatting toolbar
    const formatToolbar = document.createElement('div');
    formatToolbar.className = 'document-format-toolbar';
    
    // Text format options group
    const textFormatGroup = document.createElement('div');
    textFormatGroup.className = 'toolbar-group';
    
    const formatSelect = document.createElement('select');
    formatSelect.className = 'format-select';
    
    const options = [
        { value: 'paragraph', text: 'Normal text' },
        { value: 'heading', text: 'Heading 1' },
        { value: 'subheading', text: 'Heading 2' },
        { value: 'subheading3', text: 'Heading 3' }
    ];
    
    options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.text;
        formatSelect.appendChild(option);
    });
    
    textFormatGroup.appendChild(formatSelect);
    
    // Style options group
    const styleGroup = document.createElement('div');
    styleGroup.className = 'toolbar-group';
    
    const boldBtn = document.createElement('button');
    boldBtn.className = 'document-toolbar-btn';
    boldBtn.innerHTML = '<i class="fas fa-bold"></i>';
    boldBtn.title = 'Bold';
    
    const italicBtn = document.createElement('button');
    italicBtn.className = 'document-toolbar-btn';
    italicBtn.innerHTML = '<i class="fas fa-italic"></i>';
    italicBtn.title = 'Italic';
    
    const underlineBtn = document.createElement('button');
    underlineBtn.className = 'document-toolbar-btn';
    underlineBtn.innerHTML = '<i class="fas fa-underline"></i>';
    underlineBtn.title = 'Underline';
    
    const strikeBtn = document.createElement('button');
    strikeBtn.className = 'document-toolbar-btn';
    strikeBtn.innerHTML = '<i class="fas fa-strikethrough"></i>';
    strikeBtn.title = 'Strikethrough';
    
    const codeBtn = document.createElement('button');
    codeBtn.className = 'document-toolbar-btn';
    codeBtn.innerHTML = '<i class="fas fa-code"></i>';
    codeBtn.title = 'Code';
    
    styleGroup.appendChild(boldBtn);
    styleGroup.appendChild(italicBtn);
    styleGroup.appendChild(underlineBtn);
    styleGroup.appendChild(strikeBtn);
    styleGroup.appendChild(codeBtn);
    
    // Divider
    const divider1 = document.createElement('div');
    divider1.className = 'toolbar-divider';
    
    // Alignment group
    const alignGroup = document.createElement('div');
    alignGroup.className = 'toolbar-group';
    
    const alignLeftBtn = document.createElement('button');
    alignLeftBtn.className = 'document-toolbar-btn';
    alignLeftBtn.innerHTML = '<i class="fas fa-align-left"></i>';
    alignLeftBtn.title = 'Align left';
    
    const alignCenterBtn = document.createElement('button');
    alignCenterBtn.className = 'document-toolbar-btn';
    alignCenterBtn.innerHTML = '<i class="fas fa-align-center"></i>';
    alignCenterBtn.title = 'Align center';
    
    const alignRightBtn = document.createElement('button');
    alignRightBtn.className = 'document-toolbar-btn';
    alignRightBtn.innerHTML = '<i class="fas fa-align-right"></i>';
    alignRightBtn.title = 'Align right';
    
    alignGroup.appendChild(alignLeftBtn);
    alignGroup.appendChild(alignCenterBtn);
    alignGroup.appendChild(alignRightBtn);
    
    // Divider
    const divider2 = document.createElement('div');
    divider2.className = 'toolbar-divider';
    
    // Insert options group
    const insertGroup = document.createElement('div');
    insertGroup.className = 'toolbar-group';
    
    const linkBtn = document.createElement('button');
    linkBtn.className = 'document-toolbar-btn';
    linkBtn.innerHTML = '<i class="fas fa-link"></i>';
    linkBtn.title = 'Add link';
    
    const imageBtn = document.createElement('button');
    imageBtn.className = 'document-toolbar-btn';
    imageBtn.innerHTML = '<i class="fas fa-image"></i>';
    imageBtn.title = 'Add image';
    
    const tableBtn = document.createElement('button');
    tableBtn.className = 'document-toolbar-btn';
    tableBtn.innerHTML = '<i class="fas fa-table"></i>';
    tableBtn.title = 'Add table';
    
    insertGroup.appendChild(linkBtn);
    insertGroup.appendChild(imageBtn);
    insertGroup.appendChild(tableBtn);
    
    // Add all groups to toolbar
    formatToolbar.appendChild(textFormatGroup);
    formatToolbar.appendChild(styleGroup);
    formatToolbar.appendChild(divider1);
    formatToolbar.appendChild(alignGroup);
    formatToolbar.appendChild(divider2);
    formatToolbar.appendChild(insertGroup);
    
    // Create main content area
    const mainArea = document.createElement('div');
    mainArea.className = 'document-main-area';
    
    // Create ruler
    const ruler = document.createElement('div');
    ruler.className = 'document-ruler';
    
    // Add ruler markers
    for (let i = 0; i <= 100; i += 1) {
        if (i % 10 === 0) {
            const marker = document.createElement('div');
            marker.className = 'ruler-marker major';
            marker.style.left = `calc(96px + ${i/10}in)`;
            
            const number = document.createElement('div');
            number.className = 'ruler-number';
            number.textContent = i/10;
            number.style.left = `calc(96px + ${i/10}in)`;
            
            ruler.appendChild(marker);
            ruler.appendChild(number);
        } else {
            const marker = document.createElement('div');
            marker.className = 'ruler-marker';
            marker.style.left = `calc(96px + ${i/10}in)`;
            ruler.appendChild(marker);
        }
    }
    
    // Create content area
    const content = document.createElement('div');
    content.className = 'document-content';
    
    // Create document container
    const documentContainer = document.createElement('div');
    documentContainer.className = 'document-container';
    
    // Clone note content to document
    const noteContent = note.querySelector('.note-content');
    const noteId = note.getAttribute('data-note-id');
    
    if (noteContent) {
        const blocks = Array.from(noteContent.querySelectorAll('.note-block'));
        
        blocks.forEach((block, index) => {
            const newBlock = block.cloneNode(true);
            
            // Set placeholder text for empty blocks - Notion style
            const blockContent = newBlock.querySelector('.block-content');
            if (blockContent && blockContent.textContent.trim() === '') {
                if (index === 0) {
                    blockContent.setAttribute('data-placeholder', 'Type \'/\' for commands');
                } else {
                    blockContent.setAttribute('data-placeholder', 'Press \'Tab\' to nest, \'/\' for commands...');
                }
            }
            
            // Fix content editable
            if (blockContent) {
                blockContent.setAttribute('contenteditable', 'true');
                blockContent.addEventListener('input', handleNoteContentEdit);
                blockContent.addEventListener('keydown', handleBlockKeyDown);
                blockContent.addEventListener('focus', () => {
                    newBlock.classList.add('focused');
                });
                blockContent.addEventListener('blur', () => {
                    newBlock.classList.remove('focused');
                });
                
                // Add special Notion-like slash commands
                blockContent.addEventListener('keydown', (e) => {
                    if (e.key === '/') {
                        showAddBlockMenu(blockContent);
                    }
                });
            }
            
            documentContainer.appendChild(newBlock);
            
            // Setup block event handlers
            setupBlockEventHandlers(newBlock);
        });
    }
    
    // If no blocks, create an empty paragraph block
    if (!noteContent || noteContent.querySelectorAll('.note-block').length === 0) {
        const emptyBlock = document.createElement('div');
        emptyBlock.className = 'note-block block-paragraph';
        emptyBlock.setAttribute('data-block-type', 'paragraph');
        emptyBlock.setAttribute('data-block-index', '0');
        
        const blockContent = document.createElement('div');
        blockContent.className = 'block-content';
        blockContent.setAttribute('contenteditable', 'true');
        blockContent.setAttribute('data-placeholder', 'Type \'/\' for commands');
        blockContent.addEventListener('input', handleNoteContentEdit);
        blockContent.addEventListener('keydown', handleBlockKeyDown);
        blockContent.addEventListener('focus', () => {
            emptyBlock.classList.add('focused');
        });
        blockContent.addEventListener('blur', () => {
            emptyBlock.classList.remove('focused');
        });
        
        // Add special Notion-like slash commands
        blockContent.addEventListener('keydown', (e) => {
            if (e.key === '/') {
                showAddBlockMenu(blockContent);
            }
        });
        
        emptyBlock.appendChild(blockContent);
        documentContainer.appendChild(emptyBlock);
        
        // Setup block event handlers
        setupBlockEventHandlers(emptyBlock);
    }
    
    content.appendChild(documentContainer);
    
    // Create document sidebar
    const sidebar = document.createElement('div');
    sidebar.className = 'document-sidebar';
    
    const sidebarHeader = document.createElement('div');
    sidebarHeader.className = 'document-sidebar-header';
    
    const sidebarTitle = document.createElement('div');
    sidebarTitle.className = 'document-sidebar-title';
    sidebarTitle.textContent = 'Document Outline';
    
    const sidebarCloseBtn = document.createElement('button');
    sidebarCloseBtn.className = 'sidebar-toggle-btn';
    sidebarCloseBtn.innerHTML = '<i class="fas fa-times"></i>';
    sidebarCloseBtn.addEventListener('click', () => {
        sidebar.classList.add('hidden');
    });
    
    sidebarHeader.appendChild(sidebarTitle);
    sidebarHeader.appendChild(sidebarCloseBtn);
    
    const outline = document.createElement('div');
    outline.className = 'document-outline';
    
    // Create outline items from headings
    const headings = documentContainer.querySelectorAll('.block-heading, .block-subheading');
    
    if (headings.length > 0) {
        headings.forEach((heading, index) => {
            const outlineItem = document.createElement('div');
            outlineItem.className = 'outline-item';
            outlineItem.setAttribute('data-index', index);
            
            const itemIcon = document.createElement('i');
            itemIcon.className = heading.classList.contains('block-heading') ? 
                'fas fa-heading' : 'fas fa-heading fa-xs';
            
            outlineItem.appendChild(itemIcon);
            outlineItem.appendChild(document.createTextNode(' ' + heading.textContent));
            
            outlineItem.addEventListener('click', () => {
                heading.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
            
            outline.appendChild(outlineItem);
        });
    } else {
        const emptyOutline = document.createElement('div');
        emptyOutline.className = 'outline-empty';
        emptyOutline.textContent = 'No headings in document';
        emptyOutline.style.padding = '8px 16px';
        emptyOutline.style.color = '#777';
        emptyOutline.style.fontStyle = 'italic';
        outline.appendChild(emptyOutline);
    }
    
    sidebar.appendChild(sidebarHeader);
    sidebar.appendChild(outline);
    
    // Add floating + button for quick insert (Notion style)
    const floatingBtn = document.createElement('div');
    floatingBtn.className = 'document-floating-button';
    floatingBtn.innerHTML = '<i class="fas fa-plus"></i>';
    floatingBtn.title = 'Insert';
    floatingBtn.addEventListener('click', (e) => {
        showDocumentInsertMenu(floatingBtn);
    });
    
    // Status bar with word count
    const statusBar = document.createElement('div');
    statusBar.className = 'document-status-bar';
    
    const statusInfo = document.createElement('div');
    statusInfo.className = 'document-status-info';
    updateDocumentWordCount(documentContainer);
    
    statusBar.appendChild(statusInfo);
    
    // Assemble document structure
    mainArea.appendChild(content);
    mainArea.appendChild(sidebar);
    
    overlay.appendChild(topToolbar);
    overlay.appendChild(formatToolbar);
    overlay.appendChild(ruler);
    overlay.appendChild(mainArea);
    overlay.appendChild(floatingBtn);
    overlay.appendChild(statusBar);
    
    // Add class to body for global style changes
    document.body.classList.add('document-mode');
    
    // Set 100ms timeout for the fade-in animation to start
    setTimeout(() => {
        overlay.style.opacity = '1';
        
        // Focus on the first block
        const firstBlock = documentContainer.querySelector('.block-content');
        if (firstBlock) {
            firstBlock.focus();
            
            // Place cursor at the end
            const range = document.createRange();
            const sel = window.getSelection();
            range.selectNodeContents(firstBlock);
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);
        }
    }, 10);
    
    // Store noteId for later use
    overlay.setAttribute('data-note-id', noteId);
    
    // Add event listener for outside click to close insert menu
    document.addEventListener('click', (e) => {
        const insertMenu = document.querySelector('.document-insert-menu');
        if (insertMenu && !insertMenu.contains(e.target) && !floatingBtn.contains(e.target)) {
            insertMenu.remove();
        }
    });
}

// Set the active note
function setActiveNote(noteId) {
  // Remove selected class from all notes
  document.querySelectorAll('.workspace-note').forEach(note => {
    note.classList.remove('selected');
  });
  
  // Add selected class to active note
  const note = document.getElementById(noteId);
  if (note) {
    note.classList.add('selected');
    activeNoteId = noteId;
  }
}

// Toggle sidebar visibility
function toggleWorkflowSidebar() {
  const sidebar = document.querySelector('.workflow-sidebar');
  const toggleBtn = document.querySelector('.toggle-workflow-sidebar-btn');
  
  if (sidebar) {
    sidebar.classList.toggle('collapsed');
    
    if (sidebar.classList.contains('collapsed')) {
      toggleBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
  } else {
      toggleBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    }
  }
}

// Set up a Notion-style sidebar
function setupNotionStyleSidebar(sidebar) {
  // Create sidebar header
  const header = document.createElement('div');
  header.className = 'sidebar-header';
  
  const headerTitle = document.createElement('h3');
  headerTitle.className = 'sidebar-title';
  headerTitle.textContent = 'Synapse Workflow';
  
  header.appendChild(headerTitle);
  sidebar.appendChild(header);
  
  // Create sections container
  const sections = document.createElement('div');
  sections.className = 'sidebar-sections';
  
  // Pages section
  const pagesSection = createSidebarSection('Pagine', [
    { icon: 'fa-home', text: 'Dashboard' },
    { icon: 'fa-tasks', text: 'Attività' },
    { icon: 'fa-calendar', text: 'Calendario' }
  ]);
  
  // Personal section
  const personalSection = createSidebarSection('Personale', [
    { icon: 'fa-star', text: 'Preferiti' },
    { icon: 'fa-book', text: 'Note personali' },
    { icon: 'fa-briefcase', text: 'Lavoro' }
  ]);
  
  // Workspaces section
  const workspacesSection = createSidebarSection('Spazi di lavoro', [
    { icon: 'fa-users', text: 'Team Alpha' },
    { icon: 'fa-project-diagram', text: 'Progetti' },
    { icon: 'fa-lightbulb', text: 'Idee' }
  ]);
  
  // Add sections to the sidebar
  sections.appendChild(pagesSection);
  sections.appendChild(personalSection);
  sections.appendChild(workspacesSection);
  sidebar.appendChild(sections);
}

// Create a sidebar section with items
function createSidebarSection(title, items) {
  const section = document.createElement('div');
  section.className = 'sidebar-section';
  
  const sectionTitle = document.createElement('div');
  sectionTitle.className = 'sidebar-section-title';
  sectionTitle.textContent = title;
  section.appendChild(sectionTitle);
  
  items.forEach(item => {
    const sectionItem = document.createElement('div');
    sectionItem.className = 'sidebar-section-item';
    sectionItem.innerHTML = `<i class="fas ${item.icon}"></i> ${item.text}`;
    sectionItem.addEventListener('click', () => {
      // For demonstration only - could open different views
      console.log(`Clicked on ${item.text}`);
    });
    section.appendChild(sectionItem);
  });
  
  return section;
}

// Inizializza i pulsanti "+" tra i blocchi
function initializeAddBetweenButtons(note) {
  if (!note) return;
  
  // Assicuriamoci di avere i pulsanti "+" tra ogni blocco
  updateAddBetweenButtons(note);
  
  // Aggiorna i pulsanti quando vengono aggiunti/rimossi blocchi
  const observer = new MutationObserver(() => {
    updateAddBetweenButtons(note);
  });
  
  // Osserva cambiamenti nel contenuto della nota
  const noteContent = note.querySelector('.note-content');
  if (noteContent) {
    observer.observe(noteContent, { childList: true });
  }
}

// Aggiorna i pulsanti "+" tra i blocchi
function updateAddBetweenButtons(note) {
  const noteContent = note.querySelector('.note-content');
  if (!noteContent) return;
  
  // Rimuovi tutti i pulsanti esistenti
  noteContent.querySelectorAll('.block-add-between').forEach(btn => btn.remove());
  
  // Aggiungi nuovi pulsanti tra i blocchi
  const blocks = noteContent.querySelectorAll('.note-block');
  blocks.forEach((block, index) => {
    if (index < blocks.length - 1) {
      const nextBlock = blocks[index + 1];
      const addButton = document.createElement('div');
      addButton.className = 'block-add-between';
      addButton.innerHTML = '<i class="fas fa-plus"></i>';
      addButton.style.top = (block.offsetTop + block.offsetHeight) + 'px';
      
      // Evento click per aggiungere un nuovo blocco
      addButton.addEventListener('click', () => {
        const noteId = note.id;
        addBlockAfter(noteId, index, 'paragraph');
        
        // Focus sul nuovo blocco
        setTimeout(() => {
          const updatedBlocks = noteContent.querySelectorAll('.note-block');
          if (updatedBlocks[index + 1]) {
            const newBlockContent = updatedBlocks[index + 1].querySelector('.block-content');
            if (newBlockContent) {
              newBlockContent.focus();
              blockFocused = newBlockContent;
            }
          }
        }, 10);
      });
      
      noteContent.appendChild(addButton);
    }
  });
}

// Gestisci l'inizio del drag di un blocco
function handleBlockDragStart(e) {
  console.log('[DRAG] Inizio handleBlockDragStart');
  
  try {
    // Verifica se stiamo cliccando su un handler di drag
    const dragHandle = e.target.closest('.block-drag-handle');
    if (!dragHandle) {
      console.log('[DRAG] Non è un drag handle, esco');
      return;
    }
    
    console.log('[DRAG] Drag handle trovato');
    
    // Verifica che il blocco esista
    const block = dragHandle.closest('.note-block');
    if (!block) {
      console.log('[DRAG] Blocco non trovato, esco');
      return;
    }
    
    console.log('[DRAG] Blocco trovato:', block.className);
    
    // Verifica che il blocco sia in una nota valida
    const note = block.closest('.workspace-note');
    const noteContent = note ? note.querySelector('.note-content') : null;
    if (!note || !noteContent) {
      console.log('[DRAG] Nota o contenuto nota non trovati, esco');
      return;
    }
    
    console.log('[DRAG] Nota trovata:', note.id);
    
    // Se c'è già un blocco in trascinamento, puliamo prima di iniziare
    if (draggingBlock) {
      console.log('[DRAG] C\'è già un blocco in trascinamento, pulisco');
      cleanupDragState();
    }
    
    console.log('[DRAG] Imposto il blocco come trascinabile');
    
    // Previeni il comportamento di default
    e.preventDefault();
    e.stopPropagation();
    
    // Salva la posizione iniziale del mouse
    mouseOffsetY = e.clientY;
    mouseOffsetX = e.clientX;
    
    // Salva le dimensioni e posizione originali del blocco
    const blockRect = block.getBoundingClientRect();
    
    console.log('[DRAG] Posizione blocco:', blockRect.top, blockRect.left);
    
    // Memorizza il blocco corrente come blocco trascinato
    draggingBlock = block;
    
    // Aggiorna lo stile del body
    document.body.classList.add('dragging-block');
    
    // Crea un placeholder semplice
    blockDragPlaceholder = document.createElement('div');
    blockDragPlaceholder.className = 'block-drag-placeholder';
    blockDragPlaceholder.style.height = blockRect.height + 'px';
    
    // Inserisci il placeholder dopo il blocco
    block.after(blockDragPlaceholder);
    
    console.log('[DRAG] Placeholder creato e inserito');
    
    // Mantieni il blocco originale dov'è ma cambia lo stile
    block.classList.add('dragging');
    
    console.log('[DRAG] Aggiungo listener per mousemove e mouseup');
    
    // Aggiungi i listener per gli eventi mouse
    document.addEventListener('mousemove', handleSimpleDragMove);
    document.addEventListener('mouseup', handleSimpleDragEnd);
    document.addEventListener('mouseleave', handleSimpleDragEnd);
    
    console.log('[DRAG] Inizio drag completato');
    
  } catch (error) {
    console.error('[DRAG ERROR] Errore durante l\'inizio del drag:', error);
    cleanupDragState();
  }
}

// Versione semplificata del movimento durante il drag
function handleSimpleDragMove(e) {
  console.log('[DRAG MOVE] Movimento rilevato');
  
  try {
    // Verifica che il drag sia attivo
    if (!draggingBlock || !blockDragPlaceholder) {
      console.log('[DRAG MOVE] Nessun blocco in trascinamento, esco');
      return;
    }
    
    // Verifica che il pulsante del mouse sia ancora premuto
    if (e.buttons === 0) {
      console.log('[DRAG MOVE] Mouse button rilasciato, termino il drag');
      handleSimpleDragEnd(e);
      return;
    }
    
    console.log('[DRAG MOVE] Calcolo spostamento');
    
    // Calcola lo spostamento
    const deltaY = e.clientY - mouseOffsetY;
    
    // Simuliamo lo scrolling quando il mouse è vicino ai bordi
    const viewportHeight = window.innerHeight;
    const scrollSpeed = 10;
    
    if (e.clientY < 100) {
      // Scroll verso l'alto
      window.scrollBy(0, -scrollSpeed);
    } else if (e.clientY > viewportHeight - 100) {
      // Scroll verso il basso
      window.scrollBy(0, scrollSpeed);
    }
    
    // Trova la nota sotto il cursore
    const elementsAtPoint = document.elementsFromPoint(e.clientX, e.clientY);
    const noteUnderCursor = elementsAtPoint.find(el => el.classList && el.classList.contains('workspace-note'));
    
    if (!noteUnderCursor) {
      console.log('[DRAG MOVE] Nessuna nota sotto il cursore');
      return;
    }
    
    console.log('[DRAG MOVE] Nota trovata sotto il cursore:', noteUnderCursor.id);
    
    // Trova il contenuto della nota
    const targetNoteContent = noteUnderCursor.querySelector('.note-content');
    if (!targetNoteContent) {
      console.log('[DRAG MOVE] Contenuto nota non trovato');
      return;
    }
    
    // Rimuovi il placeholder corrente
    if (blockDragPlaceholder.parentNode) {
      blockDragPlaceholder.parentNode.removeChild(blockDragPlaceholder);
    }
    
    // Trova tutti i blocchi nella nota target
    const blocks = Array.from(targetNoteContent.querySelectorAll('.note-block'));
    
    // Se non ci sono blocchi, aggiungi il placeholder alla fine della nota
    if (blocks.length === 0) {
      console.log('[DRAG MOVE] Nessun blocco nella nota, aggiungo il placeholder alla fine');
      targetNoteContent.appendChild(blockDragPlaceholder);
      return;
    }
    
    // Trova il blocco più vicino al cursore
    let closestBlock = null;
    let closestDistance = Infinity;
    let insertBefore = true;
    
    for (const currentBlock of blocks) {
      // Ignora il blocco che stiamo trascinando
      if (currentBlock === draggingBlock) continue;
      
      const rect = currentBlock.getBoundingClientRect();
      const blockMiddle = rect.top + rect.height / 2;
      const distance = Math.abs(e.clientY - blockMiddle);
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestBlock = currentBlock;
        insertBefore = e.clientY < blockMiddle;
      }
    }
    
    // Inserisci il placeholder nella posizione appropriata
    if (closestBlock) {
      console.log('[DRAG MOVE] Inserisco placeholder', insertBefore ? 'prima' : 'dopo', 'il blocco più vicino');
      if (insertBefore) {
        targetNoteContent.insertBefore(blockDragPlaceholder, closestBlock);
      } else {
        const nextSibling = closestBlock.nextElementSibling;
        if (nextSibling) {
          targetNoteContent.insertBefore(blockDragPlaceholder, nextSibling);
        } else {
          targetNoteContent.appendChild(blockDragPlaceholder);
        }
      }
    } else {
      console.log('[DRAG MOVE] Nessun blocco trovato, aggiungo il placeholder alla fine');
      targetNoteContent.appendChild(blockDragPlaceholder);
    }
    
  } catch (error) {
    console.error('[DRAG MOVE ERROR] Errore durante il movimento:', error);
  }
}

// Versione semplificata del rilascio del blocco
function handleSimpleDragEnd(e) {
  console.log('[DRAG END] Fine del drag');
  
  try {
    // Rimuovi i listener degli eventi
    document.removeEventListener('mousemove', handleSimpleDragMove);
    document.removeEventListener('mouseup', handleSimpleDragEnd);
    document.removeEventListener('mouseleave', handleSimpleDragEnd);
    
    console.log('[DRAG END] Listener rimossi');
    
    // Se non c'è un blocco in trascinamento o un placeholder, pulisci e esci
    if (!draggingBlock || !blockDragPlaceholder) {
      console.log('[DRAG END] Nessun blocco o placeholder, pulisco e esco');
      cleanupDragState();
      return;
    }
    
    console.log('[DRAG END] Posiziono il blocco nella nuova posizione');
    
    // Se il placeholder è stato inserito nel DOM, sposta il blocco lì
    if (blockDragPlaceholder.parentNode) {
      blockDragPlaceholder.parentNode.insertBefore(draggingBlock, blockDragPlaceholder);
      
      // Rimuovi il placeholder
      blockDragPlaceholder.parentNode.removeChild(blockDragPlaceholder);
      
      console.log('[DRAG END] Blocco posizionato, placeholder rimosso');
      
      // Ripristina lo stile del blocco
      draggingBlock.classList.remove('dragging');
      
      // Aggiorna i pulsanti tra i blocchi
      const note = draggingBlock.closest('.workspace-note');
      if (note) {
        console.log('[DRAG END] Aggiorno i pulsanti tra i blocchi');
        updateAddBetweenButtons(note);
      }
    }
    
    console.log('[DRAG END] Pulisco lo stato del drag');
    
    // Reset delle variabili
    document.body.classList.remove('dragging-block');
    draggingBlock = null;
    blockDragPlaceholder = null;
    mouseOffsetY = 0;
    mouseOffsetX = 0;
    
    console.log('[DRAG END] Drag terminato con successo');
    
  } catch (error) {
    console.error('[DRAG END ERROR] Errore durante la fine del drag:', error);
    cleanupDragState();
  }
}

// Funzione per pulire lo stato del drag con log
function cleanupDragState() {
  console.log('[CLEANUP] Inizio pulizia stato drag');
  
  try {
    // Rimuovi i listener se ci sono
    document.removeEventListener('mousemove', handleSimpleDragMove);
    document.removeEventListener('mouseup', handleSimpleDragEnd);
    document.removeEventListener('mouseleave', handleSimpleDragEnd);
    
    console.log('[CLEANUP] Listener rimossi');
    
    // Ripristina lo stile del body
    document.body.classList.remove('dragging-block');
    
    // Ripristina il blocco trascinato se esiste
    if (draggingBlock) {
      console.log('[CLEANUP] Ripristino stile blocco');
      draggingBlock.classList.remove('dragging');
    }
    
    // Rimuovi il placeholder se esiste
    if (blockDragPlaceholder && blockDragPlaceholder.parentNode) {
      console.log('[CLEANUP] Rimuovo placeholder');
      blockDragPlaceholder.parentNode.removeChild(blockDragPlaceholder);
    }
    
    // Reset delle variabili
    draggingBlock = null;
    blockDragPlaceholder = null;
    mouseOffsetY = 0;
    mouseOffsetX = 0;
    blockAnimationFrame = null;
    
    console.log('[CLEANUP] Pulizia completata');
    
  } catch (error) {
    console.error('[CLEANUP ERROR] Errore durante la pulizia:', error);
    
    // Reset estremo delle variabili in caso di errore
    draggingBlock = null;
    blockDragPlaceholder = null;
    mouseOffsetY = 0;
    mouseOffsetX = 0;
    blockAnimationFrame = null;
    document.body.classList.remove('dragging-block');
  }
}

// Export functions for use in renderer.js
window.workflowFunctions = {
  initialize: initializeWorkflow,
  createNote: createNewNote,
  toggleSidebar: toggleWorkflowSidebar,
  cleanup: cleanupWorkflow
};

// Funzione per gestire la creazione di connessioni tra nodi AI
function handlePortMouseDown(e) {
  e.preventDefault();
  e.stopPropagation();
  
  // Ottieni la porta di connessione
  const port = e.currentTarget;
  const node = port.closest('.workspace-ai-node');
  
  // Memorizza il nodo e la porta di origine
  connectorSourceNode = node;
  connectorSourcePort = port;
  
  // Crea un nuovo connettore temporaneo
  const workspaceArea = document.getElementById('workflowWorkspace');
  
  currentConnector = document.createElement('div');
  currentConnector.className = 'node-connector';
  workspaceArea.appendChild(currentConnector);
  
  // Calcola la posizione della porta di origine
  const portRect = port.getBoundingClientRect();
  const workspaceRect = workspaceArea.getBoundingClientRect();
  
  const workspaceX = (portRect.left + portRect.width / 2 - workspaceRect.left) / canvasScale + canvasOffsetX;
  const workspaceY = (portRect.top + portRect.height / 2 - workspaceRect.top) / canvasScale + canvasOffsetY;
  
  // Posizione iniziale del connettore
  currentConnector.style.left = `${workspaceX}px`;
  currentConnector.style.top = `${workspaceY}px`;
  currentConnector.style.width = '0';
  
  // Funzioni per gestire il trascinamento e il rilascio
  function handleConnectorDragMove(moveEvent) {
    // Calcola la posizione del cursore nel sistema di coordinate del workspace
    const cursorWorkspaceX = (moveEvent.clientX - workspaceRect.left) / canvasScale + canvasOffsetX;
    const cursorWorkspaceY = (moveEvent.clientY - workspaceRect.top) / canvasScale + canvasOffsetY;
    
    // Calcola la distanza e l'angolo
    const deltaX = cursorWorkspaceX - workspaceX;
    const deltaY = cursorWorkspaceY - workspaceY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    
    // Aggiorna il connettore
    currentConnector.style.width = `${distance}px`;
    currentConnector.style.transform = `rotate(${angle}deg)`;
  }
  
  function handleConnectorDragEnd(endEvent) {
    // Rimuovi il connettore temporaneo
    currentConnector.remove();
    currentConnector = null;
    
    // Rimuovi gli event listener
    document.removeEventListener('mousemove', handleConnectorDragMove);
    document.removeEventListener('mouseup', handleConnectorDragEnd);
    
    // Verifica se è stata rilasciata su una porta compatibile
    const targetPort = document.elementFromPoint(endEvent.clientX, endEvent.clientY);
    if (targetPort && targetPort.classList.contains('node-connector-port')) {
      const targetNode = targetPort.closest('.workspace-ai-node');
      
      // Verifica che non sia la stessa porta e che i tipi siano compatibili
      if (
        targetNode && 
        targetNode !== connectorSourceNode &&
        ((connectorSourcePort.dataset.portType === 'output' && targetPort.dataset.portType === 'input') ||
         (connectorSourcePort.dataset.portType === 'input' && targetPort.dataset.portType === 'output'))
      ) {
        // Crea una connessione permanente
        createConnection(connectorSourceNode, connectorSourcePort, targetNode, targetPort);
      }
    }
    
    // Resetta le variabili
    connectorSourceNode = null;
    connectorSourcePort = null;
  }
  
  document.addEventListener('mousemove', handleConnectorDragMove);
  document.addEventListener('mouseup', handleConnectorDragEnd);
}

// Gestisce l'inizio del trascinamento di un tool AI
function handleAIToolDragStart(e) {
  e.preventDefault();
  
  // Ottieni il tool AI cliccato
  const aiTool = e.currentTarget;
  
  // Crea una copia visiva del tool per il trascinamento
  const dragPreview = aiTool.cloneNode(true);
  dragPreview.style.position = 'fixed';
  dragPreview.style.zIndex = '1000';
  dragPreview.style.pointerEvents = 'none';
  dragPreview.style.opacity = '0.8';
  dragPreview.style.width = `${aiTool.offsetWidth}px`;
  document.body.appendChild(dragPreview);
  
  // Posiziona il drag preview sotto il cursore
  dragPreview.style.left = `${e.clientX - 20}px`;
  dragPreview.style.top = `${e.clientY - 10}px`;
  
  // Salva il riferimento al drag preview e al tool originale
  const toolId = aiTool.dataset.toolId;
  
  // Aggiungi gli event listener per il trascinamento e il rilascio
  function handleAIToolDragMove(moveEvent) {
    dragPreview.style.left = `${moveEvent.clientX - 20}px`;
    dragPreview.style.top = `${moveEvent.clientY - 10}px`;
  }
  
  function handleAIToolDragEnd(endEvent) {
    // Rimuovi il drag preview
    dragPreview.remove();
    
    // Rimuovi gli event listener
    document.removeEventListener('mousemove', handleAIToolDragMove);
    document.removeEventListener('mouseup', handleAIToolDragEnd);
    
    // Verifica se il tool è stato rilasciato nel workspace
    const workspaceArea = document.getElementById('workflowWorkspace');
    const workspaceRect = workspaceArea.getBoundingClientRect();
    
    if (
      endEvent.clientX >= workspaceRect.left &&
      endEvent.clientX <= workspaceRect.right &&
      endEvent.clientY >= workspaceRect.top &&
      endEvent.clientY <= workspaceRect.bottom
    ) {
      // Calcola la posizione nel canvas tenendo conto dello zoom e pan
      const canvasX = (endEvent.clientX - workspaceRect.left - canvasOffsetX) / canvasScale;
      const canvasY = (endEvent.clientY - workspaceRect.top - canvasOffsetY) / canvasScale;
      
      // Crea un nuovo nodo AI nel workspace
      createAINode(toolId, canvasX, canvasY);
    }
  }
  
  document.addEventListener('mousemove', handleAIToolDragMove);
  document.addEventListener('mouseup', handleAIToolDragEnd);
}

// Crea un nuovo nodo AI nel workspace
function createAINode(toolId, x, y) {
  const workspaceArea = document.getElementById('workflowWorkspace');
  
  // Info del tool in base all'ID
  const toolInfo = {
    'ai-text-generator': { name: 'Text Generator', icon: '<i class="fas fa-pen"></i>', color: '#5c5cff' },
    'ai-image-generator': { name: 'Image Gen', icon: '<i class="fas fa-image"></i>', color: '#5c5cff' },
    'ai-search': { name: 'Web Search', icon: '<i class="fas fa-search"></i>', color: '#5c5cff' },
    'ai-decision': { name: 'Decision', icon: '<i class="fas fa-code-branch"></i>', color: '#5c5cff' },
    'ai-summarize': { name: 'Summarize', icon: '<i class="fas fa-list"></i>', color: '#5c5cff' }
  };
  
  const info = toolInfo[toolId] || { name: 'AI Node', icon: '<i class="fas fa-robot"></i>', color: '#5c5cff' };
  
  // Crea il nodo AI
  const aiNode = document.createElement('div');
  aiNode.className = 'workspace-ai-node';
  aiNode.id = `ai-node-${Date.now()}`;
  aiNode.dataset.nodeType = toolId;
  aiNode.style.transform = `translate(${x}px, ${y}px)`;
  
  // Crea l'header del nodo
  const nodeHeader = document.createElement('div');
  nodeHeader.className = 'ai-node-header';
  nodeHeader.style.backgroundColor = info.color;
  nodeHeader.innerHTML = `
    <span>${info.icon} ${info.name}</span>
    <div class="node-actions">
      <button class="node-action"><i class="fas fa-cog"></i></button>
    </div>
  `;
  
  // Crea il contenuto del nodo
  const nodeContent = document.createElement('div');
  nodeContent.className = 'ai-node-content';
  nodeContent.innerHTML = `<div class="ai-component-content">AI ${info.name} component</div>`;
  
  // Crea le porte di connessione
  const inputPort = document.createElement('div');
  inputPort.className = 'node-connector-port input';
  inputPort.dataset.portType = 'input';
  
  const outputPort = document.createElement('div');
  outputPort.className = 'node-connector-port output';
  outputPort.dataset.portType = 'output';
  
  // Aggiungi gli elementi al nodo
  aiNode.appendChild(nodeHeader);
  aiNode.appendChild(nodeContent);
  aiNode.appendChild(inputPort);
  aiNode.appendChild(outputPort);
  
  // Aggiungi il nodo al workspace
  workspaceArea.appendChild(aiNode);
  
  // Aggiungi eventi per il trascinamento del nodo
  nodeHeader.addEventListener('mousedown', handleNodeDragStart);
  
  // Aggiungi eventi per le connessioni
  inputPort.addEventListener('mousedown', handlePortMouseDown);
  outputPort.addEventListener('mousedown', handlePortMouseDown);
  
  // Aggiorna la minimappa
  updateMinimap();
  
  return aiNode;
}

// Gestisce l'inizio del trascinamento di un nodo AI
function handleNodeDragStart(e) {
  e.preventDefault();
  e.stopPropagation();
  
  // Ottieni il nodo AI
  const aiNode = e.currentTarget.closest('.workspace-ai-node');
  if (!aiNode) return;
  
  // Aggiungi la classe dragging
  aiNode.classList.add('dragging');
  
  // Memorizza la posizione iniziale del mouse
  const initialMouseX = e.clientX;
  const initialMouseY = e.clientY;
  
  // Memorizza la posizione iniziale del nodo
  const style = window.getComputedStyle(aiNode);
  const transform = style.transform || style.webkitTransform;
  let initialX = 0, initialY = 0;
  
  if (transform && transform !== 'none') {
    const matrix = new DOMMatrix(transform);
    initialX = matrix.m41;
    initialY = matrix.m42;
  }
  
  // Funzione per gestire il movimento del mouse durante il trascinamento
  function handleNodeDragMove(moveEvent) {
    // Calcola lo spostamento del mouse, considerando lo zoom
    const deltaX = (moveEvent.clientX - initialMouseX) / canvasScale;
    const deltaY = (moveEvent.clientY - initialMouseY) / canvasScale;
    
    // Aggiorna la posizione del nodo
    aiNode.style.transform = `translate(${initialX + deltaX}px, ${initialY + deltaY}px)`;
    
    // Aggiorna le connessioni se presenti
    updateConnectors();
  }
  
  // Funzione per gestire il rilascio del mouse
  function handleNodeDragEnd() {
    // Rimuovi la classe dragging
    aiNode.classList.remove('dragging');
    
    // Rimuovi gli event listener
    document.removeEventListener('mousemove', handleNodeDragMove);
    document.removeEventListener('mouseup', handleNodeDragEnd);
    
    // Aggiorna la minimappa
    updateMinimap();
  }
  
  document.addEventListener('mousemove', handleNodeDragMove);
  document.addEventListener('mouseup', handleNodeDragEnd);
}

// Crea una connessione permanente tra due porte
function createConnection(sourceNode, sourcePort, targetNode, targetPort) {
  // Assicurati che sourcePort sia sempre la porta di output e targetPort quella di input
  if (sourcePort.dataset.portType === 'input') {
    [sourceNode, targetNode] = [targetNode, sourceNode];
    [sourcePort, targetPort] = [targetPort, sourcePort];
  }
  
  // Crea l'oggetto connessione
  const connection = {
    id: `conn-${Date.now()}`,
    sourceNodeId: sourceNode.id,
    targetNodeId: targetNode.id,
    sourcePortType: sourcePort.dataset.portType,
    targetPortType: targetPort.dataset.portType,
    element: null
  };
  
  // Crea l'elemento visivo della connessione
  const workspaceArea = document.getElementById('workflowWorkspace');
  const connectorElement = document.createElement('div');
  connectorElement.className = 'node-connector';
  connectorElement.id = connection.id;
  workspaceArea.appendChild(connectorElement);
  
  // Salva il riferimento all'elemento
  connection.element = connectorElement;
  
  // Aggiungi la connessione all'array
  connectors.push(connection);
  
  // Aggiorna la visualizzazione della connessione
  updateConnectorPosition(connection);
}

// Aggiorna la posizione di tutti i connettori
function updateConnectors() {
  connectors.forEach(updateConnectorPosition);
}

// Aggiorna la posizione di un singolo connettore
function updateConnectorPosition(connector) {
  // Ottieni i nodi di origine e destinazione
  const sourceNode = document.getElementById(connector.sourceNodeId);
  const targetNode = document.getElementById(connector.targetNodeId);
  
  if (!sourceNode || !targetNode || !connector.element) {
    // Rimuovi il connettore se i nodi non esistono più
    if (connector.element) {
      connector.element.remove();
    }
    const index = connectors.indexOf(connector);
    if (index !== -1) {
      connectors.splice(index, 1);
    }
    return;
  }
  
  // Ottieni le porte
  const sourcePort = sourceNode.querySelector(`.node-connector-port.${connector.sourcePortType}`);
  const targetPort = targetNode.querySelector(`.node-connector-port.${connector.targetPortType}`);
  
  if (!sourcePort || !targetPort) return;
  
  // Calcola le posizioni delle porte nel sistema di coordinate del workspace
  const workspaceArea = document.getElementById('workflowWorkspace');
  const workspaceRect = workspaceArea.getBoundingClientRect();
  
  const sourcePortRect = sourcePort.getBoundingClientRect();
  const targetPortRect = targetPort.getBoundingClientRect();
  
  const sourceX = (sourcePortRect.left + sourcePortRect.width / 2 - workspaceRect.left) / canvasScale - canvasOffsetX / canvasScale;
  const sourceY = (sourcePortRect.top + sourcePortRect.height / 2 - workspaceRect.top) / canvasScale - canvasOffsetY / canvasScale;
  
  const targetX = (targetPortRect.left + targetPortRect.width / 2 - workspaceRect.left) / canvasScale - canvasOffsetX / canvasScale;
  const targetY = (targetPortRect.top + targetPortRect.height / 2 - workspaceRect.top) / canvasScale - canvasOffsetY / canvasScale;
  
  // Calcola la distanza e l'angolo
  const deltaX = targetX - sourceX;
  const deltaY = targetY - sourceY;
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
  
  // Aggiorna il connettore
  connector.element.style.left = `${sourceX}px`;
  connector.element.style.top = `${sourceY}px`;
  connector.element.style.width = `${distance}px`;
  connector.element.style.transform = `rotate(${angle}deg)`;
}

// Crea l'albero delle cartelle per i file .syn
function createFolderTree(container) {
  // Crea il container dell'albero delle cartelle
  const folderTree = document.createElement('div');
  folderTree.className = 'workflow-folder-tree';
  container.appendChild(folderTree);
  
  // Aggiungi l'header
  const folderTreeHeader = document.createElement('div');
  folderTreeHeader.className = 'folder-tree-header';
  folderTreeHeader.innerHTML = `
    <div class="folder-tree-title">Workflow Files</div>
    <button class="folder-tree-btn"><i class="fas fa-plus"></i></button>
  `;
  folderTree.appendChild(folderTreeHeader);
  
  // Aggiungi il contenuto
  const folderTreeContent = document.createElement('div');
  folderTreeContent.className = 'folder-tree-content';
  folderTree.appendChild(folderTreeContent);
  
  // Aggiungi esempi di file e cartelle
  folderTreeContent.innerHTML = `
    <div class="folder-item">
      <div class="folder-toggle"><i class="fas fa-caret-down"></i></div>
      <div class="folder-icon"><i class="fas fa-folder-open"></i></div>
      <div class="folder-name">I miei workflow</div>
    </div>
    <div class="folder-item" style="padding-left: 24px;">
      <div class="folder-toggle"></div>
      <div class="file-icon"><i class="fas fa-file"></i></div>
      <div class="file-name">Brainstorming.syn</div>
    </div>
    <div class="folder-item" style="padding-left: 24px;">
      <div class="folder-toggle"></div>
      <div class="file-icon"><i class="fas fa-file"></i></div>
      <div class="file-name">Roadmap Q3.syn</div>
    </div>
    <div class="folder-item">
      <div class="folder-toggle"><i class="fas fa-caret-right"></i></div>
      <div class="folder-icon"><i class="fas fa-folder"></i></div>
      <div class="folder-name">Progetti</div>
    </div>
    <div class="folder-item">
      <div class="folder-toggle"><i class="fas fa-caret-right"></i></div>
      <div class="folder-icon"><i class="fas fa-folder"></i></div>
      <div class="folder-name">Archivio</div>
    </div>
  `;
  
  // Aggiungi gli eventi per espandere/contrarre le cartelle
  const folderToggles = folderTreeContent.querySelectorAll('.folder-toggle');
  folderToggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const folderItem = e.currentTarget.closest('.folder-item');
      if (!folderItem) return;
      
      const icon = toggle.querySelector('i');
      if (!icon) return;
      
      if (icon.classList.contains('fa-caret-right')) {
        icon.classList.remove('fa-caret-right');
        icon.classList.add('fa-caret-down');
      } else if (icon.classList.contains('fa-caret-down')) {
        icon.classList.remove('fa-caret-down');
        icon.classList.add('fa-caret-right');
      }
      
      // Qui andrebbe implementata la logica per mostrare/nascondere i file nella cartella
    });
  });
  
  // Aggiungi gli eventi per cliccare sui file
  const fileItems = folderTreeContent.querySelectorAll('.file-name');
  fileItems.forEach(fileItem => {
    fileItem.addEventListener('click', (e) => {
      e.stopPropagation();
      const filename = e.currentTarget.textContent;
      
      // Qui andrebbe implementata la logica per caricare il file selezionato
      console.log(`Loading file: ${filename}`);
      
      // Attiva la voce di menu
      const allItems = folderTreeContent.querySelectorAll('.folder-item');
      allItems.forEach(item => item.classList.remove('active'));
      e.currentTarget.closest('.folder-item').classList.add('active');
    });
  });
  
  // Aggiungi il pulsante per aggiungere un nuovo file
  const addButton = folderTreeHeader.querySelector('.folder-tree-btn');
  if (addButton) {
    addButton.addEventListener('click', () => {
      // Salva lo stato attuale come nuovo file
      const fileName = `New Workflow ${new Date().toLocaleString('it-IT', { 
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      })}.syn`;
      
      console.log(`Creating new file: ${fileName}`);
      
      // Qui andrebbe implementata la logica per creare un nuovo file
      // e aggiungerlo all'albero delle cartelle
    });
  }
}

// Configura i gestori di eventi per una nota
function setupNoteEventHandlers(note) {
  if (!note) return;
  
  // Aggiungi gestore eventi per il titolo della nota
  const noteTitle = note.querySelector('.note-title');
  if (noteTitle) {
    const noteId = note.id;
    setupNoteTitleEditing(noteTitle, noteId);
  }
  
  // Aggiungi gestore eventi per il pulsante di espansione
  const expandButton = note.querySelector('.note-expand-btn');
  if (expandButton) {
    expandButton.addEventListener('click', (e) => {
      e.stopPropagation(); // Previene la propagazione al workspace
      enterDocumentMode(note);
    });
  }
  
  // Aggiungi gestore eventi per il pulsante di chiusura
  const closeButton = note.querySelector('.note-close-btn');
  if (closeButton) {
    closeButton.addEventListener('click', (e) => {
      e.stopPropagation(); // Previene la propagazione al workspace
      note.remove();
      updateMinimap();
    });
  }
  
  // Configura i pulsanti "Aggiungi tra" i blocchi
  initializeAddBetweenButtons(note);
  
  // Configura i gestori di eventi per i blocchi
  const blocks = note.querySelectorAll('.note-block');
  blocks.forEach(block => {
    setupBlockEventHandlers(block);
  });
  
  // Configura il trascinamento e il ridimensionamento della nota
  note.addEventListener('mousedown', function(e) {
    // Delega all'handler generale per le note
    // Il resto della logica è gestito da handleNoteMouseDown
    const noteElement = e.target.closest('.workspace-note');
    if (noteElement) {
      const noteId = noteElement.id;
      setActiveNote(noteId);
    }
  });
}

// Mostra il menu di inserimento per la modalità documento
function showDocumentInsertMenu(insertButton) {
  // Rimuovi eventuali menu esistenti
  const existingMenu = document.querySelector('.document-insert-menu');
  if (existingMenu) existingMenu.remove();
  
  // Crea il menu
  const insertMenu = document.createElement('div');
  insertMenu.className = 'document-insert-menu';
  
  // Posizione il menu sotto il pulsante
  const buttonRect = insertButton.getBoundingClientRect();
  insertMenu.style.position = 'absolute';
  insertMenu.style.top = `${buttonRect.bottom + 5}px`;
  insertMenu.style.left = `${buttonRect.left}px`;
  insertMenu.style.zIndex = '1000';
  insertMenu.style.backgroundColor = '#fff';
  insertMenu.style.border = '1px solid #dadce0';
  insertMenu.style.borderRadius = '4px';
  insertMenu.style.boxShadow = '0 2px 6px rgba(0,0,0,0.15)';
  insertMenu.style.padding = '8px 0';
  insertMenu.style.width = '250px';
  
  // Definisci gli elementi da inserire
  const insertItems = [
    { icon: 'fa-image', title: 'Immagine', description: 'Inserisci un\'immagine o carica un file' },
    { icon: 'fa-table', title: 'Tabella', description: 'Inserisci una tabella strutturata' },
    { icon: 'fa-chart-bar', title: 'Grafico', description: 'Visualizza i dati con un grafico' },
    { icon: 'fa-drawing-polygon', title: 'Disegno', description: 'Crea un disegno o uno schizzo' },
    { icon: 'fa-code', title: 'Codice', description: 'Inserisci un blocco di codice formattato' },
    { icon: 'fa-list-ol', title: 'Elenco numerato', description: 'Crea un elenco ordinato' },
    { icon: 'fa-list-ul', title: 'Elenco puntato', description: 'Crea un elenco non ordinato' },
    { icon: 'fa-tasks', title: 'Elenco di attività', description: 'Crea una lista di cose da fare' },
    { icon: 'fa-link', title: 'Link', description: 'Aggiungi un link a una pagina web' },
    { icon: 'fa-bookmark', title: 'Segnalibro', description: 'Marca una sezione per riferimento' }
  ];
  
  // Crea gli elementi del menu
  insertItems.forEach(item => {
    const menuItem = document.createElement('div');
    menuItem.className = 'document-insert-item';
    menuItem.style.padding = '8px 16px';
    menuItem.style.display = 'flex';
    menuItem.style.alignItems = 'center';
    menuItem.style.gap = '12px';
    menuItem.style.cursor = 'pointer';
    menuItem.style.transition = 'background-color 0.2s';
    
    menuItem.innerHTML = `
      <div class="document-insert-icon" style="width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; color: #5f6368;">
        <i class="fas ${item.icon}"></i>
      </div>
      <div class="document-insert-content" style="flex: 1;">
        <div class="document-insert-title" style="font-size: 14px; color: #202124; margin-bottom: 2px;">${item.title}</div>
        <div class="document-insert-description" style="font-size: 12px; color: #5f6368;">${item.description}</div>
      </div>
    `;
    
    // Hover effect
    menuItem.addEventListener('mouseover', () => {
      menuItem.style.backgroundColor = '#f1f3f4';
    });
    
    menuItem.addEventListener('mouseout', () => {
      menuItem.style.backgroundColor = 'transparent';
    });
    
    // Click handling
    menuItem.addEventListener('click', () => {
      handleDocumentInsert(item.title.toLowerCase());
      insertMenu.remove();
    });
    
    insertMenu.appendChild(menuItem);
  });
  
  // Aggiungi il menu al document body
  document.body.appendChild(insertMenu);
  
  // Chiudi il menu quando si fa clic altrove
  const closeInsertMenu = (e) => {
    if (!insertMenu.contains(e.target) && e.target !== insertButton) {
      insertMenu.remove();
      document.removeEventListener('click', closeInsertMenu);
    }
  };
  
  // Aggiungi un delay per evitare che il menu si chiuda immediatamente
  setTimeout(() => {
    document.addEventListener('click', closeInsertMenu);
  }, 100);
}

// Gestisci l'inserimento di elementi nel documento
function handleDocumentInsert(itemType) {
  // Trova il documento e il blocco attivo
  const documentContent = document.querySelector('.document-content');
  const activeBlock = documentContent.querySelector('.note-block.focused');
  
  if (!documentContent || !activeBlock) return;
  
  // Determina l'indice del blocco attivo
  const blocks = Array.from(documentContent.querySelectorAll('.note-block'));
  const activeIndex = blocks.indexOf(activeBlock);
  
  // Crea un nuovo blocco in base al tipo selezionato
  const newBlock = document.createElement('div');
  newBlock.className = 'note-block';
  
  switch (itemType) {
    case 'immagine':
      newBlock.classList.add('block-image');
      newBlock.innerHTML = `
        <div class="block-image-container">
          <img class="block-image" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150' viewBox='0 0 200 150'%3E%3Crect width='200' height='150' fill='%23f1f3f4'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='16' fill='%235f6368'%3EFai clic per inserire un'immagine%3C/text%3E%3C/svg%3E" alt="Placeholder">
          <div class="block-content" contenteditable="true" data-placeholder="Aggiungi una didascalia..."></div>
        </div>
      `;
      break;
    case 'tabella':
      newBlock.classList.add('block-table');
      newBlock.innerHTML = `
        <table class="document-table">
          <thead>
            <tr>
              <th><div class="block-content" contenteditable="true">Intestazione 1</div></th>
              <th><div class="block-content" contenteditable="true">Intestazione 2</div></th>
              <th><div class="block-content" contenteditable="true">Intestazione 3</div></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><div class="block-content" contenteditable="true">Cella 1</div></td>
              <td><div class="block-content" contenteditable="true">Cella 2</div></td>
              <td><div class="block-content" contenteditable="true">Cella 3</div></td>
            </tr>
            <tr>
              <td><div class="block-content" contenteditable="true">Cella 4</div></td>
              <td><div class="block-content" contenteditable="true">Cella 5</div></td>
              <td><div class="block-content" contenteditable="true">Cella 6</div></td>
            </tr>
          </tbody>
        </table>
      `;
      break;
    case 'codice':
      newBlock.classList.add('block-code');
      newBlock.innerHTML = `
        <div class="block-code-header">
          <select class="code-language-select">
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="java">Java</option>
            <option value="csharp">C#</option>
          </select>
        </div>
        <pre class="block-code-content"><code class="block-content" contenteditable="true" data-placeholder="Scrivi il tuo codice qui..."></code></pre>
      `;
      break;
    case 'elenco numerato':
      newBlock.classList.add('block-ordered-list');
      newBlock.innerHTML = `
        <ol>
          <li><div class="block-content" contenteditable="true">Primo elemento</div></li>
          <li><div class="block-content" contenteditable="true">Secondo elemento</div></li>
          <li><div class="block-content" contenteditable="true">Terzo elemento</div></li>
        </ol>
      `;
      break;
    case 'elenco puntato':
      newBlock.classList.add('block-unordered-list');
      newBlock.innerHTML = `
        <ul>
          <li><div class="block-content" contenteditable="true">Primo elemento</div></li>
          <li><div class="block-content" contenteditable="true">Secondo elemento</div></li>
          <li><div class="block-content" contenteditable="true">Terzo elemento</div></li>
        </ul>
      `;
      break;
    case 'elenco di attività':
      newBlock.classList.add('block-checklist');
      newBlock.innerHTML = `
        <div class="checklist-container">
          <div class="checklist-item">
            <input type="checkbox" class="checklist-checkbox">
            <div class="block-content" contenteditable="true">Attività da completare</div>
          </div>
          <div class="checklist-item">
            <input type="checkbox" class="checklist-checkbox">
            <div class="block-content" contenteditable="true">Altra attività da completare</div>
          </div>
          <div class="checklist-item">
            <input type="checkbox" class="checklist-checkbox">
            <div class="block-content" contenteditable="true">Ancora un'altra attività</div>
          </div>
        </div>
      `;
      break;
    case 'link':
      // Chiedi l'URL tramite prompt
      const url = prompt('Inserisci l\'URL:', 'https://');
      if (!url) return; // Se l'utente annulla, non fare nulla
      
      newBlock.classList.add('block-link');
      newBlock.innerHTML = `
        <div class="block-link-container">
          <a href="${url}" target="_blank" class="block-link-preview">
            <div class="block-link-favicon">
              <i class="fas fa-link"></i>
            </div>
            <div class="block-link-content">
              <div class="block-link-title">Link a ${url}</div>
              <div class="block-link-url">${url}</div>
            </div>
          </a>
          <div class="block-content" contenteditable="true" data-placeholder="Aggiungi una descrizione..."></div>
        </div>
      `;
      break;
    default:
      // Per gli altri tipi, crea un blocco di testo normale
      newBlock.classList.add('block-paragraph');
      newBlock.innerHTML = `<div class="block-content" contenteditable="true" data-placeholder="Scrivi qui..."></div>`;
  }
  
  // Inserisci il nuovo blocco dopo quello attivo
  if (activeIndex >= 0 && activeIndex < blocks.length - 1) {
    documentContent.insertBefore(newBlock, blocks[activeIndex + 1]);
  } else {
    documentContent.appendChild(newBlock);
  }
  
  // Aggiungi gli event handler necessari
  setupBlockEventHandlers(newBlock);
  
  // Focus sul nuovo blocco
  const blockContent = newBlock.querySelector('.block-content');
  if (blockContent) {
    setTimeout(() => {
      blockContent.focus();
      
      // Rimuovi la classe focused da tutti i blocchi
      documentContent.querySelectorAll('.note-block').forEach(b => b.classList.remove('focused'));
      
      // Aggiungi la classe focused al nuovo blocco
      newBlock.classList.add('focused');
    }, 0);
  }
}

function showAddBlockMenu(blockContent) {
    // Remove any existing menus
    const existingMenu = document.querySelector('.add-block-menu');
    if (existingMenu) {
        existingMenu.remove();
    }
    
    const block = blockContent.closest('.note-block');
    const blockRect = blockContent.getBoundingClientRect();
    const noteId = blockContent.closest('[data-note-id]').getAttribute('data-note-id');
    const blockIndex = parseInt(block.getAttribute('data-block-index'));
    
    const menu = document.createElement('div');
    menu.className = 'add-block-menu';
    
    // Position the menu near the cursor but ensure it's fully visible
    const documentOverlay = document.getElementById('documentOverlay');
    if (documentOverlay) {
        menu.style.left = `${blockRect.left}px`;
        menu.style.top = `${blockRect.bottom + 5}px`;
        menu.style.maxHeight = '350px';
        menu.style.overflowY = 'auto';
        menu.style.backgroundColor = '#252525';
        menu.style.color = '#e6e6e6';
        menu.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
    } else {
        menu.style.left = `${blockRect.left}px`;
        menu.style.top = `${blockRect.bottom + 5}px`;
    }
    
    // Add search box
    const searchBox = document.createElement('div');
    searchBox.className = 'add-block-menu-search';
    
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search for a block...';
    searchInput.className = 'add-block-menu-search-input';
    searchInput.style.backgroundColor = '#333';
    searchInput.style.color = '#fff';
    searchInput.style.border = 'none';
    
    searchBox.appendChild(searchInput);
    menu.appendChild(searchBox);
    
    // Basic blocks section
    const basicSection = createMenuSection('Basic blocks', [
        { 
            id: 'paragraph', 
            name: 'Text', 
            icon: 'fa-paragraph', 
            description: 'Plain text block',
            kbd: '↵'
        },
        { 
            id: 'heading', 
            name: 'Heading 1', 
            icon: 'fa-heading', 
            description: 'Large section heading',
            kbd: '#'
        },
        { 
            id: 'subheading', 
            name: 'Heading 2', 
            icon: 'fa-heading', 
            description: 'Medium section heading',
            kbd: '##'
        },
        { 
            id: 'subheading3', 
            name: 'Heading 3', 
            icon: 'fa-heading', 
            description: 'Small section heading',
            kbd: '###'
        }
    ]);
    
    // Media blocks section
    const mediaSection = createMenuSection('Media', [
        { 
            id: 'image', 
            name: 'Image', 
            icon: 'fa-image', 
            description: 'Upload or embed an image',
            kbd: '📷'
        },
        { 
            id: 'divider', 
            name: 'Divider', 
            icon: 'fa-minus', 
            description: 'Visual separator',
            kbd: '---'
        },
        { 
            id: 'code', 
            name: 'Code', 
            icon: 'fa-code', 
            description: 'Code block with syntax highlighting',
            kbd: '```'
        }
    ]);
    
    // Interactive blocks section
    const interactiveSection = createMenuSection('Interactive', [
        { 
            id: 'todo', 
            name: 'To-do list', 
            icon: 'fa-check-square', 
            description: 'Track tasks with a to-do list',
            kbd: '[]'
        },
        { 
            id: 'toggle', 
            name: 'Toggle', 
            icon: 'fa-caret-right', 
            description: 'Collapsible content block',
            kbd: '>'
        },
        { 
            id: 'callout', 
            name: 'Callout', 
            icon: 'fa-exclamation-circle', 
            description: 'Highlighted content block',
            kbd: '!'
        }
    ]);
    
    menu.appendChild(basicSection);
    menu.appendChild(mediaSection);
    menu.appendChild(interactiveSection);
    
    // Add the menu to the document
    document.body.appendChild(menu);
    
    // Focus the search input
    searchInput.focus();
    
    // Filter menu items when typing in search
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const items = menu.querySelectorAll('.add-block-item');
        
        items.forEach(item => {
            const itemName = item.querySelector('.add-block-item-header').textContent.toLowerCase();
            const itemDesc = item.querySelector('.add-block-item-description').textContent.toLowerCase();
            
            if (itemName.includes(searchTerm) || itemDesc.includes(searchTerm)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
        
        // Show/hide section titles based on visible items
        const sections = menu.querySelectorAll('.add-block-menu-section');
        sections.forEach(section => {
            const visibleItems = Array.from(section.querySelectorAll('.add-block-item')).filter(item => 
                item.style.display !== 'none'
            );
            
            const sectionTitle = section.querySelector('.add-block-menu-section-title');
            sectionTitle.style.display = visibleItems.length > 0 ? 'block' : 'none';
        });
    });
    
    // Handle click outside to close menu
    const handleOutsideClick = (e) => {
        if (!menu.contains(e.target) && e.target !== blockContent) {
            menu.remove();
            document.removeEventListener('click', handleOutsideClick);
        }
    };
    
    // Small delay to prevent immediate closing
    setTimeout(() => {
        document.addEventListener('click', handleOutsideClick);
    }, 100);
    
    // Escape key to close menu
    document.addEventListener('keydown', function escKeyHandler(e) {
        if (e.key === 'Escape') {
            menu.remove();
            document.removeEventListener('keydown', escKeyHandler);
        }
    });
    
    // Function to create a section of menu items
    function createMenuSection(title, items) {
        const section = document.createElement('div');
        section.className = 'add-block-menu-section';
        
        const sectionTitle = document.createElement('div');
        sectionTitle.className = 'add-block-menu-section-title';
        sectionTitle.textContent = title;
        
        section.appendChild(sectionTitle);
        
        items.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = 'add-block-item';
            itemEl.style.cursor = 'pointer';
            
            // Create header with icon and name
            const itemHeader = document.createElement('div');
            itemHeader.className = 'add-block-item-header';
            
            const icon = document.createElement('i');
            icon.className = `fas ${item.icon}`;
            icon.style.marginRight = '8px';
            icon.style.width = '16px';
            icon.style.textAlign = 'center';
            
            const itemName = document.createElement('span');
            itemName.textContent = item.name;
            
            itemHeader.appendChild(icon);
            itemHeader.appendChild(itemName);
            
            // Create description
            const itemDesc = document.createElement('div');
            itemDesc.className = 'add-block-item-description';
            itemDesc.textContent = item.description;
            
            // Create keyboard shortcut
            const itemKbd = document.createElement('div');
            itemKbd.className = 'add-block-item-kbd';
            itemKbd.textContent = item.kbd;
            
            // Add all to item
            itemEl.appendChild(itemHeader);
            itemEl.appendChild(itemDesc);
            itemEl.appendChild(itemKbd);
            
            // Handle item click
            itemEl.addEventListener('click', () => {
                handleBlockTypeSelection(noteId, blockIndex, item.id);
                menu.remove();
                document.removeEventListener('click', handleOutsideClick);
            });
            
            section.appendChild(itemEl);
        });
        
        return section;
    }
}

function exitDocumentMode() {
    const overlay = document.getElementById('documentOverlay');
    if (!overlay) return;
    
    const noteId = overlay.getAttribute('data-note-id');
    const note = document.querySelector(`.workspace-note[data-note-id="${noteId}"]`);
    
    if (note) {
        // Save all content back to the original note
        saveDocumentContent(overlay, note);
        
        // Remove overlay with fade-out animation
        overlay.style.opacity = '0';
        
        setTimeout(() => {
            // Rimuovi l'overlay dal suo parent, non necessariamente dal body
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
            
            document.body.classList.remove('document-mode');
            restoreCanvasElements();
            
            // Remove any other document-related elements that might be left
            const menus = document.querySelectorAll('.add-block-menu, .document-insert-menu');
            menus.forEach(menu => menu.remove());
            
            // Restore canvas state
            const canvasStateStr = sessionStorage.getItem('canvasState');
            if (canvasStateStr) {
                try {
                    const canvasState = JSON.parse(canvasStateStr);
                    const workspaceEl = document.querySelector('.workflow-workspace');
                    
                    if (workspaceEl && canvasState) {
                        workspaceEl.scrollTop = canvasState.scrollTop;
                        workspaceEl.scrollLeft = canvasState.scrollLeft;
                        
                        canvasScale = canvasState.scale;
                        canvasOffsetX = canvasState.translateX;
                        canvasOffsetY = canvasState.translateY;
                        
                        updateCanvasTransform();
                    }
                } catch (e) {
                    console.error('Failed to restore canvas state:', e);
                }
            }
        }, 200);
    }
}

// Helper function to save document content back to the note
function saveDocumentContent(overlay, note) {
    const documentContainer = overlay.querySelector('.document-container');
    const noteContent = note.querySelector('.note-content');
    
    if (documentContainer && noteContent) {
        // Clear the original note content
        noteContent.innerHTML = '';
        
        // Copy each block from the document to the note
        const blocks = documentContainer.querySelectorAll('.note-block');
        blocks.forEach((block, index) => {
            const newBlock = block.cloneNode(true);
            
            // Reset block styling that might have been affected by dark mode
            const blockContent = newBlock.querySelector('.block-content');
            if (blockContent) {
                blockContent.style.color = ''; // Remove any explicit color setting
                
                // Remove dark mode specific attributes
                blockContent.removeAttribute('data-placeholder');
                
                // Remove any event listeners (they'll be re-added when needed)
                const newBlockContent = blockContent.cloneNode(true);
                blockContent.parentNode.replaceChild(newBlockContent, blockContent);
            }
            
            // Update block index
            newBlock.setAttribute('data-block-index', index);
            
            noteContent.appendChild(newBlock);
        });
        
        // Update note title
        const titleInput = overlay.querySelector('.document-title-input');
        if (titleInput) {
            const noteTitle = note.querySelector('.note-title');
            if (noteTitle) {
                noteTitle.textContent = titleInput.value;
            }
        }
    }
}

// Creates a new note in the workflow
function createNewNote() {
  console.log('Creating new note');
  
  // Get the workspace area
  const workspaceArea = document.getElementById('workflowWorkspace');
  if (!workspaceArea) {
    console.error('Workspace area not found');
    return;
  }

  // Increment note counter for unique IDs
  noteCounter++;
  const noteId = `note-${Date.now()}-${noteCounter}`;
  
  // Create the note element
  const note = document.createElement('div');
  note.className = 'workspace-note';
  note.id = noteId;
  
  // Calculate position - place in viewport center or offset from last note
  let posX = 100, posY = 100;
  
  if (lastNotePosition) {
    // Offset from the last note position
    posX = lastNotePosition.x + 30;
    posY = lastNotePosition.y + 30;
    
    // If too far right, reset X and move down
    if (posX > 600) {
      posX = 100;
      posY += 50;
    }
  }
  
  // Update last note position for next time
  lastNotePosition = { x: posX, y: posY };
  
  // Set position and size
  note.style.transform = `translate(${posX}px, ${posY}px)`;
  note.style.width = '300px';
  note.style.height = 'auto';
  
  // Create note header
  const noteHeader = document.createElement('div');
  noteHeader.className = 'note-header';
  
  const noteTitle = document.createElement('div');
  noteTitle.className = 'note-title';
  noteTitle.contentEditable = true;
  noteTitle.textContent = 'Nuova Nota';
  
  const noteActions = document.createElement('div');
  noteActions.className = 'note-actions';
  noteActions.innerHTML = `
    <button class="note-action note-expand-btn"><i class="fas fa-expand-alt"></i></button>
    <button class="note-action note-close-btn"><i class="fas fa-times"></i></button>
  `;
  
  noteHeader.appendChild(noteTitle);
  noteHeader.appendChild(noteActions);
  note.appendChild(noteHeader);
  
  // Create note content
  const noteContent = document.createElement('div');
  noteContent.className = 'note-content';
  
  // Add initial empty paragraph block
  const block = document.createElement('div');
  block.className = 'note-block block-paragraph';
  block.setAttribute('data-block-type', 'paragraph');
  block.setAttribute('data-block-index', '0');
  
  const blockContent = document.createElement('div');
  blockContent.className = 'block-content';
  blockContent.setAttribute('contenteditable', 'true');
  blockContent.setAttribute('data-placeholder', 'Type something...');
  
  // Add block drag handle
  const dragHandle = document.createElement('div');
  dragHandle.className = 'block-drag-handle';
  dragHandle.innerHTML = '<i class="fas fa-grip-lines"></i>';
  
  block.appendChild(dragHandle);
  block.appendChild(blockContent);
  noteContent.appendChild(block);
  note.appendChild(noteContent);
  
  // Add resize handle
  const resizeHandle = document.createElement('div');
  resizeHandle.className = 'note-resize-handle';
  note.appendChild(resizeHandle);
  
  // Add the note to the workspace
  workspaceArea.appendChild(note);
  
  // Set up event handlers for the note
  setupNoteEventHandlers(note);
  
  // Add the note to the active note tracking
  setActiveNote(noteId);
  
  // Update the minimap
  updateMinimap();
  
  // Focus on first block content
  setTimeout(() => {
    blockContent.focus();
  }, 100);

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
  
  // Aggiungi gestore per il drag handle
  const dragHandle = block.querySelector('.block-drag-handle');
  if (dragHandle) {
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
  if (!note) return;
  
  console.log(`Saving state for note ${noteId}`);
  
  // In un'implementazione reale, qui si salverebbe lo stato della nota
  // Per ora lo gestiamo solo con un log, ma potrebbe essere implementato con localStorage o API
  
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
  const blocks = note.querySelectorAll('.note-block');
  blocks.forEach(block => {
    noteState.blocks.push({
      type: block.dataset.blockType || 'paragraph',
      content: block.querySelector('.block-content')?.innerHTML || '',
      checked: block.querySelector('input[type="checkbox"]')?.checked || false
    });
  });
  
  // In un'implementazione reale, qui si salverebbe l'oggetto noteState
  // localStorage.setItem(`note_${noteId}`, JSON.stringify(noteState));
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