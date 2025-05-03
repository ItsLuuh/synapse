// Gestione dello stato dei workflow per Synapse

// Memorizza gli stati dei workflow per ID
const workflowStates = {};

// Esponi le funzioni al renderer.js
window.workflowFunctions = window.workflowFunctions || {};

// Funzione per salvare lo stato di un workflow
window.workflowFunctions.saveWorkflowState = function(workflowId, filename = null) {
  console.log(`Saving workflow state for: ${workflowId}`);
  
  // Ottieni il contenitore del workflow
  const workspaceArea = document.getElementById('workflowWorkspace');
  if (!workspaceArea) return null;
  
  // Raccogli tutte le note nel workspace
  const notes = workspaceArea.querySelectorAll('.workspace-note');
  const notesData = [];
  
  notes.forEach(note => {
    // Raccogli i dati della nota
    const noteId = note.id;
    const noteTitle = note.querySelector('.note-title')?.textContent || 'Nuova Nota';
    
    // Ottieni la posizione della nota
    const style = window.getComputedStyle(note);
    const transform = style.transform || style.webkitTransform;
    let x = 0, y = 0;
    
    if (transform && transform !== 'none') {
      const matrix = new DOMMatrix(transform);
      x = matrix.m41;
      y = matrix.m42;
    }
    
    // Raccogli i blocchi della nota
    const blocks = note.querySelectorAll('.note-block');
    const blocksData = [];
    
    blocks.forEach(block => {
      const blockType = block.dataset.type || 'paragraph';
      const blockContent = block.querySelector('.block-content')?.innerHTML || '';
      
      blocksData.push({
        type: blockType,
        content: blockContent
      });
    });
    
    // Aggiungi i dati della nota all'array
    notesData.push({
      id: noteId,
      title: noteTitle,
      x: x,
      y: y,
      width: note.offsetWidth,
      height: note.offsetHeight,
      blocks: blocksData
    });
  });
  
  // Raccogli tutti i nodi AI nel workspace
  const aiNodes = workspaceArea.querySelectorAll('.workspace-ai-node');
  const aiNodesData = [];
  
  aiNodes.forEach(node => {
    // Raccogli i dati del nodo
    const nodeId = node.id;
    const nodeType = node.dataset.nodeType;
    
    // Ottieni la posizione del nodo
    const style = window.getComputedStyle(node);
    const transform = style.transform || style.webkitTransform;
    let x = 0, y = 0;
    
    if (transform && transform !== 'none') {
      const matrix = new DOMMatrix(transform);
      x = matrix.m41;
      y = matrix.m42;
    }
    
    // Aggiungi i dati del nodo all'array
    aiNodesData.push({
      id: nodeId,
      type: nodeType,
      x: x,
      y: y
    });
  });
  
  // Raccogli tutte le connessioni tra nodi
  const connectorElements = workspaceArea.querySelectorAll('.node-connector');
  const connectorsData = [];
  
  // Utilizziamo la variabile connectors definita in workflow.js
  if (window.connectors) {
    window.connectors.forEach(connector => {
      connectorsData.push({
        id: connector.id,
        sourceNodeId: connector.sourceNodeId,
        targetNodeId: connector.targetNodeId,
        sourcePortType: connector.sourcePortType,
        targetPortType: connector.targetPortType
      });
    });
  }
  
  // Raccogli le informazioni sul canvas
  const canvasData = {
    scale: window.canvasScale || 1,
    offsetX: window.canvasOffsetX || 0,
    offsetY: window.canvasOffsetY || 0
  };
  
  // Crea l'oggetto di stato completo
  const state = {
    notes: notesData,
    aiNodes: aiNodesData,
    connectors: connectorsData,
    canvas: canvasData,
    lastUpdated: new Date().toISOString(),
    metadata: {
      version: '1.0.0',
      author: 'Synapse User', // In futuro, recuperare dal profilo utente
      title: filename || `Workflow ${new Date().toLocaleString('it-IT')}`
    }
  };
  
  // Salva lo stato in memoria
  workflowStates[workflowId] = state;
  
  // Salva in localStorage per persistenza
  try {
    localStorage.setItem(`workflow_${workflowId}`, JSON.stringify(state));
  } catch (e) {
    console.error('Error saving workflow state to localStorage:', e);
  }
  
  // Se è specificato un filename, salva come file .syn
  if (filename) {
    saveWorkflowToFile(state, filename);
  }
  
  return state;
};

