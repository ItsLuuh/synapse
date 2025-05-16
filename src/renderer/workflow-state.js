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
    
    // Controlla se esiste uno stato salvato della nota in localStorage
    let savedNoteState = null;
    try {
      const savedNoteData = localStorage.getItem(`note_${noteId}`);
      if (savedNoteData) {
        savedNoteState = JSON.parse(savedNoteData);
      }
    } catch (e) {
      console.error(`Errore nel caricare lo stato della nota ${noteId} da localStorage:`, e);
    }
    
    // Raccogli i blocchi della nota
    const blocks = note.querySelectorAll('.note-block');
    const blocksData = [];
    
    // Se ci sono blocchi nella nota o se c'è uno stato salvato con blocchi
    if (blocks.length > 0) {
      blocks.forEach(block => {
        const blockType = block.dataset.blockType || 'paragraph';
        const blockContent = block.querySelector('.block-content')?.innerHTML || '';
        
        blocksData.push({
          type: blockType,
          content: blockContent
        });
      });
    } 
    // Se non ci sono blocchi ma esiste uno stato salvato, usa quello
    else if (savedNoteState && savedNoteState.blocks && savedNoteState.blocks.length > 0) {
      console.log(`Usando blocchi salvati per la nota ${noteId} (${savedNoteState.blocks.length} blocchi)`);
      savedNoteState.blocks.forEach(block => {
        blocksData.push({
          type: block.type || 'paragraph',
          content: block.content || ''
        });
      });
    }
    
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
  
  // Aggiungi le connessioni tra le note
  const connectionsData = [];
  
  // Utilizziamo la variabile connections definita in workflow.js
  if (window.connections && Array.isArray(window.connections)) {
    window.connections.forEach(connection => {
      connectionsData.push({
        id: connection.id,
        startElementId: connection.startElementId,
        startPortPosition: connection.startPortPosition,
        endElementId: connection.endElementId,
        endPortPosition: connection.endPortPosition,
        label: connection.label || '', // Salviamo l'etichetta della connessione
        style: connection.style || { // Salviamo lo stile della connessione
          index: 0,
          stroke: '#4a4dff',
          strokeWidth: '2',
          dashArray: 'none',
          opacity: '1'
        }
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
    connections: connectionsData, // Aggiungiamo le connessioni delle note allo stato
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
    window.updateCanvasTransform();
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
      note.style.transformOrigin = '0 0';
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
        <button class="note-action note-expand-btn"><i class="fas fa-expand-alt"></i></button>
        <button class="note-action note-close-btn"><i class="fas fa-times"></i></button>
      `;
      
      noteHeader.appendChild(noteTitle);
      noteHeader.appendChild(noteActions);
      note.appendChild(noteHeader);
      
      // Crea il contenitore dei blocchi
      const noteContent = document.createElement('div');
      noteContent.className = 'note-content';
      note.appendChild(noteContent);
      
      // Aggiungi la maniglia di ridimensionamento
      const resizeHandle = document.createElement('div');
      resizeHandle.className = 'note-resize-handle';
      resizeHandle.innerHTML = '<i class="fas fa-grip-lines-diagonal"></i>';
      note.appendChild(resizeHandle);
      
      // Aggiungi le maniglie di ridimensionamento aggiuntive
      if (typeof window.addResizeHandlesToNote === 'function') {
        window.addResizeHandlesToNote(note);
      }
      
      // Aggiungi i blocchi dalla nota
      if (noteData.blocks && noteData.blocks.length > 0) {
        noteData.blocks.forEach((blockData, index) => {
          const block = document.createElement('div');
          block.className = 'note-block';
          block.dataset.blockType = blockData.type || 'paragraph';
          block.dataset.blockIndex = index;
          
          // Crea il contenuto del blocco
          const blockContent = document.createElement('div');
          blockContent.className = 'block-content';
          blockContent.contentEditable = true;
          blockContent.innerHTML = blockData.content || '';
          
          // Aggiungi gestori di eventi per l'editing
          blockContent.addEventListener('input', function(e) {
            const note = e.target.closest('.workspace-note');
            if (note && window.handleNoteContentEdit) {
              window.handleNoteContentEdit(e);
            }
          });
          
          block.appendChild(blockContent);
          noteContent.appendChild(block);
        });
      }
      // Se non ci sono blocchi, crea un blocco vuoto di default
      else {
        const block = document.createElement('div');
        block.className = 'note-block';
        block.dataset.blockType = 'paragraph';
        block.dataset.blockIndex = 0;
        
        const blockContent = document.createElement('div');
        blockContent.className = 'block-content';
        blockContent.contentEditable = true;
        
        // Aggiungi gestori di eventi per l'editing
        blockContent.addEventListener('input', function(e) {
          const note = e.target.closest('.workspace-note');
          if (note && window.handleNoteContentEdit) {
            window.handleNoteContentEdit(e);
          }
        });
        
        block.appendChild(blockContent);
        noteContent.appendChild(block);
      }
      
      // Aggiungi la nota al workspace
      workspaceArea.appendChild(note);
      
      // Configura gli eventi della nota
      setupNoteEventHandlers(note);
      
      // Configura editor del titolo
      if (window.setupNoteTitleEditing) {
        window.setupNoteTitleEditing(noteTitle, noteData.id);
      }
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
  
  // Ricrea le connessioni dal salvataggio
  if (state.connections && Array.isArray(state.connections)) {
    // Resetta l'array delle connessioni se disponibile
    if (typeof window.connections !== 'undefined') {
      window.connections = [];
    }
    
    // Attendi che le note siano completamente renderizzate
    setTimeout(() => {
      state.connections.forEach(connectionData => {
        // Trova gli elementi e le porte
        const startElement = document.getElementById(connectionData.startElementId);
        const endElement = document.getElementById(connectionData.endElementId);
        
        if (startElement && endElement) {
          const startPort = startElement.querySelector(`.connection-port[data-position="${connectionData.startPortPosition}"]`);
          const endPort = endElement.querySelector(`.connection-port[data-position="${connectionData.endPortPosition}"]`);
          
          if (startPort && endPort) {
            // Crea la connessione
            const connection = window.createPermanentConnection(startElement, startPort, endElement, endPort);
            
            // Se la connessione è stata creata con successo, imposta le proprietà aggiuntive
            if (connection) {
              // Imposta l'etichetta se presente
              if (connectionData.label) {
                connection.label = connectionData.label;
                
                // Crea e visualizza l'etichetta permanente
                if (typeof window.addConnectionLabel === 'function') {
                  window.addConnectionLabel(connection.id, connection.path, false);
                }
              }
              
              // Imposta lo stile se presente
              if (connectionData.style) {
                connection.style = connectionData.style;
                
                // Applica lo stile salvato
                connection.path.setAttribute('stroke', connectionData.style.stroke);
                connection.path.setAttribute('stroke-width', connectionData.style.strokeWidth);
                connection.path.style.strokeDasharray = connectionData.style.dashArray === 'none' ? '' : connectionData.style.dashArray;
                connection.path.style.opacity = connectionData.style.opacity;
                connection.path.setAttribute('data-style-index', connectionData.style.index);
              }
              
              // Aggiorna la posizione per visualizzare l'etichetta e la connessione
              setTimeout(() => {
                window.updateConnectionPosition(connection);
              }, 100);
            }
          }
        }
      });
    }, 200);
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

// Importa i messaggi generati da Protocol Buffer
// NOTA: Il percorso deve essere corretto rispetto alla posizione di questo file.
// Se workflow-state.js è in src/renderer/ e i proto generati sono in src/common/generated_protos/
// il percorso potrebbe essere qualcosa come:
// const { WorkflowState, Note, Connection, Position, Size, ConnectionStyle } = require('../common/generated_protos/workflow_pb.js');
// Tuttavia, in un ambiente renderer Electron con preload, potremmo dover gestire l'import/require in modo diverso
// o assicurarsi che i file generati siano accessibili. Per ora, assumiamo che siano accessibili.
// Potrebbe essere necessario configurare Webpack o un bundler simile se si usa un sistema di moduli ES6.
// Per semplicità, potremmo anche esporre questi messaggi tramite il preload script se l'import diretto non funziona.

// Funzione per salvare il workflow come file .syn usando Protocol Buffers
async function saveWorkflowToFile(state, filename) {
  console.log(`Attempting to save workflow to file (ProtoBuf): ${filename}`);

  let WorkflowState, NoteMessage, ConnectionMessage, PositionMessage, SizeMessage, ConnectionStyleMessage;
  try {
    // Tentativo di caricare i moduli Proto (questo potrebbe fallire nel renderer senza setup aggiuntivo)
    const protoMessages = require('../common/generated_protos/workflow_pb.js');
    WorkflowState = protoMessages.WorkflowState;
    NoteMessage = protoMessages.Note;
    ConnectionMessage = protoMessages.Connection;
    PositionMessage = protoMessages.Position;
    SizeMessage = protoMessages.Size;
    ConnectionStyleMessage = protoMessages.ConnectionStyle;
  } catch (e) {
    console.error("Failed to load ProtoBuf modules. Ensure they are correctly generated and accessible.", e);
    alert("Errore critico: Impossibile caricare i moduli per il salvataggio del workflow.");
    return;
  }

  const finalFilename = filename.endsWith('.syn') ? filename : `${filename}.syn`;

  // 1. Convertire lo stato JSON in messaggi ProtoBuf
  const workflowStateMessage = new WorkflowState();
  workflowStateMessage.setId(state.id || finalFilename); // Usa l'ID esistente o il nome del file

  if (state.notes && Array.isArray(state.notes)) {
    state.notes.forEach(noteData => {
      const noteMsg = new NoteMessage();
      noteMsg.setId(noteData.id);
      noteMsg.setTitle(noteData.title);
      if (noteData.position) {
        const posMsg = new PositionMessage();
        posMsg.setX(parseFloat(noteData.position.x) || 0);
        posMsg.setY(parseFloat(noteData.position.y) || 0);
        noteMsg.setPosition(posMsg);
      }
      if (noteData.size) {
        const sizeMsg = new SizeMessage();
        sizeMsg.setWidth(parseFloat(noteData.size.width) || 200); // Default size
        sizeMsg.setHeight(parseFloat(noteData.size.height) || 100); // Default size
        noteMsg.setSize(sizeMsg);
      }
      noteMsg.setContent(JSON.stringify(noteData.content)); // Per ora, il contenuto resta JSON
      workflowStateMessage.addNotes(noteMsg);
    });
  }

  if (state.connections && Array.isArray(state.connections)) {
    state.connections.forEach(connData => {
      const connMsg = new ConnectionMessage();
      connMsg.setId(connData.id);
      connMsg.setStartElementId(connData.startElementId);
      connMsg.setStartPortPosition(connData.startPortPosition);
      connMsg.setEndElementId(connData.endElementId);
      connMsg.setEndPortPosition(connData.endPortPosition);
      if (connData.label) {
        connMsg.setLabel(connData.label);
      }
      if (connData.style) {
        const styleMsg = new ConnectionStyleMessage();
        styleMsg.setStroke(connData.style.stroke);
        styleMsg.setStrokeWidth(parseFloat(connData.style.strokeWidth) || 1);
        styleMsg.setDashArray(connData.style.dashArray || 'none');
        styleMsg.setOpacity(parseFloat(connData.style.opacity) || 1);
        if (connData.style.index !== undefined) {
             styleMsg.setIndex(parseInt(connData.style.index, 10));
        }
        connMsg.setStyle(styleMsg);
      }
      workflowStateMessage.addConnections(connMsg);
    });
  }

  if (state.canvasScale !== undefined) {
    workflowStateMessage.setCanvasScale(parseFloat(state.canvasScale));
  }
  if (state.canvasOffset) {
    const offsetMsg = new PositionMessage();
    offsetMsg.setX(parseFloat(state.canvasOffset.x) || 0);
    offsetMsg.setY(parseFloat(state.canvasOffset.y) || 0);
    workflowStateMessage.setCanvasOffset(offsetMsg);
  }
  
  if (state.metadata && typeof state.metadata === 'object') {
    const metadataMap = workflowStateMessage.getMetadataMap();
    for (const key in state.metadata) {
      if (Object.prototype.hasOwnProperty.call(state.metadata, key)) {
        metadataMap.set(key, String(state.metadata[key]));
      }
    }
  }

  // 2. Serializzare il messaggio ProtoBuf
  const serializedData = workflowStateMessage.serializeBinary(); // Questo restituisce un Uint8Array

  // 3. Inviare i dati serializzati (come array di byte o base64) al processo main
  //    Poiché ipcRenderer.invoke potrebbe avere problemi con Uint8Array diretti,
  //    convertiamolo in un array di numeri o una stringa Base64.
  //    protobufjs non ha un toBase64 integrato, ma il Buffer Node.js sì.
  //    Nel renderer, potremmo doverlo fare manualmente o passare l'array.
  //    Per ora, passiamo l'Uint8Array e vediamo se il main lo gestisce (potrebbe essere convertito in Buffer lì).
  //    Oppure, il gestore main si aspetta 'content' come stringa (dal salvataggio JSON precedente).
  //    Dobbiamo allineare le aspettative. Modifichiamo il gestore main per accettare un buffer/array.

  if (window.api && window.api.saveWorkflowFile) {
    try {
      // Convertiamo Uint8Array in un normale array di numeri per il passaggio IPC
      const dataToSend = Array.from(serializedData); 
      const result = await window.api.saveWorkflowFile(finalFilename, dataToSend); // Passiamo l'array di byte

      if (result.success) {
        console.log(`Workflow (ProtoBuf) successfully saved to: ${result.filePath}`);
        if (typeof populateWorkflowSidebar === 'function') {
           if (window.api && window.api.ensureSynapseWorkflowsDir) {
            const wpPath = await window.api.ensureSynapseWorkflowsDir();
            if (wpPath) populateWorkflowSidebar(wpPath);
            else console.warn("Could not get workflowsPath to refresh sidebar after save.");
          } else {
            console.warn("API to get workflowsPath not available for sidebar refresh.");
          }
        } else {
          console.warn('populateWorkflowSidebar function is not available to refresh file list.');
        }
      } else {
        console.error('Error saving workflow file (ProtoBuf) via API:', result.error);
        alert(`Errore nel salvataggio del workflow (ProtoBuf): ${result.error}`);
      }
    } catch (error) {
      console.error('Exception when calling saveWorkflowFile (ProtoBuf):', error);
      alert(`Errore critico durante il salvataggio del workflow (ProtoBuf): ${error.message}`);
    }
  } else {
    console.warn('window.api.saveWorkflowFile is not available. Cannot save in ProtoBuf format via API.');
    alert("API di salvataggio non disponibile. Impossibile salvare il workflow.");
    // Qui non c'è un fallback semplice al download simulato perché i dati sono binari
  }
}

// Assicurati che saveWorkflowToFile sia disponibile globalmente se chiamata da altri moduli/eventi
if (window.workflowFunctions) {
  window.workflowFunctions.saveWorkflowToFile = saveWorkflowToFile;
} else {
  window.workflowFunctions = { saveWorkflowToFile };
}

// Helper function to convert ProtoBuf WorkflowState message to JS object
function protoStateToJsState(protoState) {
  const jsState = {
    id: protoState.getId(),
    notes: [],
    connections: [],
    canvasScale: protoState.getCanvasScale(),
    canvasOffset: null,
    metadata: {}
  };

  if (protoState.hasCanvasOffset()) {
    const offsetMsg = protoState.getCanvasOffset();
    jsState.canvasOffset = { x: offsetMsg.getX(), y: offsetMsg.getY() };
  }

  protoState.getNotesList().forEach(noteMsg => {
    const noteData = {
      id: noteMsg.getId(),
      title: noteMsg.getTitle(),
      position: null,
      size: null,
      content: JSON.parse(noteMsg.getContent() || 'null') // Contenuto era JSON
    };
    if (noteMsg.hasPosition()) {
      const posMsg = noteMsg.getPosition();
      noteData.position = { x: posMsg.getX(), y: posMsg.getY() };
    }
    if (noteMsg.hasSize()) {
      const sizeMsg = noteMsg.getSize();
      noteData.size = { width: sizeMsg.getWidth(), height: sizeMsg.getHeight() };
    }
    jsState.notes.push(noteData);
  });

  protoState.getConnectionsList().forEach(connMsg => {
    const connData = {
      id: connMsg.getId(),
      startElementId: connMsg.getStartElementId(),
      startPortPosition: connMsg.getStartPortPosition(),
      endElementId: connMsg.getEndElementId(),
      endPortPosition: connMsg.getEndPortPosition(),
      label: connMsg.hasLabel() ? connMsg.getLabel() : undefined,
      style: null
    };
    if (connMsg.hasStyle()) {
      const styleMsg = connMsg.getStyle();
      connData.style = {
        stroke: styleMsg.getStroke(),
        strokeWidth: styleMsg.getStrokeWidth(),
        dashArray: styleMsg.getDashArray(),
        opacity: styleMsg.getOpacity(),
        index: styleMsg.getIndex()
      };
    }
    jsState.connections.push(connData);
  });
  
  const metadataMap = protoState.getMetadataMap();
  metadataMap.forEach((v, k) => {
    jsState.metadata[k] = v;
  });

  return jsState;
}

// Funzione per caricare un workflow da un file .syn (versione ProtoBuf)
// workflowId è ancora passato per compatibilità o per identificare il tab/contesto del workflow
window.workflowFunctions.loadWorkflowFromFile = async function(workflowId, fileNameToLoad) {
  console.log(`Attempting to load workflow (ProtoBuf) from file: ${fileNameToLoad}`);

  let WorkflowStateProto;
  try {
    const protoMessages = require('../common/generated_protos/workflow_pb.js');
    WorkflowStateProto = protoMessages.WorkflowState;
  } catch (e) {
    console.error("Failed to load ProtoBuf modules for loading.", e);
    alert("Errore critico: Impossibile caricare i moduli per il caricamento del workflow.");
    return;
  }

  if (!fileNameToLoad) {
    // Se fileNameToLoad non è fornito, potremmo usare il vecchio metodo di selezione file
    // Ma per ora, ci aspettiamo che venga fornito (es. dalla sidebar)
    console.error("No filename provided to loadWorkflowFromFile.");
    alert("Nessun file specificato per il caricamento.");
    return;
  }

  if (window.api && window.api.loadWorkflowFile) {
    try {
      const result = await window.api.loadWorkflowFile(fileNameToLoad);

      if (result.success && result.data) {
        const byteArray = new Uint8Array(result.data);
        const workflowStateMessage = WorkflowStateProto.deserializeBinary(byteArray);
        
        // Converti il messaggio ProtoBuf in un oggetto JS
        const jsState = protoStateToJsState(workflowStateMessage);
        
        console.log(`Workflow (ProtoBuf) '${fileNameToLoad}' loaded and parsed successfully.`);
        
        // Carica lo stato JS nell'applicazione
        // Assumendo che loadWorkflowState esista e accetti un oggetto JS.
        // Il primo argomento di loadWorkflowState è l'ID del workflow, 
        // che potrebbe essere workflowId passato o jsState.id.
        window.workflowFunctions.loadWorkflowState(workflowId || jsState.id, jsState);

      } else {
        console.error(`Error loading workflow file '${fileNameToLoad}' via API:`, result.error);
        alert(`Errore nel caricamento del workflow '${fileNameToLoad}': ${result.error}`);
      }
    } catch (error) {
      console.error(`Exception when calling loadWorkflowFile for '${fileNameToLoad}':`, error);
      alert(`Errore critico durante il caricamento del workflow '${fileNameToLoad}': ${error.message}`);
    }
  } else {
    console.warn('window.api.loadWorkflowFile is not available. Cannot load ProtoBuf file via API.');
    alert("API di caricamento non disponibile. Impossibile caricare il workflow.");
  }
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