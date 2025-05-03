# Synapse

<div align="center">
  <img src="icons/project-logo.png" alt="Synapse Logo" width="200"/>
  <p><em>Lo strumento definitivo per migliorare la tua efficienza lavorativa</em></p>
</div>

## Panoramica

Synapse è un'applicazione desktop moderna sviluppata con Electron che integra potenti strumenti per migliorare il flusso di lavoro e la produttività. Con un'interfaccia utente intuitiva e personalizzabile, Synapse offre un ambiente di lavoro completo con widget, calendario, note, gestione attività e molto altro.

### Funzionalità principali

- **Dashboard personalizzabile**: Trascina e rilascia i widget per creare la tua area di lavoro ideale
- **Widget multipli**: Note, liste di attività, calendario, media player e molto altro
- **Integrazione AI**: Supporto avanzato con Neuromorphic Semantic Network (NSN)
- **Sincronizzazione cloud**: Mantieni i tuoi dati sincronizzati su tutti i tuoi dispositivi
- **Interfaccia moderna**: UI moderna e reattiva con temi personalizzabili

## Installazione

### Prerequisiti

- Node.js (versione 16 o superiore)
- npm (incluso con Node.js)

### Installazione per sviluppo

1. Clona la repository
```bash
git clone https://github.com/ItsLuuh/synapse.git
cd synapse
```

2. Installa le dipendenze
```bash
npm install
```

3. Avvia l'applicazione in modalità sviluppo
```bash
npm start
```

### Build per produzione

Per creare un pacchetto installabile:

```bash
npm run build
```

Questo creerà i file di installazione nella cartella `dist/`.

## Struttura del progetto

```
synapse/
├── src/                    # Codice sorgente
│   ├── ai/                 # Moduli di intelligenza artificiale
│   ├── main/               # Processo principale di Electron
│   ├── renderer/           # Processo di rendering UI
│   └── services/           # Servizi condivisi
├── icons/                  # Risorse grafiche
├── docs/                   # Documentazione
└── dist/                   # Build di distribuzione (generata)
```

## Contribuire

Siamo felici di ricevere contributi! Per favore, segui questi passaggi:

1. Fai un fork della repository
2. Crea un branch per la tua feature (`git checkout -b feature/amazing-feature`)
3. Fai commit delle tue modifiche (`git commit -m 'Aggiungi una feature incredibile'`)
4. Pusha al branch (`git push origin feature/amazing-feature`)
5. Apri una Pull Request

Per maggiori dettagli, consulta il file [CONTRIBUTING.md](docs/CONTRIBUTING.md).

## Licenza

Distribuito sotto licenza MIT. Vedi [LICENSE](LICENSE) per maggiori informazioni.

## Contatti

Synapse Team - info@synapseapp.com

Link al progetto: [https://github.com/ItsLuuh/synapse](https://github.com/ItsLuuh/synapse) 