// Funzione per caricare lo stato di un workflow
window.workflowFunctions.loadWorkflowState = function(workflowId, fileContent = null) {
  console.log(`Loading workflow state for: ${workflowId}`);
  
  // Se è fornito il contenuto del file, utilizziamo quello
  let state = null;
  
  if (fileContent) {
    try {
      state = JSON.parse(fileContent);
    } catch (e) {
      console.error('Error parsing workflow file:', e);
      return false;
    }
  } else {
    // Altrimenti, prova a caricare lo stato dalla memoria
    state = workflowStates[workflowId];
    
    // Se non esiste in memoria, prova a caricarlo da localStorage
    if (!state) {
      try {
        const savedState = localStorage.getItem(`workflow_${workflowId}`);
        if (savedState) {
          state = JSON.parse(savedState);
          workflowStates[workflowId] = state;
        }
      } catch (e) {
        console.error('Error loading workflow state from localStorage:', e);
      }
    }
  }
  
  // Ottieni il contenitore del workflow
  const workspaceArea = document.getElementById('workflowWorkspace');
  if (!workspaceArea) return false;
  
  // Pulisci il workspace attuale
  const existingNotes = workspaceArea.querySelectorAll('.workspace-note');
  existingNotes.forEach(note => note.remove());
  
  const existingAINodes = workspaceArea.querySelectorAll('.workspace-ai-node');
  existingAINodes.forEach(node => node.remove());
  
  const existingConnectors = workspaceArea.querySelectorAll('.node-connector');
  existingConnectors.forEach(connector => connector.remove());
  
  // Se non c'è stato salvato, creiamo uno stato di default con una nota
  if (!state) {
    console.log(`No saved state found for workflow: ${workflowId}, creating default note`);
    
    // Crea una nota di default
    if (typeof window.createNewNote === 'function') {
      window.createNewNote();
      return true;
    } else {
      console.warn('createNewNote function not found in global scope');
      return false;
    }
  }
  
  // Imposta lo stato del canvas se disponibile
  if (state.canvas) {
    window.canvasScale = state.canvas.scale || 1;
    window.canvasOffsetX = state.canvas.offsetX || 0;
    window.canvasOffsetY = state.canvas.offsetY || 0;
    window.updateWorkspaceTransform();
  }
  
  // Ricrea le note dal salvataggio
  if (state.notes && Array.isArray(state.notes)) {
    state.notes.forEach(noteData => {
      // Crea una nuova nota
      const note = document.createElement('div');
      note.className = 'workspace-note';
      note.id = noteData.id;
      
      // Imposta la posizione e dimensione
      note.style.transform = `translate(${noteData.x}px, ${noteData.y}px)`;
      note.style.width = `${noteData.width}px`;
      note.style.height = `${noteData.height}px`;
      
      // Crea l'header della nota
      const noteHeader = document.createElement('div');
      noteHeader.className = 'note-header';
      
      const noteTitle = document.createElement('div');
      noteTitle.className = 'note-title';
      noteTitle.contentEditable = true;
      noteTitle.textContent = noteData.title;
      
      const noteActions = document.createElement('div');
      noteActions.className = 'note-actions';
      noteActions.innerHTML = `
        <button class="note-action"><i class="fas fa-ellipsis-h"></i></button>
        <button class="note-action note-close-btn"><i class="fas fa-times"></i></button>
      `;
      
      noteHeader.appendChild(noteTitle);
      noteHeader.appendChild(noteActions);
      note.appendChild(noteHeader);
      
      // Crea il contenitore dei blocchi
      const noteContent = document.createElement('div');
      noteContent.className = 'note-content';
      note.appendChild(noteContent);
      
      // Aggiungi i blocchi
      noteData.blocks.forEach(blockData => {
        const block = document.createElement('div');
        block.className = 'note-block';
        block.dataset.type = blockData.type;
        
        const blockContent = document.createElement('div');
        blockContent.className = 'block-content';
        blockContent.innerHTML = blockData.content;
        blockContent.contentEditable = true;
        
        block.appendChild(blockContent);
        noteContent.appendChild(block);
        
        // Imposta gli event handler per il blocco
        if (typeof window.setupBlockEventHandlers === 'function') {
          window.setupBlockEventHandlers(block);
        }
      });
      
      // Aggiungi i resize handle
      const resizeHandle = document.createElement('div');
      resizeHandle.className = 'note-resize-handle';
      
      // Add specific resize handles for each corner and edge
      const resizePositions = ['top-left', 'top', 'top-right', 'right', 'bottom-right', 'bottom', 'bottom-left', 'left'];
      resizePositions.forEach(position => {
        const handle = document.createElement('div');
        handle.className = `resize-handle ${position}`;
        handle.dataset.position = position;
        resizeHandle.appendChild(handle);
      });
      
      note.appendChild(resizeHandle);
      
      // Aggiungi la nota al workspace
      workspaceArea.appendChild(note);
      
      // Configura gli event listener per la nota
      setupNoteTitleEditing(noteTitle, noteData.id);
      
      // Setup event handlers for the note
      if (typeof window.setupNoteEventHandlers === 'function') {
        window.setupNoteEventHandlers(note);
      }
      
      // Aggiungi i pulsanti per aggiungere blocchi tra i blocchi esistenti
      initializeAddBetweenButtons(note);
    });
  }
  
  // Ricrea i nodi AI dal salvataggio
  if (state.aiNodes && Array.isArray(state.aiNodes)) {
    state.aiNodes.forEach(nodeData => {
      // Se esiste la funzione createAINode, utilizziamola
      if (typeof window.createAINode === 'function') {
        const node = window.createAINode(nodeData.type, nodeData.x, nodeData.y);
        
        // Imposta l'ID corretto
        if (node && nodeData.id) {
          node.id = nodeData.id;
        }
      } else {
        console.warn('createAINode function not found in global scope');
      }
    });
  }
  
  // Ricrea i connettori dal salvataggio
  if (state.connectors && Array.isArray(state.connectors)) {
    // Resetta l'array dei connettori se disponibile
    if (window.connectors) {
      window.connectors = [];
    }
    
    // Attendi che i nodi siano completamente renderizzati
    setTimeout(() => {
      state.connectors.forEach(connectorData => {
        // Se esiste la funzione createConnection, utilizziamola
        if (typeof window.createConnection === 'function') {
          // Trova i nodi e le porte
          const sourceNode = document.getElementById(connectorData.sourceNodeId);
          const targetNode = document.getElementById(connectorData.targetNodeId);
          
          if (sourceNode && targetNode) {
            const sourcePort = sourceNode.querySelector(`.node-connector-port.${connectorData.sourcePortType}`);
            const targetPort = targetNode.querySelector(`.node-connector-port.${connectorData.targetPortType}`);
            
            if (sourcePort && targetPort) {
              window.createConnection(sourceNode, sourcePort, targetNode, targetPort);
            }
          }
        } else {
          console.warn('createConnection function not found in global scope');
        }
      });
    }, 100);
  }
  
  // Aggiorna la minimappa
  if (typeof window.updateMinimap === 'function') {
    window.updateMinimap();
  }
  
  console.log(`Loaded workflow state with ${state.notes ? state.notes.length : 0} notes and ${state.aiNodes ? state.aiNodes.length : 0} AI nodes`);
  return true;
};

