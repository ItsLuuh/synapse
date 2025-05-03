# Architettura di Synapse

Questo documento descrive l'architettura e i design pattern utilizzati in Synapse.

## Panoramica

Synapse è costruita su Electron, un framework che permette di costruire applicazioni desktop utilizzando tecnologie web. L'applicazione segue un'architettura a processi multipli tipica di Electron:

1. **Processo Main** - Responsabile della gestione del ciclo di vita dell'applicazione, dell'interazione con il sistema operativo e della gestione delle finestre.
2. **Processo Renderer** - Gestisce l'interfaccia utente e tutte le interazioni con l'utente.

## Architettura del Processo Main

```
src/main/
├── main.js               # Entry point del processo main
├── preload.js            # Script di preload per il renderer
└── session-manager.js    # Gestione delle sessioni utente
```

Il processo Main segue il pattern Singleton e fornisce servizi al processo Renderer tramite IPC (Inter-Process Communication).

### Principali responsabilità:

- Creazione e gestione delle finestre dell'applicazione
- Gestione del ciclo di vita dell'applicazione (avvio, chiusura, etc.)
- Autenticazione e gestione delle sessioni
- Comunicazione con API esterne
- Operazioni di filesystem

## Architettura del Processo Renderer

```
src/renderer/
├── index.html            # Entry HTML per il processo renderer
├── renderer.js           # Script principale dell'applicazione
├── landing-page.html     # Pagina iniziale con widget
├── workflow.js           # Gestione del flusso di lavoro
└── components/           # Componenti UI riutilizzabili
```

Il processo Renderer è strutturato seguendo un pattern simile a MVC (Model-View-Controller):

- **Model**: Gestione dei dati e dello stato dell'applicazione
- **View**: Componenti di interfaccia utente (HTML, CSS)
- **Controller**: Logica di business e gestione eventi

### Widget System

Synapse implementa un sistema di widget flessibile e modulare:

```
Widget Base
  ├── Notes Widget
  ├── Tasks Widget
  ├── Calendar Widget
  ├── Media Widget
  └── Custom Widgets
```

Ogni widget:
- Estende una classe base Widget
- Gestisce il proprio stato e storage
- Implementa eventi per drag & drop e resize
- Può comunicare con altri widget tramite un sistema di eventi

## Servizi Condivisi

```
src/services/
├── api-services.js       # Chiamate API verso servizi esterni
├── storage-service.js    # Persistenza dei dati locali
└── google-auth-service.js # Autenticazione con Google
```

I servizi seguono il pattern di Dependency Injection e forniscono funzionalità trasversali a tutta l'applicazione.

## Subsystems

### Sistema di Storage

Utilizziamo diversi livelli di storage:

1. **Session Storage**: Per dati temporanei della sessione
2. **LocalStorage**: Per preferenze utente e configurazioni persistenti
3. **File System**: Per documenti, note e dati strutturati

### Sistema di Autenticazione

Supportiamo diversi metodi di autenticazione:

1. **Locale**: Username e password salvati localmente
2. **OAuth**: Integrazione con Google, Microsoft, ecc.

### Neuromorphic Semantic Network (NSN)

La componente AI è implementata come un sottosistema separato in Python:

```
src/ai/
├── nsn_engine.py         # Implementazione core della rete neurale
├── nsn_web_integration.py # Integrazione web per NSN
└── web_scraper.py        # Strumenti per l'acquisizione dati
```

## Flusso di dati

```
┌─────────────┐    IPC     ┌─────────────┐
│  Main       │◄─────────►│  Renderer   │
│  Process    │            │  Process    │
└─────┬───────┘            └─────┬───────┘
      │                          │
      │                          │
      ▼                          ▼
┌─────────────┐           ┌─────────────┐
│  External   │           │  User       │
│  Services   │           │  Interface  │
└─────────────┘           └─────────────┘
```

## Tecnologie chiave

- **Electron**: Framework dell'applicazione
- **HTML/CSS/JavaScript**: Frontend UI
- **Node.js**: Backend e servizi di sistema
- **Python**: Per il subsystem NSN
- **Sortable.js**: Implementazione drag & drop
- **Marked**: Rendering Markdown
- **Electron Store**: Persistenza dati

## Decisioni architetturali

### Perché Electron?

Abbiamo scelto Electron per:
- Sviluppo cross-platform
- Riutilizzo delle competenze web
- Accesso alle API di sistema
- Ricco ecosistema di librerie

### Separazione dei processi

La separazione tra processo Main e Renderer migliora:
- Sicurezza (sandbox del renderer)
- Stabilità (crash isolati)
- Prestazioni (multithreading)

### Architettura modulare dei widget

Il sistema di widget modulare permette:
- Estensibilità semplice
- Aggiornamenti indipendenti
- Configurabilità per l'utente finale 