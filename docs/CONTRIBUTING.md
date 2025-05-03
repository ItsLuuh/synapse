# Contribuire a Synapse

Grazie per il tuo interesse a contribuire a Synapse! Questo documento fornisce linee guida su come partecipare al progetto.

## Processo di contribuzione

1. **Fork della repository** - Crea una copia personale del progetto su GitHub.

2. **Clona il fork** - Clona il tuo fork sul tuo computer locale:
   ```bash
   git clone https://github.com/TUO-USERNAME/synapse.git
   cd synapse
   ```

3. **Crea un branch dedicato** - Crea un branch separato per ogni feature o fix:
   ```bash
   git checkout -b feature/nome-feature
   ```
   Usa prefissi come `feature/`, `fix/`, o `docs/` per descrivere il tipo di lavoro.

4. **Effettua le modifiche** - Implementa i tuoi cambiamenti seguendo le convenzioni di codice (vedi sotto).

5. **Committi le modifiche** - Utilizza messaggi di commit descrittivi:
   ```bash
   git commit -m "Feature: Aggiungi funzionalità di drag & drop per i widget"
   ```

6. **Pusha al tuo fork** - Carica i tuoi cambiamenti:
   ```bash
   git push origin feature/nome-feature
   ```

7. **Apri una Pull Request** - Visita il repository originale e crea una Pull Request dal tuo branch.

## Convenzioni di codice

### JavaScript / Electron

- Usa 2 spazi per l'indentazione
- Usa semicolons (;) alla fine delle dichiarazioni
- Usa single quotes (') per le stringhe
- Aggiungi commenti per codice complesso
- Segui il pattern camelCase per le variabili e le funzioni
- Segui il pattern PascalCase per le classi

### CSS / UI

- Usa classi semantiche
- Organizza i selettori CSS per componenti
- Minimizza la specificità quando possibile
- Utilizza variabili CSS per colori e dimensioni ricorrenti

### Commenti e documentazione

- Documenta le nuove funzionalità con commenti JSDoc
- Aggiorna la documentazione quando necessario
- Includi screenshot per cambiamenti all'interfaccia

## Pull Request

Una buona Pull Request include:

- Un titolo chiaro e descrittivo
- Una descrizione dettagliata del cambiamento
- Riferimenti a issue correlate
- Se necessario, screenshot o GIF che mostrano le modifiche
- Test per nuove funzionalità

## Segnalazione bug

Per segnalare un bug, usa il sistema di issue di GitHub e includi:

- Passi dettagliati per riprodurre il problema
- Comportamento atteso vs comportamento osservato
- Screenshot o GIF se applicabile
- Informazioni sul sistema (OS, versione di Node.js, ecc.)

## Richieste di funzionalità

Le richieste di nuove funzionalità sono benvenute! Fornisci:

- Una descrizione chiara della funzionalità
- La motivazione (perché questa funzionalità è utile)
- Eventuali implementazioni simili in altri progetti

## Domande?

Se hai domande sul processo di contribuzione, contatta il team di sviluppo su info@synapseapp.com o apri un'issue con il tag "domanda". 