// Funzione per ottenere lo stato corrente di un workflow
window.workflowFunctions.getWorkflowState = function(workflowId) {
  // Se lo stato è già in memoria, ritornalo
  if (workflowStates[workflowId]) {
    return workflowStates[workflowId];
  }
  
  // Altrimenti, salvalo prima e poi ritornalo
  return window.workflowFunctions.saveWorkflowState(workflowId);
};

// Funzione per salvare il workflow come file .syn
function saveWorkflowToFile(state, filename) {
  // In un'applicazione Electron reale, qui utilizzeremmo l'API fs per salvare il file
  // Ma poiché ciò richiede l'accesso al filesystem e ipc, per ora simulo il salvataggio
  
  console.log(`Saving workflow to file: ${filename}`);
  
  // Crea un oggetto Blob con il contenuto JSON
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  
  // Crea un URL per il blob
  const url = URL.createObjectURL(blob);
  
  // Crea un elemento <a> per il download
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.syn') ? filename : `${filename}.syn`;
  
  // Aggiungi l'elemento al documento, clicca per scaricare e rimuovilo
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  // Rilascia l'URL del blob
  URL.revokeObjectURL(url);
  
  // Aggiorna l'albero delle cartelle (da implementare in futuro)
  console.log('File saved successfully!');
}

// Funzione per caricare un workflow da un file .syn
window.workflowFunctions.loadWorkflowFromFile = function(workflowId) {
  // Crea un input file nascosto
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.syn,application/json';
  fileInput.style.display = 'none';
  
  // Aggiungi l'elemento al documento
  document.body.appendChild(fileInput);
  
  // Gestisci la selezione del file
  fileInput.addEventListener('change', function() {
    if (fileInput.files.length === 0) {
      document.body.removeChild(fileInput);
      return;
    }
    
    const file = fileInput.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
      const fileContent = e.target.result;
      
      // Carica il workflow dal contenuto del file
      window.workflowFunctions.loadWorkflowState(workflowId, fileContent);
      
      // Rimuovi l'input file
      document.body.removeChild(fileInput);
    };
    
    reader.onerror = function() {
      console.error('Error reading file');
      document.body.removeChild(fileInput);
    };
    
    reader.readAsText(file);
  });
  
  // Simula un click per aprire il selettore di file
  fileInput.click();
};

// Funzione per inizializzare i pulsanti di aggiunta tra i blocchi
// Questa è una funzione di supporto che dovrebbe essere definita anche in workflow.js
function initializeAddBetweenButtons(note) {
  if (typeof window.initializeAddBetweenButtons === 'function') {
    window.initializeAddBetweenButtons(note);
  } else {
    console.warn('initializeAddBetweenButtons function not found in global scope');
  }
}

// Funzione per configurare l'editing del titolo della nota
// Questa è una funzione di supporto che dovrebbe essere definita anche in workflow.js
function setupNoteTitleEditing(titleElement, noteId) {
  if (typeof window.setupNoteTitleEditing === 'function') {
    window.setupNoteTitleEditing(titleElement, noteId);
  } else {
    console.warn('setupNoteTitleEditing function not found in global scope');
    
    // Implementazione di fallback
    titleElement.contentEditable = true;
    
    titleElement.addEventListener('blur', () => {
      const newTitle = titleElement.textContent.trim() || 'Nuova Nota';
      if (window.noteTitles) {
        window.noteTitles[noteId] = newTitle;
      }
    });
  }
}