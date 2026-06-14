# Oltre la Mappa - Le Isole che si Allontanano

Un'avventura narrativa per piccoli e grandi esploratori, giocabile nel browser. Niente dadi: si va avanti con le **scelte** (stile libro-game) e si superano le prove con **minigiochi**. Tono caldo e gentile, ispirato a Undertale ma senza cinismo e piu' facile.

E' una versione completamente nuova e separata da *Piccoli Eroi 2* (che usa il sistema d20 classico e resta intatto).

## Come si gioca

All'inizio scegli due cose:

- **Modalita di lettura**: "8-12 anni" (testi piu' ricchi) o "Famiglia / tutti" (testi piu' semplici e dolci).
- **Difficolta**: Facile, Medio o Difficile. Regola la velocita dei minigiochi, i tentativi, il numero di opzioni negli enigmi e i timer.

Poi navighi la **mappa del mare** e visiti le isole una alla volta. Ogni isola alterna storia, scelte e minigiochi. Completare un'isola costruisce un **ponte di luce** che sblocca la successiva.

Non si "perde" mai in modo frustrante: un minigioco fallito fa semplicemente riprovare.

## I minigiochi (riusabili)

1. **Tempismo** (`rhythm`): ferma il cursore nella zona giusta al momento giusto. Supporta un tema "miccia" (`theme: 'fuse'`) con miccia visibile, acciarino come cursore e stoppino come bersaglio.
2. **Movimento/Mira** (`aim`): muovi il personaggio per raccogliere gli oggetti buoni ed evitare quelli cattivi. Frecce, A/D, trascinamento e pulsanti a schermo.
3. **Logica** (`logic`): indovinelli a scelta multipla. In difficile aumentano le opzioni e compare un timer.
4. **Memory** (`memory`): trova le coppie uguali. La difficolta regola numero di coppie, sbirciata iniziale ed errori concessi.

Tutti i minigiochi d'azione hanno un conto alla rovescia 3-2-1 e un ritmo crescente. Prima di ogni prova si puo' scegliere la difficolta al volo.

## Grafica

Gli sprite sono pixel art "32 bit" (palette con luci e ombre) disegnati su canvas da griglie di caratteri in `js/sprites.js`, stessa tecnica di Piccoli Eroi 2. Stile, palette e font (Press Start 2P) sono allineati a Piccoli Eroi 2. Su ogni schermata ci sono i pulsanti fissi Salva (icona floppy), ? (aiuto) e audio.

## La storia (v1)

Il mare di Sottoonda si sta allargando e le isole si allontanano. Con l'aiuto di **Bussola**, una bussola parlante, riaccendi il faro, ricucisci i ponti tra le isole e scopri perche' il "canto" che le teneva unite si e' spezzato. Due finali diversi: quello buono richiede di scegliere la gentilezza invece della scorciatoia.

Isole presenti: Isola del Faro (completa), Mercato Galleggiante, Isola delle Nebbie, Cuore del Mare (finale con due epiloghi).

## Architettura (data-driven)

Aggiungere contenuti = scrivere dati, non codice.

```
oltrelamappa/
├── index.html
├── css/style.css
├── manifest.webmanifest, sw.js   (PWA installabile, funziona offline)
├── icons/
└── js/
    ├── main.js              bootstrap + router schermate (titolo, setup, mappa, codice, installa)
    ├── state.js             stato, impostazioni, salvataggio (localStorage + codice partita)
    ├── audio.js             effetti sonori chiptune (Web Audio, niente file)
    ├── story.js             motore narrativo: rende nodi, scelte, minigiochi
    ├── minigames/
    │   ├── index.js         registro: aggiungi qui un nuovo tipo di prova
    │   ├── rhythm.js  aim.js  logic.js
    └── content/
        ├── islands.js       dati della mappa (isole, posizioni, sblocchi)
        └── story.js         TUTTI i testi e i nodi della storia  <- qui si scrive
```

### Aggiungere una tappa alla storia

In `js/content/story.js` ogni nodo ha questa forma:

```js
nodo_id: {
  speaker: 'Bussola',
  text: [
    { famiglia: 'testo semplice', ragazzi: 'testo piu ricco' },  // o una stringa unica
  ],
  choices: [
    { label: 'Scelta A', next: 'altro_nodo', set: { flag: true }, stars: 2 },
  ],
}
```

Un nodo con minigioco:

```js
nodo_id: {
  text: 'Introduzione alla prova...',
  minigame: {
    type: 'logic',                 // rhythm | aim | logic
    config: { /* parametri della prova */ },
    win: 'nodo_vittoria',
    winText: '...', loseText: '...',
    skipTo: 'nodo_alternativo',    // opzionale: bottone "salta" dopo un fallimento
  },
}
```

`{nome}` viene sostituito col nome dell'eroe. I testi non usano mai trattini lunghi.

## Provare in locale

I moduli ES richiedono un server HTTP (doppio clic su index.html non basta):

```bash
cd oltrelamappa
python -m http.server 8080
# poi apri http://localhost:8080
```

## Pubblicare su GitHub Pages

Questo gioco e' pensato come **repository separato** da `piccolieroi2` (per questo e' escluso dal `.gitignore` del repo padre).

1. Crea il repository `oltrelamappa` su GitHub.
2. Da questa cartella: `git init`, commit, push sul branch `main`.
3. Su GitHub: Settings, Pages, Source = "Deploy from a branch", Branch = `main` / root.
4. Il gioco sara' su `https://TUONOME.github.io/oltrelamappa/`.

Nessun build step: tutto HTML/CSS/JS vanilla.

---

Un gioco di Enrico, per piccoli e grandi esploratori.
