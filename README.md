# Eco Fidato

Guida da smartphone per persone cieche e ipovedenti. Rileva ostacoli e oggetti in movimento, continua a seguirli quando restano nascosti per un momento, e avvisa solo dei pericoli: con una vibrazione, un suono e una parola che dice cos'è ("Bici in arrivo da destra"). Quando un oggetto è nascosto dice "Probabile". Quando la visione cala dice "Non vedo bene".

Funziona interamente sul telefono. Le immagini non vengono salvate né inviate.

## Installare l'app

Apri `https://sabb19.github.io/Eco/` sul telefono.

- **iPhone**: apri il link in Safari, tocca Condividi e poi "Aggiungi a Home".
- **Android**: apri il link in Chrome e tocca "Installa app" (oppure il menu ⋮ e poi "Aggiungi a schermata Home").

L'app si apre a tutto schermo e chiede il permesso per la fotocamera quando tocchi "Avvia guida".

## Aggiornamenti

Non serve reinstallare. Ogni modifica caricata su `main` va online su GitHub Pages in circa un minuto. La volta successiva che apri l'app con internet, si carica la nuova versione. La versione installata è scritta in fondo a Impostazioni.

Senza internet l'app riapre l'ultima versione salvata.

## Struttura

| File | Cosa fa |
|---|---|
| `index.html` | Tutta l'app: interfaccia, tracciamento, fiducia, avvisi, orientamento |
| `model/` | Pesi del rilevatore COCO-SSD lite (estensione `.wasm` solo per compatibilità di hosting) |
| `sw.js` | Service worker: carica sempre la versione più recente, cache solo per l'offline |
| `manifest.webmanifest`, `icons/` | Installazione come app |

## Come riconosce i pericoli

- **Oggetti con un nome** (persone, bici, auto, panchine…): rilevatore COCO-SSD sul telefono, tracciamento con gestione delle occlusioni, stima di distanza e tempo all'impatto.
- **Ostacoli senza nome** (pali, gradini, cantieri): modello di profondità Depth Anything V2 Small in un worker, qualche immagine al secondo. Segnala ciò che sporge dal pavimento, vicino e davanti, anche senza sapere cos'è. Si scarica da Hugging Face la prima volta che avvii la guida; si spegne da Impostazioni.

## Accessibilità

- Pensata per chi non vede per niente e per chi vede poco: ordine fisso dei comandi, barra in basso sempre uguale, contrasto alto, ogni stato detto a voce.
- **Guida vocale ai tasti** per chi non usa VoiceOver o TalkBack: un tocco ascolti, due tocchi attivi. Al primo avvio l'app chiede se usi uno screen reader.

## Modalità giuria

Il tab "Giuria" mostra la scena con i box, lo stato di ogni oggetto (visto, probabile, perso), le metriche (FPS, latenza, oggetti ritrovati dopo l'occlusione, cambi di ID), una simulazione con buio e camera coperta, e la tabella "Perché è fatto così" che collega ogni scelta agli studi.

## Limiti noti

- Su iPhone il browser non può far vibrare il telefono: l'app usa solo suoni e voce, e lo dice all'avvio.
- La distanza è stimata dall'altezza del box (non c'è un sensore di profondità).
- Non sostituisce il bastone o il cane guida.
