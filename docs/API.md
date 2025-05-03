# API di Synapse

Questo documento descrive le API disponibili in Synapse, sia per l'integrazione di servizi esterni che per lo sviluppo di plugin e widget.

## API del processo Main

### Gestione sessione

```javascript
// Ottieni lo stato della sessione
ipcMain.handle('get-session', async () => {
  return sessionManager.getSession();
});

// Imposta la sessione
ipcMain.handle('set-session', async (event, session) => {
  return sessionManager.setSession(session);
});

// Termina la sessione
ipcMain.handle('end-session', async () => {
  return sessionManager.clearSession();
});
```

### File system

```javascript
// Leggi un file
ipcMain.handle('read-file', async (event, path) => {
  return fs.readFileSync(path, 'utf8');
});

// Scrivi un file
ipcMain.handle('write-file', async (event, path, content) => {
  fs.writeFileSync(path, content);
  return true;
});
```

## API di Widget

### Registrazione Widget

```javascript
// Registra un nuovo widget
synapse.registerWidget({
  id: 'my-custom-widget',
  name: 'My Custom Widget',
  category: 'tools',
  icon: 'custom-icon',
  description: 'Una breve descrizione',
  component: MyWidgetComponent,
  defaultSize: { width: 2, height: 2 }
});
```

### Widget Storage

```javascript
// Salva dati del widget
widget.saveData('key', value);

// Leggi dati del widget
const value = widget.getData('key');
```

## API di Neuromorphic Semantic Network (NSN)

L'API NSN fornisce accesso ai servizi di intelligenza artificiale integrati. I servizi sono accessibili tramite REST API.

### Endpoints

#### Process Input

```
POST /api/nsn/process
```

Attiva un neurone con l'input specificato e restituisce il percorso di attivazione se viene generato uno spike.

**Request Body:**
```json
{
  "concept": "Quantum Mechanics",
  "current": 1.5
}
```

**Response:**
```json
{
  "spike": true,
  "activation_path": ["Cellular Respiration"]
}
```

#### Get Concepts

```
GET /api/nsn/concepts
```

Restituisce tutti i concetti disponibili organizzati per sezione cerebrale.

**Response:**
```json
{
  "Physics": ["Quantum Mechanics"],
  "Biology": ["Cellular Respiration"]
}
```

## Esempi di integrazione

### Creazione di un widget personalizzato

```javascript
// my-custom-widget.js
class MyCustomWidget extends Widget {
  constructor(options) {
    super(options);
    this.initialize();
  }
  
  initialize() {
    // Inizializzazione del widget
    this.render();
  }
  
  render() {
    // Rendering dell'interfaccia
    this.container.innerHTML = `
      <div class="widget-header">
        <h3>Il mio widget</h3>
      </div>
      <div class="widget-content">
        <p>Contenuto del widget</p>
        <button id="action-btn">Azione</button>
      </div>
    `;
    
    // Gestione eventi
    this.container.querySelector('#action-btn')
      .addEventListener('click', this.handleAction.bind(this));
  }
  
  handleAction() {
    // Logica dell'azione
    console.log('Azione eseguita');
  }
}

// Registrazione del widget
synapse.registerWidget({
  id: 'my-custom-widget',
  name: 'Il mio widget',
  component: MyCustomWidget
});
```

## Risorse aggiuntive

- [Documentazione completa](https://synapseapp.com/docs/api)
- [Esempi di widget](https://github.com/synapseapp/widget-examples)
- [SDK di sviluppo](https://github.com/synapseapp/synapse-sdk) 